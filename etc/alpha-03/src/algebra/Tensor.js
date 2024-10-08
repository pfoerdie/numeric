const
    util = require('@pfoerdie/utility'),
    /** @type {Map<string, Array>} Maps the size.toString() value to a size array. */
    sizeMap = new Map(),
    /** @type {Map<string, Array>} Maps the size.toString() value to an offset array. */
    offsetMap = new Map(),
    /** @type {WeakSet<Float64Array>} */
    assignedData = new WeakSet();

class Tensor {

    /**
     * @param {Array<number>|number|Float64Array} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|number} [data] The length of the data must be the product of the size.
     * @param {...Array<number>} [args] The rest arguments for the size, if a number is supplied.
     */
    constructor(size, data, ...args) {
        if (util.is.number(size)) {
            if (util.is.number(data)) {
                size = [size, data, ...args];
                data = undefined;
            } else {
                size = [size];
            }
        } else if (size instanceof Float64Array) {
            data = size;
            size = [data.length];
        }

        util.assert(util.is.array.nonempty(size) && size.every(util.is.number.integer.positive),
            'The size must only contain one or more integer greater than zero.');

        const length = size.reduce((acc, val) => acc * val, 1);
        if (data) {
            util.assert(data instanceof Float64Array && data.length === length,
                'The length of the data must be the product of the size.');
            util.assert(!assignedData.has(data),
                'The data has already been used to construct a Tensor.');
            /** @type {Float64Array} */
            this.data = data;
        } else {
            /** @type {Float64Array} */
            this.data = new Float64Array(length);
        }

        /** @type {number} */
        this.dim = size.length;
        const sizeStr = size.join(' ');
        if (sizeMap.has(sizeStr)) {
            /** @type {Array<number>} */
            this.size = sizeMap.get(sizeStr);
        } else {
            /** @type {Array<number>} */
            this.size = Object.freeze(Array.from(size));
            sizeMap.set(sizeStr, this.size);
        }

        if (offsetMap.has(sizeStr)) {
            /** @type {Array<number>} */
            this.offset = offsetMap.get(sizeStr);
        } else {
            const offset = new Array(this.dim);
            for (let i = 0; i < this.dim; i++) {
                let factor = 1;
                for (let j = i + 1; j < this.dim; j++) {
                    factor *= this.size[j];
                }
                offset[i] = factor;
            }
            /** @type {Array<number>} */
            this.offset = Object.freeze(offset);
            offsetMap.set(sizeStr, this.offset);
        }

        util.prop.lock.all(this);
        assignedData.add(this.data);
    } // Tensor#constructor

    /**
     * @param {...Tensor} summands 
     * @returns {Tensor} 
     */
    static sum(...summands) {
        util.assert(summands.length >= 2,
            'The tensor sum needs at least 2 summands.');
        util.assert(summands.every(summand => summand instanceof Tensor),
            'The tensor sum can only be solved with tensors.');
        util.assert(summands.every(summand => summand.size === summands[0].size),
            'The tensor sum can only be solved with equally sized tensors.');

        const
            sum = new Tensor(summands[0].size),
            length = summands[0].data.length;

        for (let summand of summands) {
            for (let key = 0; key < length; key++) {
                sum.data[key] += summand.data[key];
            }
        }

        return sum;
    } // Tensor.sum

