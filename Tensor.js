/**
 * @module Numeric.Tensor
 */

const _ = require("./tools.js");
const _lookupMap = new Map();
const $size = Symbol(), $type = Symbol(), $constructor = Symbol();

function _getLookup(tensor) {
    _.assert(tensor instanceof Tensor, "Illegal request for non tensor lookup.");
    let { [$size]: size, [$type]: key } = tensor;
    if (_lookupMap.has(key)) return _lookupMap.get(key);
    let indexFactor = size.map((val, i) => size.slice(i + 1).reduce((acc, val) => acc * val, 1));
    let lookup = { indexFactor };
    _lookupMap.set(key, lookup);
    return lookup;
}

class Tensor extends Float64Array {

    constructor(...size) {
        _.assert(size.length > 0, "The size is not defined.");
        _.assert(size.every(val => val > 0 && val < 4294967296), "The size must be a number larger than 0 and less than 4294967296.");
        size = Uint32Array.from(size);
        let length = size.reduce((acc, val) => acc * val, 1);
        super(length);
        _.define(this, $type, size.toString());
        _.define(this, $size, size);
        _.define(this, $constructor, new.target);
        _getLookup(this);
    }

    get size() {
        let { [$size]: size } = this;
        return size.slice(0);
    }

    get dim() {
        let { [$size]: size } = this;
        return size.length;
    }

    getIndex(...pos) {
        let { [$size]: size } = this;
        _.assert(pos.length === size.length, "The position must have the same dimension as the tensors.");
        pos = Uint32Array.from(pos);
        _.assert(pos.every((val, i) => val < size[i]), "Position out of range.");
        let { indexFactor } = _getLookup(this);
        let index = 0;
        for (let i = 0; i < pos.length; i++) {
            index += pos[i] * indexFactor[i];
        }
        return index;
    }

    getValue(...pos) {
        let index = this.getIndex(...pos);
        return this[index];
    }

    getPosition(index) {
        _.assert(_.is.number(index), "The index must be a number.");
        index = Math.max(0, parseInt(index));
        let { [$size]: size } = this;
        _.assert(index < this.length, "Index out of range.");
        let { indexFactor } = _getLookup(this);
        let pos = new Uint32Array(size.length);
        for (let i = 0; i < pos.length; i++) {
            let factor = indexFactor[i];
            let tmp = index % factor;
            pos[i] = (index - tmp) / factor;
            index = tmp;
        }
        return pos;
    }

    toString() {
        let { [$size]: size, [$constructor]: constructor } = this;
        return `${constructor.name}<${size.join(", ")}> [ ${this.join(", ")} ]`;
    }

    static from(arrayLike, size, mapFn, thisArg) {
        // TODO rethink and rework <- what do you want to accomplish with that in reality?
        let values = arrayLike.length > 0 ? arrayLike : Array.from(arrayLike);
        if (!size) size = values instanceof Tensor ? values.size : [values.length];
        let result = new this(...size); // NOTE <- this <- Tensor
        values.forEach((value, index) => result[index] = value);
        return result;
    }

    static get [Symbol.species]() {
        return Tensor;
    }

}

module.exports = Tensor;