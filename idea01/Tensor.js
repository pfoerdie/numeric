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
    get copyWithin() { return undefined; } // NOTE disabled
    // get entries() { return undefined; }
    // get every() { return undefined; }
    // get fill() { return undefined; }
    // get find() { return undefined; }
    get findIndex() { return undefined; } // NOTE disabled
    // get filter() { return undefined; }
    // get forEach() { return undefined; }
    // get includes() { return undefined; }
    get indexOf() { return undefined; } // NOTE disabled
    // get join() { return undefined; }
    // get keys() { return undefined; }
    get lastIndexOf() { return undefined; } // NOTE disabled
    // get map() { return undefined; } // NOTE implemented
    // get reduce() { return undefined; }
    // get reduceRight() { return undefined; }
    get reverse() { return undefined; } // NOTE disabled
    get set() { return undefined; } // disabled
    // get slice() { return undefined; }
    // get some() { return undefined; }
    get sort() { return undefined; } // NOTE disabled
    get subarray() { return undefined; } // NOTE disabled
    // get toLocaleString() { return undefined; }
    // get toString() { return undefined; }
    // get values() { return undefined; }
    // get [Symbol.iterator]() { return undefined; }
    // static get of() { return undefined; } // NOTE implemented
    // static get from() { return undefined; } // NOTE implemented
    // static get [Symbol.species]() { return undefined; } // NOTE implemented

    //#endregion

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
        assert(index === this.length - 1, "Unknown Error");
        return result;
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