    /**
     * @param {Tensor} basis 
     * @param {Tensor} factor 
     * @param {number} [degree=1]
     * @returns {Tensor} 
     */
    static product(basis, factor, degree = 1) {
        util.assert(basis instanceof Tensor && factor instanceof Tensor,
            'The tensor product can only be solved with tensors.');
        util.assert(util.is.number.integer.positive(degree),
            'The degree of the product must be an integer > 0.');
        util.assert(degree <= basis.dim && degree <= factor.dim,
            'The degree of the product must be equal or less than the tensors minimal dimension.');
        util.assert(degree < basis.dim || degree < factor.dim,
            'For a degree of the product equal to both the basis dimension and factor dimension use the scalar product instead.');
        util.assert(basis.size.slice(-degree).every((val, i) => factor.size[i] === val),
            'The last portion of the basis size must overlap the first portion of the factor size by a length equal to the degree.');

        const
            product = new Tensor([...basis.size.slice(0, -degree), ...factor.size.slice(degree)]),
            indices = (new Array(basis.dim + factor.dim - degree)).fill(0),
            size = [...basis.size, ...factor.size.slice(degree)],
            max = indices.length - 1,
            b_max = basis.dim - 1,
            f_min = basis.dim - degree,
            p_offset = factor.offset[degree - 1] - 1;

        let
            pos = max,
            p_key = 0,
            b_key = 0,
            f_key = 0;

        main_loop: while (true) {
            product.data[p_key] += basis.data[b_key] * factor.data[f_key];

            while (indices[pos] === size[pos] - 1) {
                if (pos > 0) pos--;
                else break main_loop;
            }

            if (pos > b_max) {
                p_key++;
                f_key++;
            } else if (pos < f_min) {
                p_key++;
                b_key++;
                f_key = 0;
            } else {
                p_key -= p_offset;
                b_key++;
                f_key++;
            }

            indices[pos]++;
            while (pos < max) {
                pos++;
                indices[pos] = 0;
            }
        }

        return product;
    } // Tensor.product

    /**
     * @param {...Tensor} factors 
     * @returns {number} 
     */
    static scalarProduct(...factors) {
        util.assert(factors.length >= 2,
            'The tensor scalar product needs at least 2 factors.');
        util.assert(factors.every(factor => factor instanceof Tensor),
            'The tensor scalar product can only be solved with tensors.');
        util.assert(factors.every(factor => factor.size === factors[0].size),
            'The tensor scalar product can only be solved with equally sized tensors.');

        const length = factors[0].data.length;
        let sum = 0;

        for (let key = 0; key < length; key++) {
            let product = factors[0].data[key];
            for (let k = 1; k < factors.length; k++) {
                product *= factors[k].data[key];
            }
            sum += product;
        }

        return sum;
    } // Tensor.scalarProduct

    /**
     * @param {...Tensor} factors 
     * @returns {Tensor} 
     */
    static entrywiseProduct(...factors) {
        util.assert(factors.length >= 2,
            'The tensor entrywise product needs at least 2 factors.');
        util.assert(factors.every(factor => factor instanceof Tensor),
            'The tensor entrywise product can only be solved with tensors.');
        util.assert(factors.every(factor => factor.size === factors[0].size),
            'The tensor entrywise product can only be solved with equally sized tensors.');

        const
            product = new Tensor(factors[0].size),
            first = factors.shift(),
            length = first.data.length;

        for (let key = 0; key < length; key++) {
            product.data[key] = first.data[key];
        }
        for (let factor of factors) {
            for (let key = 0; key < length; key++) {
                product.data[key] *= factor.data[key];
            }
        }

        return product;
    } // Tensor.entrywiseProduct

    /**
     * @param {number} factor 
     * @returns {this}
     */
    scale(factor) {
        util.assert(util.is.number(factor),
            'Scaling a tensor requires a number.');
        for (let key = 0, length = this.data.length; key < length; key++) {
            this.data[key] *= factor;
        }
        return this;
    } // Tensor#scale

    // IDEA Tensor#add
    // TODO other inplace methods

    /**
     * The first value of an entry is the key in the data,
     * the second value is the value of the data at that location
     * and all following values are the indices of the tensor.
     * @returns {Iterator<[number, number, ...Array<number>]>} [key, value, ...indices]
     */
    * entries() {
        const indices = (new Array(this.dim)).fill(0), max = indices.length - 1;
        for (let key = 0, pos = max; key < this.data.length; key++) {
            yield [key, this.data[key], ...indices];
            while (indices[pos] === this.size[pos] - 1) {
                pos--;
            }
            indices[pos]++;
            while (pos < max) {
                pos++;
                indices[pos] = 0;
            }
        }
    } // Tensor#entries

