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
        const sizeID = size.toString();
        if (_sizeCache.has(sizeID)) {
            Object.assign(this, _sizeCache.get(sizeID));
        } else {
            const cache = Object.freeze({
                /**
                 * @type {number}
                 * @member {Tensor}
                 */
                order: size.length,
                /**
                 * @type {Array<number>}
                 * @member {Tensor}
                 */
                size: Object.freeze(size),
                /**
                 * @type {Array<number>}
                 * @member {Tensor}
                 */
                offset: Object.freeze(_calcIndexOffset(size))
            });
            _sizeCache.set(sizeID, cache);
            Object.assign(this, cache);
        }
    }

    /**
     * @returns {Tensor}
     */
    clone() {
        const result = new Tensor(...this.size);
        for (let i = 0; i < this.length; i++) {
            result[i] = this[i];
        }
        return result;
    }

    /**
     * @param  {...Tensor} tensors 
     * @returns {this}
     */
    add(...tensors) {
        assert(tensors.every(tensor => tensor instanceof Tensor && tensor.size === this.size),
            "For entrywise addition, all arguments must be tensors of the same size.");
        const result = this.clone();
        for (let tensor of tensors) {
            for (let i = 0; i < result.length; i++) {
                result[i] += tensor[i];
            }
        }
        return result;
    }

    /**
     * @param  {...Tensor} tensors 
     * @returns {this}
     */
    subtract(...tensors) {
        assert(tensors.every(tensor => tensor instanceof Tensor && tensor.size === this.size),
            "For entrywise subtraction, all arguments must be tensors of the same size.");
        const result = this.clone();
        for (let tensor of tensors) {
            for (let i = 0; i < result.length; i++) {
                result[i] -= tensor[i];
            }
        }
        return result;
    }

    /**
     * @param  {...Tensor} tensors 
     * @returns {this}
     */
    hadMultiply(...tensors) {
        assert(tensors.every(tensor => tensor instanceof Tensor && tensor.size === this.size),
            "For entrywise multiplication, all arguments must be tensors of the same size.");
        const result = this.clone();
        for (let tensor of tensors) {
            for (let i = 0; i < result.length; i++) {
                result[i] *= tensor[i];
            }
        }
        return result;
    }

    /**
     * @param  {...Tensor} tensors 
     * @returns {this}
     */
    hadDevide(...tensors) {
        assert(tensors.every(tensor => tensor instanceof Tensor && tensor.size === this.size),
            "For entrywise devision, all arguments must be tensors of the same size.");
        const result = this.clone();
        for (let tensor of tensors) {
            for (let i = 0; i < result.length; i++) {
                result[i] /= tensor[i];
            }
        }
        return result;
    }

    /**
     * @param {number|Tensor} factor 
     * @param {number} [degree=1] 
     * @returns {Tensor|number}
     */
    multiply(factor, degree = 1) {
        assert(degree > 0 && degree === parseInt(degree), "The degree must be an integer larger than 0.");
        if (typeof factor === "number") {
            assert(degree === 1, "The degree for scalar multiplication must be 1.");
            const result = new Tensor(...this.size);
            for (let i = 0; i < this.length; i++) {
                result[i] = this[i] * factor;
            }
            return result;
        } else {
            assert(factor instanceof Tensor, "The factor for the multiplication must be a number or a tensor.");
            assert(this.order >= degree && factor.order >= degree,
                "The order of this and the factor must be larger or equal to the degree of the multiplication.");
            for (let k = 1; k <= degree; k++) {
                assert(this.size[this.order - k] === factor.size[degree - k],
                    "For a multiplication of given degree, that last part of the tensors size must match the first part of the factors size.");
            }
            if (this.order === degree && factor.order === degree) {
                let result = 0;
                for (let i = 0; i < this.length; i++) {
                    result += this[i] * factor[i];
                }
                return result;
            } else {
                const result = new Tensor(...this.size.slice(0, -degree), ...factor.size.slice(degree));
                for (let [t_index, t_value, ...t_indices] of this.entries()) {
                    indexLoop: for (let [f_index, f_value, ...f_indices] of factor.entries()) {
                        // NOTE This is not efficient and the algorithm should be rewritten, so it does not need 
                        //      the following check and iterate unnecessarily over those indices. 
                        for (let k = 1; k <= degree; k++) {
                            if (t_indices[t_indices.length - k] !== f_indices[degree - k])
                                continue indexLoop;
                        }
                        const r_indices = [...t_indices.slice(0, -degree), ...f_indices.slice(degree)];
                        const r_index = _calcIndex(r_indices, result.offset);
                        result[r_index] += t_value * f_value;
                    }
                }
                return result;
            }
        }
    }

    /**
     * @returns {Iterator<[number, number, ...number]>}
     * @override
     * @generator
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
     * @returns {Iterator<[...number]>}
     * @generator
     */
    * indices() {
        const indices = (new Array(this.order)).fill(0);
        let index = 0, pos = this.order - 1;
        while (pos >= 0) {
            if (indices[pos] === this.size[pos] - 1) {
                pos--;
            } else {
                yield [...indices];
                index++;
                indices[pos]++;
                while (pos < this.order - 1) {
                    pos++;
                    indices[pos] = 0;
                }
            }
        }
        yield [...indices];
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
     * @returns {this} 
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

    toString() {
        return `Tensor <${this.size}> [${super.toString()}]`;
    }

    toLocaleString() {
        return `Tensor <${this.size}> [${super.toLocaleString()}]`;
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

/**
 * @param {Array<number>} size 
 * @returns {Array<number>}
 * @private
 */
function _calcIndexOffset(size) {
    const offset = new Array(size.length);
    for (let i = 0; i < size.length; i++) {
        let factor = 1;
        for (let j = i + 1; j < size.length; j++) {
            factor *= size[j];
        }
        offset[i] = factor;
    }
    // TODO test correctness of offset
    return offset;
}

/**
 * @param {Array<number>} size 
 * @param {Array<number>} offset 
 * @returns {number}
 * @private
 */
function _calcIndex(indices, offset) {
    let index = 0;
    for (let i = 0; i < indices.length; i++) {
        index += indices[i] * offset[i];
    }
    return index;
}