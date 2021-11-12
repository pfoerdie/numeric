const
    core = require('../core'),
    { is } = require('../core'),
    util = require('@pfoerdie/utility');

/** @type {Map<string, Array>} Maps the size.toString() value to a size array. */
const sizeMap = new Map();

/** @type {Map<string, Array>} Maps the size.toString() value to an offset array. */
const offsetMap = new Map();

/** @type {WeakSet<Float64Array>} */
const assignedData = new WeakSet();

class Tensor {

    /**
     * @param {Array<Number>|Number|Float64Array} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|Number} [data] The length of the data must be the product of the size.
     * @param {...Array<Number>} [args] The rest arguments for the size, if a number is supplied.
     */
    constructor(size, data, ...args) {

        if (is.number(size)) {
            if (is.number(data)) {
                size = [size, data, ...args];
                data = undefined;
            } else {
                size = [size];
            }
        } else if (size instanceof Float64Array) {
            data = size;
            size = [data.length];
        }

        util.assert(is.array.nonempty(size) && size.every(is.number.integer.minmax(1, Infinity)),
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
     * @param {Tensor} basis 
     * @param {Tensor} factor 
     * @param {Number} [degree=1]
     * @returns {Tensor} 
     */
    static product(basis, factor, degree = 1) {
        util.assert(basis instanceof Tensor && factor instanceof Tensor,
            'The tensor product can only be solved with tensors.');
        util.assert(is.number.integer(degree) && degree > 0,
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

        // NOTE Because I am confident that this algorithm will work 100%, 
        //      I replaced the original with this for loop! The following
        //      is the previous code of the algorithm to make sure,
        //      the iterations match up with the length of the array:

        // let index = 0, pos = indices.length - 1;
        // indexLoop: while (true) {
        //     yield [index, this.data[index], ...indices];
        //     while (indices[pos] === this.size[pos] - 1) {
        //         if (pos > 0) pos--;
        //         else break indexLoop;
        //     }
        //     index++;
        //     indices[pos]++;
        //     while (pos < indices.length - 1) {
        //         pos++;
        //         indices[pos] = 0;
        //     }
        // }
        // return index === this.data.length - 1;
    } // Tensor#entries

    /**
     * The first value of an entry is the index in the data
     * and all following values are the indices of the tensor.
     * @returns {Iterator<[Number, ...Array<Number>]>} [key, ...indices]
     */
    * keys() {
        const indices = (new Array(this.dim)).fill(0);
        for (let index = 0, pos = indices.length - 1, max = this.data.length; index < max; index++) {
            yield [index, ...indices];
            while (indices[pos] === this.size[pos] - 1) {
                pos--;
            }
            indices[pos]++;
            while (pos < indices.length - 1) {
                pos++;
                indices[pos] = 0;
            }
        }
    } // Tensor#keys

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
        util.assert(is.array(dataArr), 'The dataArr must be an array.');
        let size = [], temp = dataArr;
        while (is.array(temp)) {
            size.push(temp.length);
            temp = temp[0];
        }
        const result = new Tensor(size);
        for (let [key, ...indices] of result.keys()) {
            let target = dataArr, max = indices.length - 1;
            for (let pos = 0; pos < max; pos++) {
                let index = indices[pos];
                util.assert(is.array(target[index]) && target[index].length === size[pos + 1],
                    'Expected an array of length ' + size[pos + 1] + ' at position ' + indices.slice(0, pos - max).reduce((acc, val) => acc + '[' + val + ']', '') + '.');
                if (!target[index])
                    target[index] = new Array(this.size[pos + 1]);
                target = target[index];
            }
            util.assert(is.number(target[indices[max]]),
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
        if (is.string(json)) json = JSON.parse(json);
        util.assert(is.object.nonnull(json) && json.type === 'Tensor',
            'The json must be a serialized Tensor.');
        const size = Array.from(json.size), data = Float64Array.from(json.data);
        return new Tensor(size, data);
    } // Tensor.fromJSON

} // Tensor

module.exports = Tensor;