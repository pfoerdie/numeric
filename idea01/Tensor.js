const assert = require("assert");
const _sizeCache = new Map();

/** INFO TypedArray Prototypes
 * 
 * {@link https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Float64Array Float64Array}
 * 
 * TODO all TypedArray.prototype methods must be overriden with custom indexing:
 * - copyWithin( target, start[, end = this.length] )
 * - fill( value[, start = 0[, end = this.length]] )
 * - find( callback[, thisArg] )
 * - findIndex( callback[, thisArg] )
 * - filter( callback[, thisArg] )
 * - includes( searchElement[, fromIndex] )
 * - indexOf( searchElement[, fromIndex = 0] )
 * - join( [separator = ','] )
 * - lastIndexOf( searchElement[, fromIndex = typedarray.length] )
 * - reduce( callback[, initialValue] )
 * - reduceRight( callback[, initialValue] )
 * - set( typedarray[, offset] )
 * - slice( [begin[, end]] )
 * - sort( [compareFunction] )
 * 
 * NOTE inherited:
 * - * keys( )
 * - * values( )
 * - reverse( )
 * - subarray( )
 * - toLocaleString( )
 * - toString( )
 * - [Symbol.iterator]( )
 * 
 * NOTE implemented:
 * -  * entries( )
 * - every( callback[, thisArg] )
 * - forEach( callback[, thisArg] )
 * - map( callback[, thisArg] )
 * - some( callback[, thisArg] )
 * - static of( element0[, element1[, ...[, elementN]]] )
 * - static from( source[, mapFn[, thisArg]] )
 * - static get [Symbol.species]( )
 * 
 */

class Tensor extends Float64Array {

    /**
     * @param  {...number} size 
     * @constructs Tensor
     * @extends Float64Array
     */
    constructor(...size) {
        assert(size.length > 0, "The size is not defined.");
        assert(size.every(val => val > 0 && val === parseInt(val)), "The size must be an integer larger than 0.");
        const length = size.reduce((acc, val) => acc * val, 1);
        super(length);
        Object.defineProperty(this, "order", { value: size.length });
        Object.defineProperty(this, "type", { value: size.toString() });
        let cache = _sizeCache.get(this.type);
        if (!cache) {
            cache = {
                length,
                size: Object.freeze(size),
                indexOffset: Object.freeze(_calcIndexOffset(size))
            };
            _sizeCache.set(this.type, cache)
        }
        assert(length === cache.length, "Unknown Error! Tensors of the same type should always have the same length.");
        Object.defineProperty(this, "size", { value: cache.size });
        Object.defineProperty(this, "indexOffset", { value: cache.indexOffset });
    }

    add(...tensors) {
        assert(tensors.every(tensor => tensor instanceof Tensor && tensor.type === this.type), "For addition, all arguments must be tensors of the same size.");
        for (let tensor of tensors) {
            for (let i = 0; i < this.length; i++) {
                this[i] += tensor[i];
            }
        }
        return this;
    }

    /**
     * @returns {Iterator<[number, number, ...number]>}
     * @override
     */
    * entries() {
        const indices = (new Array(this.order)).fill(0);
        let index = 0, pos = this.order - 1;
        while (pos >= 0) {
            if (indices[pos] === this.size[pos] - 1) {
                pos--;
            } else {
                yield [index, this[index], ...indices];
                index++;
                indices[pos]++;
                while (pos < this.order - 1) {
                    pos++;
                    indices[pos] = 0;
                }
            }
        }
        yield [index, this[index], ...indices];
        assert(index === this.length - 1, "The number of iterations does not match the length of the tensor.");
    }

    /**
     * @typedef {function} Tensor~Callback
     * @param {number} value 
     * @param {Array<number>} indices 
     * @param {number} index 
     * @param {Tensor} tensor
     */

    /**
     * @param {Tensor~Callback} callback 
     * @param {*} [thisArg] 
     * @returns {Tensor} 
     * @override
     */
    forEach(callback, thisArg) {
        assert(typeof callback === "function", "The callback is not a function.");
        for (let [index, value, ...indices] of this.entries()) {
            callback.call(thisArg, value, indices, index, this);
        }
        return this;
    }

    /**
     * @param {Tensor~Callback} callback 
     * @param {*} [thisArg] 
     * @returns {Tensor} 
     * @override
     */
    map(callback, thisArg) {
        assert(typeof callback === "function", "The callback is not a function.");
        const result = new Tensor(...this.size);
        for (let [index, value, ...indices] of this.entries()) {
            result[index] = callback.call(thisArg, value, indices, index, this);
        }
        return result;
    }

    /**
     * @param {Tensor~Callback} callback 
     * @param {*} [thisArg] 
     * @returns {boolean} 
     * @override
     */
    every(callback, thisArg) {
        assert(typeof callback === "function", "The callback is not a function.");
        for (let [index, value, ...indices] of this.entries()) {
            if (!callback.call(thisArg, value, indices, index, this))
                return false;
        }
        return true;
    }

    /**
     * @param {Tensor~Callback} callback 
     * @param {*} [thisArg] 
     * @returns {boolean} 
     * @override
     */
    some(callback, thisArg) {
        assert(typeof callback === "function", "The callback is not a function.");
        for (let [index, value, ...indices] of this.entries()) {
            if (callback.call(thisArg, value, indices, index, this))
                return true;
        }
        return false;
    }

    /**
     * @typedef {Array<number|Tensor~JSON>} Tensor~JSON
     */

    /**
     * @returns {Tensor~JSON}
     */
    toJSON() {
        // TODO
    }

    /**
     * @param {Tensor|Tensor~JSON} arr
     * @returns {Tensor} 
     * @static
     * @override
     */
    static from(arr) {
        if (arr instanceof Tensor) {
            const result = new Tensor(...arr.size);
            for (let i = 0; i < arr.length; i++) {
                result[i] = arr[i];
            }
            return result;
        } else {
            // TODO
        }
    }

    /**
     * @param {...number|Tensor~JSON} arr
     * @returns {Tensor} 
     * @static
     * @override
     */
    static of(...arr) {
        return Tensor.from(arr);
    }

    /**
     * @type {class<Float64Array>}
     * @static
     * @override
     */
    static get [Symbol.species]() {
        // NOTE this targets all prototypes that the tensor does not override
        return Float64Array;
    }

}

module.exports = Tensor;

function _calcIndexOffset(size) {
    const indexOffset = new Array(size.length);
    for (let i = 0; i < size.length; i++) {
        let factor = 1;
        for (let j = i + 1; j < size.length; j++) {
            factor *= size[j];
        }
        indexOffset[i] = factor;
    }
    // TODO test correctness of indexOffset
    return indexOffset;
}