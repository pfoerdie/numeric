const assert = require("assert");
const _sizeCache = new Map();

class Tensor extends Float64Array {

    constructor(...size) {
        assert(size.length > 0, "The size is not defined.");
        assert(size.every(val => val > 0 && val < 4294967296 && val === parseInt(val)), "The size must be an integer larger than 0 and less than 4294967296.");
        const length = size.reduce((acc, val) => acc * val, 1);
        super(length);
        Object.defineProperty(this, "type", { value: size.toString() });
        let cache = _sizeCache.get(this.type);
        if (!cache) {
            cache = {
                size: Object.freeze(size),
                indexOffset: Object.freeze(_calcIndexOffset(size))
            };
            _sizeCache.set(this.type, cache)
        }
        Object.defineProperty(this, "size", { value: cache.size });
        Object.defineProperty(this, "indexOffset", { value: cache.indexOffset });
    }

    //#region TypedArray Prototypes

    // TODO all TypedArray.prototype methods must be overriden with custom indexing
    // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
    get copyWithin() { } // NOTE disabled
    get entries() { } // NOTE disabled
    // every() { } // NOTE implemented
    // fill() { }
    // find() { }
    get findIndex() { } // NOTE disabled
    // filter() { }
    // forEach() { } // NOTE implemented
    // includes() { }
    get indexOf() { } // NOTE disabled
    // join() { }
    get keys() { } // NOTE disabled
    get lastIndexOf() { } // NOTE disabled
    // map() { } // NOTE implemented
    // reduce() { }
    // reduceRight() { }
    get reverse() { } // NOTE disabled
    get set() { } // disabled
    // slice() { }
    // some() { } // NOTE implemented
    get sort() { } // NOTE disabled
    get subarray() { } // NOTE disabled
    // toLocaleString() { }
    // toString() { }
    get values() { } // NOTE disabled
    // [Symbol.iterator]() { } // NOTE inherited
    // static of() { } // NOTE implemented
    // static from() { } // NOTE implemented
    // static get [Symbol.species]() { } // NOTE implemented

    //#endregion

    forEach(callback) {
        assert(typeof callback === "function", "The callback is not a function.");
        const dim = this.size.length;
        const indices = (new Array(dim)).fill(0);
        let index = 0, pos = dim - 1;
        while (pos >= 0) {
            if (indices[pos] === this.size[pos] - 1) {
                pos--;
            } else {
                callback(this[index], ...indices);
                index++;
                indices[pos]++;
                while (pos < dim - 1) {
                    pos++;
                    indices[pos] = 0;
                }
            }
        }
        callback(this[index], ...indices);
        assert(index === this.length - 1);
    }

    map(callback) {
        assert(typeof callback === "function", "The callback is not a function.");
        const result = new Tensor(...this.size);
        const dim = this.size.length;
        const indices = (new Array(dim)).fill(0);
        let index = 0, pos = dim - 1;
        while (pos >= 0) {
            if (indices[pos] === this.size[pos] - 1) {
                pos--;
            } else {
                result[index] = callback(this[index], ...indices);
                index++;
                indices[pos]++;
                while (pos < dim - 1) {
                    pos++;
                    indices[pos] = 0;
                }
            }
        }
        result[index] = callback(this[index], ...indices);
        assert(index === this.length - 1);
        return result;
    }

    every(callback) {
        assert(typeof callback === "function", "The callback is not a function.");
        const dim = this.size.length;
        const indices = (new Array(dim)).fill(0);
        let index = 0, pos = dim - 1;
        while (pos >= 0) {
            if (indices[pos] === this.size[pos] - 1) {
                pos--;
            } else {
                if (!callback(this[index], ...indices)) return false;
                index++;
                indices[pos]++;
                while (pos < dim - 1) {
                    pos++;
                    indices[pos] = 0;
                }
            }
        }
        if (!callback(this[index], ...indices)) return false;
        assert(index === this.length - 1);
        return true;
    }

    some(callback) {
        assert(typeof callback === "function", "The callback is not a function.");
        const dim = this.size.length;
        const indices = (new Array(dim)).fill(0);
        let index = 0, pos = dim - 1;
        while (pos >= 0) {
            if (indices[pos] === this.size[pos] - 1) {
                pos--;
            } else {
                if (callback(this[index], ...indices)) return true;
                index++;
                indices[pos]++;
                while (pos < dim - 1) {
                    pos++;
                    indices[pos] = 0;
                }
            }
        }
        if (callback(this[index], ...indices)) return true;
        assert(index === this.length - 1);
        return false;
    }

    toJSON() {
        // TODO
    }

    static of(...arr) {
        return Tensor.from(arr);
    }

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