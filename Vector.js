const _ = require("./tools.js");

class Vector extends Float64Array {

    constructor(...args) {
        _.assert(new.target !== Vector, "abstract class");
        super(args);
    }

    static add(...vecs) {
        _.assert(vecs.length > 1, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let size = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === size), "different length vectors");
        let res = Vector.of(size);
        for (let vec of vecs) {
            for (let i in res) {
                res[i] += vec[i];
            }
        }
        return res;
    }

    static get Vec1() {
        return Vec1;
    }

    static get Vec2() {
        return Vec2;
    }

    static get Vec3() {
        return Vec3;
    }

    static of(size) {
        _.assert(_.is.number(size), "no number");
        switch (size) {
            case 1: return new Vec1();
            case 2: return new Vec2();
            case 3: return new Vec3();
            default: throw new Error("size not supported");
        }
    }

    static from(arr) {
        _.assert(_.is.array(arr), "no array");
        _.assert(arr.every(_.is.number), "not only numbers");
        switch (arr.length) {
            case 1: return new Vec1(...arr);
            case 2: return new Vec2(...arr);
            case 3: return new Vec3(...arr);
            default: throw new Error("size not supported");
        }
    }

}

class Vec1 extends Vector {

    constructor(x = 0) {
        super(x);
    }

    get x() {
        return this[0];
    }

}

class Vec2 extends Vector {

    constructor(x = 0, y = 0) {
        super(x, y);
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

}

class Vec3 extends Vector {

    constructor(x = 0, y = 0, z = 0) {
        super(x, y, z);
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

}

module.exports = Vector;