    /**
     * @param  {...number|Array<number>} indices 
     * @returns {number}
     */
    keyAt(...indices) {
        if (util.is.array(indices[0])) indices = indices[0];
        util.assert(indices.length === this.dim,
            'The indices must have a length equal to the dimension of the tensor.');
        util.assert(indices.every((val, i) => util.is.number.integer.nonnegative(val) && val < this.size[i]),
            'The indices must be nonnegative integers less than the size of the tensor.');

        let key = 0;
        for (let pos = 0; pos < indices.length; pos++) {
            key += indices[pos] * this.offset[pos];
        }
        return key;
    } // Tensor#keyAt

    /**
     * @param  {...number|Array<number>} indices 
     * @returns {number}
     */
    dataAt(...indices) {
        const key = this.keyAt(...indices);
        return this.data[key];
    } // Tensor#dataAt

    /**
     * @param {number} key 
     * @returns {Array<number>}
     */
    indicesFor(key) {
        util.assert(util.is.number.integer.nonnegative(key) && key < this.data.length,
            'The key must be a nonnegative integer less than the length of the tensor data.');

        const indices = (new Array(this.dim)).fill(0);
        for (let pos = 0; pos < indices.length; pos++) {
            indices[pos] = key % this.offset[pos];
            key -= indices[pos];
        }
        return indices;
    } // Tensor#indicesFor

    /**
     * @returns {Array<number|Array>}
     */
    toArray() {
        const dataArr = new Array(this.size[0]);
        for (let [key, value, ...indices] of this.entries()) {
            let target = dataArr, max = indices.length - 1;
            for (let pos = 0; pos < max; pos++) {
                let index = indices[pos];
                if (!target[index])
                    target[index] = new Array(this.size[pos + 1]);
                target = target[index];
            }
            target[indices[max]] = value;
        }
        return dataArr;
    } // Tensor#toArray

    /**
     * @param {Array<number|Array>} dataArr 
     * @returns {Tensor}
     */
    static fromArray(dataArr) {
        util.assert(util.is.array(dataArr), 'The dataArr must be an array.');
        let size = [], temp = dataArr;
        while (util.is.array(temp)) {
            size.push(temp.length);
            temp = temp[0];
        }
        const result = new Tensor(size);
        for (let [key, value, ...indices] of result.entries()) {
            let target = dataArr, max = indices.length - 1;
            for (let pos = 0; pos < max; pos++) {
                let index = indices[pos];
                util.assert(util.is.array(target[index]) && target[index].length === size[pos + 1],
                    'Expected an array of length ' + size[pos + 1] + ' at position ' + indices.slice(0, pos - max).reduce((acc, val) => acc + '[' + val + ']', '') + '.');
                if (!target[index])
                    target[index] = new Array(this.size[pos + 1]);
                target = target[index];
            }
            util.assert(util.is.number(target[indices[max]]),
                'Expected a number at position ' + indices.reduce((acc, val) => acc + '[' + val + ']', '') + '.');
            result.data[key] = target[indices[max]];
        }
        return result;
    } // Tensor.fromArray

    /**
     * @returns {{type: 'Tensor', size: Array<number>, data: Array<number>}}
     */
    toJSON() {
        return {
            type: 'Tensor',
            size: Array.from(this.size),
            data: Array.from(this.data)
        };
    } // Tensor#toJSON

    /**
     * @param {{type: 'Tensor', size: Array<number>, data: Array<number>}|String} json 
     * @returns {Tensor} 
     */
    static fromJSON(json) {
        if (util.is.string(json)) json = JSON.parse(json);
        util.assert(util.is.object(json) && json.type === 'Tensor',
            'The json must be a serialized Tensor.');
        const size = Array.from(json.size), data = Float64Array.from(json.data);
        return new Tensor(size, data);
    } // Tensor.fromJSON

} // Tensor

module.exports = Tensor;