const { assert, is } = require("./util.js");

/** @type {Map<string, Array>} Maps the size.toString() value to a size array. */
const sizeMap = new Map();

/** @type {Map<string, Array>} Maps the size.toString() value to an offset array. */
const offsetMap = new Map();

class Tensor {

    /**
     * @param {number|Array<number>} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array} [buffer] The length of the buffer must be the product of the size.
     */
    constructor(size, buffer) {

        if (is.number(size)) size = [size];
        assert(is.array.nonempty(size) && size.every(is.number.integer.minmax(1, Infinity)),
            "The size must only contain one or more integer greater than zero.");

        const bufferSize = size.reduce((acc, val) => acc * val, 1);
        if (buffer) {
            assert(buffer instanceof Float64Array && buffer.length === bufferSize,
                "The length of the buffer must be the product of the size.");
            /** @type {Float64Array} */
            this.buffer = buffer;
        } else {
            /** @type {Float64Array} */
            this.buffer = new Float64Array(bufferSize);
        }

        /** @type {number} */
        this.dim = size.length;
        const sizeStr = size.join(" ");
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

        Object.freeze(this);

    } // Tensor#constructor

    /**
     * The first value of an entry is the index in the buffer,
     * the second value is the value of the buffer at that location
     * and all following values are the indices of the tensor.
     * @returns {Iterator<[number, number, ...Array<number>], boolean>} 
     */
    * entries() {
        const indices = (new Array(this.dim)).fill(0);
        let index = 0, pos = indices.length - 1;
        indexLoop: while (true) {
            yield [index, this.buffer[index], ...indices];
            while (indices[pos] === this.size[pos] - 1) {
                if (pos > 0) pos--;
                else break indexLoop;
            }
            index++;
            indices[pos]++;
            while (pos < indices.length - 1) {
                pos++;
                indices[pos] = 0;
            }
        }
        return index === this.buffer.length - 1;
    } // Tensor#entries

    /**
     * @param {Tensor} basis 
     * @param {Tensor} factor 
     * @param {number} [degree=1]
     * @returns {Tensor} 
     */
    static product(basis, factor, degree = 1) {
        assert(basis instanceof Tensor && factor instanceof Tensor,
            "The tensor product can only be solved with tensors.");
        // TODO
    } // Tensor.product

} // Tensor

module.exports = Tensor;