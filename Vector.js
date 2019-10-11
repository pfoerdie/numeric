const _ = require("./tools.js");

class Vector extends Float64Array {

    /**
     * Constructs a vector of given length.
     * @param {number} len 
     * @constructs Vector
     * @extends Float64Array
     */
    constructor(len) {
        _.assert(_.is.number(len) && len > 0 && len < Infinity && Math.trunc(len) === len, "invalid length");
        super(len);
    }

    /**
     * Value of 1d-vectors.
     * @type {number}
     */
    get value() {
        _.assert(this.length === 1, "wrong length");
        return this[0];
    }

    set value(val) {
        _.assert(this.length === 1, "wrong length");
        _.assert(_.is.number(val), "not a number");
        this[0] = val;
    }

    /**
     * X-value for 2d- and 3d-vectors.
     * @type {number}
     */
    get x() {
        _.assert(this.length === 2 || this.length === 3, "wrong length");
        return this[0];
    }

    set x(val) {
        _.assert(this.length === 2 || this.length === 3, "wrong length");
        _.assert(_.is.number(val), "not a number");
        this[0] = val;
    }

    /**
     * Y-value for 2d- and 3d-vectors.
     * @type {number}
     */
    get y() {
        _.assert(this.length === 2 || this.length === 3, "wrong length");
        return this[1];
    }

    set y(val) {
        _.assert(this.length === 2 || this.length === 3, "wrong length");
        _.assert(_.is.number(val), "not a number");
        this[1] = val;
    }

    /**
     * Z-value for 3d-vectors.
     * @type {number}
     */
    get z() {
        _.assert(this.length === 3, "wrong length");
        return this[2];
    }

    set z(val) {
        _.assert(this.length === 3, "wrong length");
        _.assert(_.is.number(val), "not a number");
        this[2] = val;
    }

    /**
     * Constructs a vector of given length.
     * @param {number} len 
     * @param {number|Vec1} [val=0]
     * @returns {Vector} 
     */
    static of(len, val = 0) {
        let res = new Vector(len);
        if (!val) return res;
        let isVec1 = val instanceof Vec1;
        for (let i = 0; i < len; i++) {
            res[i] = isVec1 ? val[0] : val;
        }
        return res;
    }

