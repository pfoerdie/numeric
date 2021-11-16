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
     * @param {Array<Number>|Number|Float64Array} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|Number} [data] The length of the data must be the product of the size.
     * @param {...Array<Number>} [args] The rest arguments for the size, if a number is supplied.
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

        /** @type {Number} */
        this.dim = size.length;
        const sizeStr = size.join(' ');
        if (sizeMap.has(sizeStr)) {
            /** @type {Array<Number>} */
            this.size = sizeMap.get(sizeStr);
        } else {
            /** @type {Array<Number>} */
            this.size = Object.freeze(Array.from(size));
            sizeMap.set(sizeStr, this.size);
        }

        if (offsetMap.has(sizeStr)) {
            /** @type {Array<Number>} */
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
            /** @type {Array<Number>} */
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

        const sum = new Tensor(summands[0].size);
        for (let summand of summands) {
            for (let index = 0, max = summand.data.length; index < max; index++) {
                sum.data[index] += summand.data[index];
            }
        }
        return sum;
    } // Tensor.sum

    /**
     * @param {Tensor} basis 
     * @param {Tensor} factor 
     * @param {Number} [degree=1]
     * @returns {Tensor} 
     */
    static product(basis, factor, degree = 1) {
        util.assert(basis instanceof Tensor && factor instanceof Tensor,
            'The tensor product can only be solved with tensors.');
        util.assert(util.is.number.integer.positive(degree),
            'The degree of the product must be an integer > 0.');

        // TODO implement tensor product
    } // Tensor.product

    /**
     * The first value of an entry is the index in the data,
     * the second value is the value of the data at that location
     * and all following values are the indices of the tensor.
     * @returns {Iterator<[Number, Number, ...Array<Number>]>} [key, value, ...indices]
     */
    * entries() {
        const indices = (new Array(this.dim)).fill(0);
        for (let index = 0, pos = indices.length - 1, max = this.data.length; index < max; index++) {
            yield [index, this.data[index], ...indices];
            while (indices[pos] === this.size[pos] - 1) {
                pos--;
            }
            indices[pos]++;
            while (pos < indices.length - 1) {
                pos++;
                indices[pos] = 0;
            }
        }
    } // Tensor#entries

    /**
     * @returns {Array<Number|Array>}
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
     * @param {Array<Number|Array>} dataArr 
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
     * @returns {{type: 'Tensor', size: Array<Number>, data: Array<Number>}}
     */
    toJSON() {
        return {
            type: 'Tensor',
            size: Array.from(this.size),
            data: Array.from(this.data)
        };
    } // Tensor#toJSON

    /**
     * @param {{type: 'Tensor', size: Array<Number>, data: Array<Number>}|String} json 
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