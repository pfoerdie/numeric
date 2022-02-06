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
     * TODO document and decide to make public
     * @param  {...number|Array<number>} indices 
     * @returns {number}
     */
    _getDataIndex(...indices) {
        if (util.is.array(inidices[0])) indices = inidices[0];
        util.assert(inidices.every((val, i) => util.is.number.integer.nonnegative(val) && val < this.size[i]),
            'The indices must be nonnegative integers less than the size of the tensor.');
        util.assert(inidices.length === this.dim,
            'The indices must have a length equal to the dimension of the tensor.');

        let index = 0;
        for (let pos = 0; pos < indices.length; pos++) {
            index += indices[pos] * this.offset[pos];
        }
        return index;
    } // Tensor#_getDataIndex

    /**
     * TODO document and decide to make public
     * @param {number} index 
     * @returns {Array<number>}
     */
    _getIndices(index) {
        util.assert(util.is.number.integer.nonnegative(index) && index < this.data.length,
            'The index must be a nonnegative integer less than the length of the tensor data.');

        const indices = (new Array(this.dim)).fill(0);
        for (let pos = 0; pos < indices.length; pos++) {
            indices[pos] = index % this.offset[pos];
            index -= indices[pos];
        }
        return indices;
    } // Tensor#_getIndices

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

        const sum = new Tensor(summands[0].size);
        for (let summand of summands) {
            for (let index = 0, max = summand.data.length; index < max; index++) {
                sum.data[index] += summand.data[index];
            }
        }
        return sum;
    } // Tensor.sum

    /**
     * TODO document
     * NOTE maybe the degree can also be zero
     * @param {Tensor} basis 
     * @param {Tensor} factor 
     * @param {number} [degree=1]
     * @returns {Tensor|number} 
     */
    static product(basis, factor, degree = 1) {
        util.assert(basis instanceof Tensor && factor instanceof Tensor,
            'The tensor product can only be solved with tensors.');
        util.assert(util.is.number.integer.positive(degree),
            'The degree of the product must be an integer > 0.');
        util.assert(degree <= basis.dim && degree <= factor.dim,
            'The degree of the product must be equal or less than the tensors minimal dimension.');
        util.assert(basis.size.slice(-degree).every((val, i) => factor.size[i] === val),
            'The last portion of the basis size must overlap the first portion of the factor size by a length equal to the degree.');

        if (basis.dim === degree && factor.dim === degree) {
            let product = 0;
            for (let index = 0, max = basis.data.length; index < max; index++) {
                product += basis.data[index] * factor.data[index];
            }
            return product;
        }

        if (false) {
            // TODO remove when fixed
            const product = new Tensor(...basis.size.slice(0, -degree), ...factor.size.slice(degree));
            for (let [b_index, b_value, ...b_indices] of basis.entries()) {
                indexLoop: for (let [f_index, f_value, ...f_indices] of factor.entries()) {
                    // NOTE This is not efficient and the algorithm should be rewritten, so it does not need
                    //      the following check and iterate unnecessarily over those indices.
                    for (let k = 1; k <= degree; k++) {
                        if (b_indices[b_indices.length - k] !== f_indices[degree - k])
                            continue indexLoop;
                    }
                    const indices = [...b_indices.slice(0, -degree), ...f_indices.slice(degree)];
                    // NOTE The calculation of the product index can also be reduced with clever iteration.
                    let index = 0;
                    for (let i = 0; i < indices.length; i++) {
                        index += indices[i] * product.offset[i];
                    }
                    product.data[index] += b_value * f_value;
                }
            }
            return product;
        }

        const
            product = new Tensor([...basis.size.slice(0, -degree), ...factor.size.slice(degree)]),
            indices = (new Array(basis.dim + factor.dim - degree)).fill(0),
            size = [...basis.size, ...factor.size.slice(degree)],
            max = indices.length - 1,
            b_max = basis.dim - 1,
            f_min = basis.dim - degree;

        let
            pos = max,
            p_index = 0,
            b_index = 0,
            f_index = 0;

        indexLoop: while (true) {
            product.data[p_index] += basis.data[b_index] * factor.data[f_index];

            while (indices[pos] === size[pos] - 1) {
                if (pos > 0) pos--;
                else break indexLoop;
            }

            // TODO fix!!!
            if (pos > b_max) {
                p_index++;
                f_index++;
            } else if (pos < f_min) {
                p_index++;
                b_index++;
                f_index = 0;
            } else {
                // p_index -= product.offset[f_min];
                // p_index -= product.offset[f_min + 1];
                // p_index -= product.offset[f_min - 1];
                // p_index -= product.offset[pos];
                // p_index -= product.offset[pos + 1];
                // p_index -= product.offset[pos - 1];
                // p_index -= product.offset[f_min] + product.offset[pos];
                // p_index -= product.offset[f_min] - product.offset[pos];
                b_index++;
                f_index++;
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
     * The first value of an entry is the index in the data,
     * the second value is the value of the data at that location
     * and all following values are the indices of the tensor.
     * @returns {Iterator<[number, number, ...Array<number>]>} [key, value, ...indices]
     */
    * entries() {
        const indices = (new Array(this.dim)).fill(0), max = indices.length - 1;
        for (let index = 0, pos = max; index < this.data.length; index++) {
            yield [index, this.data[index], ...indices];
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