    /**
     * Constructs a vector from a number array.
     * @param {Vector|Array<number>} arr
     * @returns {Vector} 
     */
    static from(arr) {
        _.assert(arr instanceof Vector || Array.isArray(arr), "no array");
        _.assert(arr.every(_.is.number), "not all numbers");
        let res = Vector.of(arr.length, 0);
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            res[i] = arr[i];
        }
        return res;
    }

    /**
     * Convenient class for 1d-vectors.
     * @type {class}
     */
    static get Vec1() {
        return Vec1;
    }

    /**
     * Convenient class for 2d-vectors.
     * @type {class}
     */
    static get Vec2() {
        return Vec2;
    }

    /**
     * Convenient class for 3d-vectors.
     * @type {class}
     */
    static get Vec3() {
        return Vec3;
    }

    /**
     * Returns the sum of any number of vectors.
     * @param  {...Vector} vecs 
     * @returns {Vector} 
     */
    static sum(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let len = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === len), "different length vectors");
        let res = Vector.of(len, 0);
        for (let vec of vecs) {
            for (let i = 0; i < len; i++) {
                res[i] += vec[i];
            }
        }
        return res;
    }

    /**
     * Returns the entrywise product of any number of vectors.
     * @param  {...Vector} vecs 
     * @returns {Vector} 
     */
    static hadProd(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let len = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === len), "different length vectors");
        let res = Vector.of(len, 1);
        for (let vec of vecs) {
            for (let i = 0; i < len; i++) {
                res[i] *= vec[i];
            }
        }
        return res;
    }

    /**
     * Returns the dot product of any numer of vectors.
     * @param  {...Vector} vecs 
     * @returns {Vec1} 
     */
    static dotProd(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let len = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === len), "different length vectors");
        let res = Vector.of(1, 0);
        for (let i = 0; i < len; i++) {
            let tmp = Vector.of(1, 1);
            for (let vec of vecs) {
                tmp[0] *= vec[i];
            }
            res[0] += tmp[0];
        }
        return res;
    }

    /**
     * Returns the cross product of 2 3d-vectors.
     * @param {Vec3} vecA
     * @param {Vec3} vecB 
     * @returns {Vec3}
     */
    static crossProd(vecA, vecB) {
        _.assert(vecA instanceof Vec3 && vecB instanceof Vec3, "not all 3d-vectors");
        let res = Vector.of(3, 0);
        res[0] = vecA[1] * vecB[2] - vecA[2] * vecB[1];
        res[1] = vecA[2] * vecB[0] - vecA[0] * vecB[2];
        res[2] = vecA[0] * vecB[1] - vecA[1] * vecB[0];
        return res;
    }

    /**
     * Returns the scalar product of a vector.
     * @param {Vector} vec 
     * @param {number|Vec1} scalar 
     * @returns {Vector}
     */
    static scalarProd(vec, scalar) {
        _.assert(vec instanceof Vector, "not a vector");
        let isVec1 = scalar instanceof Vec1;
        _.assert(isVec1 || _.is.number(scalar), "not a scalar");
        let len = vec.length;
        let res = Vector.from(vec);
        for (let i = 0; i < len; i++) {
            res[i] *= isVec1 ? scalar[0] : scalar;
        }
        return res;
    }

    /**
     * Returns the entrywise negative of a vector.
     * @param {Vector} vec 
     * @returns {Vector} 
     */
    static negative(vec) {
        _.assert(vec instanceof Vector, "not a vector");
        let len = vec.length;
        let res = Vector.of(len, 0);
        for (let i = 0; i < len; i++) {
            res[i] -= vec[i];
        }
        return res;
    }

    /**
     * Returns the entrywise inverse of a vector.
     * @param {Vector} vec 
     * @returns {Vector} 
     */
    static inverse(vec) {
        _.assert(vec instanceof Vector, "not a vector");
        let len = vec.length;
        let res = Vector.of(len, 1);
        for (let i = 0; i < len; i++) {
            res[i] /= vec[i];
        }
        return res;
    }

    /**
     * Returns the euklidean norm of a vector.
     * @param {Vector} vec 
     * @returns {Vector} 
     */
    static euklNorm(vec) {
        let dist = Vector.euklDist(vec);
        let len = vec.length;
        let res = Vector.from(vec);
        for (let i = 0; i < len; i++) {
            res[i] /= dist[0];
        }
        return res;
    }

    /**
     * Returns the euklidean distance of a vector.
     * @param {Vector} vec 
     * @returns {Vec1} 
     */
    static euklDist(vec) {
        _.assert(vec instanceof Vector, "not a vector");
        let len = vec.length;
        let res = Vector.of(1, 0);
        for (let i = 0; i < len; i++) {
            res[0] += vec[i] * vec[i];
        }
        res[0] = Math.sqrt(res[0]);
        return res;
    }

}

class Vec1 extends Vector {

    constructor(x = 0) {
        _.assert(_.is.number(x), "not all numbers");
        super(1);
        this[0] = x;
    }

    static [Symbol.hasInstance](vec) {
        return vec instanceof Vector && vec.length === 1;
    }

    static of(val) {
        return Vector.of(1, val);
    }

    static from(arr) {
        _.assert(arr.length === 1, "invalid length");
        return Vector.from(arr);
    }

}

class Vec2 extends Vector {

    constructor(x = 0, y = 0) {
        _.assert(_.is.number(x) && _.is.number(y), "not all numbers");
        super(2);
        this[0] = x; this[1] = y;
    }

    static [Symbol.hasInstance](vec) {
        return vec instanceof Vector && vec.length === 2;
    }

    static of(val) {
        return Vector.of(2, val);
    }

    static from(arr) {
        _.assert(arr.length === 2, "invalid length");
        return Vector.from(arr);
    }

}

class Vec3 extends Vector {

    constructor(x = 0, y = 0, z = 0) {
        _.assert(_.is.number(x) && _.is.number(y) && _.is.number(z), "not all numbers");
        super(3);
        this[0] = x; this[1] = y; this[2] = z;
    }

    static [Symbol.hasInstance](vec) {
        return vec instanceof Vector && vec.length === 3;
    }

    static of(val) {
        return Vector.of(3, val)
    }

    static from(arr) {
        _.assert(arr.length === 3, "invalid length");
        return Vector.from(arr);
    }

}

module.exports = Vector;