/**
 * @module Numeric.Vector
 */

const _ = require("./tools.js");

class Vector extends Float64Array {

    /**
     * Constructs a vector of given length.
     * @param {number} len 
     * @constructs Vector
     * @extends Float64Array
     */
    constructor(len) {
        len = parseInt(len);
        _.assert(_.is.number(len) && len > 0 && len < Infinity && Math.trunc(len) === len, "invalid length");
        super(len);
    }

    /**
     * Returns the primitive value, which is the first entry for length = 1 and the whole array for greater length.
     * @returns {number|Array<number>}
     */
    valueOf() {
        return (this.length === 1) ? this[0] : Array.from(this);
    }

    /**
     * Returns the vector as array.
     * @returns {Array<number>}
     */
    toJSON() {
        return Array.from(this);
    }

    /**
     * Size of a vector, equal to its length.
     * @type {number}
     */
    get size() {
        return this.length;
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
     * Provides a 1d-vector for a given entry in this vector.
     * @param {number} i 
     */
    get(i) {
        _.assert(_.is.number(i) && i === parseInt(i) && i >= 0 && i < this.length, "invalid index");
        let res = Vector.of(1);
        res[0] = this[i];
        return res;
    }

    /**
     * Constructs a vector of given length.
     * @param {number} len 
     * @param {number|Vec1|Function<number>} [val=0]
     * @returns {Vector} 
     * @static
     */
    static of(len, val = 0) {
        let res = new Vector(len);
        if (!val) return res;
        let isVec = val instanceof Vec1;
        let isFn = (typeof val === "function");
        _.assert(isVec || isFn || _.is.number(val), "not a number");
        for (let i = 0; i < len; i++) {
            if (isFn) {
                let v = val(i);
                _.assert(_.is.number(v), "not a number");
                res[i] = v;
            } else {
                res[i] = isVec ? val[0] : val;
            }
        }
        return res;
    }

    /**
     * Constructs a vector from a number array.
     * @param {Vector|Array<number>} arr
     * @returns {Vector} 
     * @static
     */
    static from(arr) {
        _.assert(arr instanceof Vector || (Array.isArray(arr) && arr.every(_.is.number)), "no vector array");
        _.assert(arr.length > 0, "to few entries");
        let len = arr.length;
        let res = Vector.of(len);
        for (let i = 0; i < len; i++) {
            res[i] = arr[i];
        }
        return res;
    }

    /**
     * Convenient class for 1d-vectors.
     * @type {class}
     * @static
     */
    static get Vec1() {
        return Vec1;
    }

    /**
     * Convenient class for 2d-vectors.
     * @type {class}
     * @static
     */
    static get Vec2() {
        return Vec2;
    }

    /**
     * Convenient class for 3d-vectors.
     * @type {class}
     * @static
     */
    static get Vec3() {
        return Vec3;
    }

    static equality(...vecs) {
        _.assert(vecs.length > 1, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let first = vecs.shift();
        _.assert(vecs.every(vec => vec.length === first.length), "different length vectors");
        return vecs.every(vec => Vector.metric(first, vec, Vector.taxiNorm) < first.length * Number.EPSILON);
    }

    /**
     * Returns the sum of any number of vectors.
     * @param  {...Vector} vecs 
     * @returns {Vector} 
     * @static
     */
    static sum(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let len = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === len), "different length vectors");
        let res = Vector.of(len);
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
     * @static
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
     * @static
     */
    static dotProd(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let len = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === len), "different length vectors");
        let res = Vector.of(1);
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
     * @static
     */
    static crossProd(vecA, vecB) {
        _.assert(vecA instanceof Vec3 && vecB instanceof Vec3, "not all 3d-vectors");
        let res = Vector.of(3);
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
     * @static
     */
    static scalarProd(vec, scalar) {
        _.assert(vec instanceof Vector, "not a vector");
        let isVec = scalar instanceof Vec1;
        _.assert(isVec || _.is.number(scalar), "not a scalar");
        let len = vec.length;
        let res = Vector.from(vec);
        for (let i = 0; i < len; i++) {
            res[i] *= isVec ? scalar[0] : scalar;
        }
        return res;
    }

    /**
     * Returns the entrywise negative of a vector.
     * @param {Vector} vec 
     * @returns {Vector} 
     * @static
     */
    static negative(vec) {
        _.assert(vec instanceof Vector, "not a vector");
        let len = vec.length;
        let res = Vector.of(len);
        for (let i = 0; i < len; i++) {
            res[i] = -1 * vec[i];
        }
        return res;
    }

    /**
     * Returns the entrywise absolute of a vector.
     * @param {Vector} vec 
     * @returns {Vector} 
     * @static
     */
    static absolute(vec) {
        _.assert(vec instanceof Vector, "not a vector");
        let len = vec.length;
        let res = Vector.of(len);
        for (let i = 0; i < len; i++) {
            res[i] = Math.sign(vec[i]) * vec[i];
        }
        return res;
    }

    /**
     * Returns the entrywise inverse of a vector.
     * @param {Vector} vec 
     * @returns {Vector} 
     * @static
     */
    static inverse(vec) {
        _.assert(vec instanceof Vector, "not a vector");
        let len = vec.length;
        let res = Vector.of(len);
        for (let i = 0; i < len; i++) {
            res[i] = 1 / vec[i];
        }
        return res;
    }

    /**
     * Returns the unit vector of a vector.
     * @param {Vector} vec 
     * @param {Function} [norm=Vector.euclNorm]
     * @returns {Vector}
     * @static
     */
    static unit(vec, norm = Vector.euclNorm) {
        _.assert(vec instanceof Vector, "not a vector");
        _.assert(Vector.isNorm(norm), "invalid norm");
        let len = norm(vec);
        _.assert(len > 0, "zero length vector");
        return Vector.scalarProd(vec, Vector.inverse(len));
    }

    /**
     * Returns the p-norm of a vector.
     * @param {Vector} vec 
     * @param {number} p
     * @returns {Vec1} 
     * @static
     */
    static pNorm(vec, p) {
        _.assert(vec instanceof Vector, "not a vector");
        _.assert(_.is.number(p) && p > 0 && p <= Infinity && Math.trunc(p) === p, "invalid p");
        let len = vec.length;
        let res = Vector.of(1);
        if (p < Infinity) {
            for (let i = 0; i < len; i++) {
                res[0] += (Math.sign(vec[i]) * vec[i]) ** p;
            }
            res[0] = res[0] ** (1 / p);
        } else {
            for (let i = 0; i < len; i++) {
                if (vec[i] > res[0]) res[0] = vec[i];
            }
        }
        return res;
    }

    /**
     * Returns the taxicap-/manhatten norm of a vector (p=1 norm).
     * @param {Vector} vec 
     * @returns {Vec1} 
     * @static
     */
    static taxiNorm(vec) {
        return Vector.pNorm(vec, 1);
    }

    /**
     * Returns the euclidean norm of a vector (p=2 norm).
     * @param {Vector} vec 
     * @returns {Vec1} 
     * @static
     */
    static euclNorm(vec) {
        return Vector.pNorm(vec, 2);
    }

    /**
     * Returns the maximum norm of a vector (p=Infinity norm).
     * @param {Vector} vec 
     * @returns {Vec1} 
     * @static
     */
    static maxNorm(vec) {
        return Vector.pNorm(vec, Infinity);
    }

    /**
     * Checks if a function is an actual norm.
     * @param {Function} [norm] 
     * @returns {boolean}
     * @static
     */
    static isNorm(norm) {
        switch (norm) {
            case Vector.taxiNorm:
            case Vector.euclNorm:
            case Vector.maxNorm:
                return true;
        }
        return false;
    }

    /**
     * Returns the metric of two vectors using the pNorm.
     * @param {Vector} vecA 
     * @param {Vector} vecB 
     * @param {number} [p=2]
     * @returns {Vec1} 
     * @static
     */
    static metric(vecA, vecB, norm = Vector.euclNorm) {
        _.assert(vecA instanceof Vector && vecB instanceof Vector, "not all vectors");
        _.assert(vecA.length === vecB.length, "different length vectors");
        _.assert(Vector.isNorm(norm), "invalid norm");
        let len = vecA.length;
        let vec = Vector.of(len);
        for (let i = 0; i < len; i++) {
            vec[i] = vecA[i] - vecB[i];
        }
        let res = norm(vec);
        return res;
    }

    /**
     * Returns a new vector with the entrywise minimum.
     * @param  {...Vector} vecs 
     * @returns {Vector}
     * @static
     */
    static min(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let len = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === len), "different length vectors");
        let res = Vector.of(len, Infinity);
        for (let vec of vecs) {
            for (let i = 0; i < len; i++) {
                if (vec[i] < res[i]) res[i] = vec[i];
            }
        }
        return res;
    }

    /**
     * Returns a new vector with the entrywise maximum.
     * @param  {...Vector} vecs 
     * @returns {Vector}
     * @static
     */
    static max(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let len = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === len), "different length vectors");
        let res = Vector.of(len, -Infinity);
        for (let vec of vecs) {
            for (let i = 0; i < len; i++) {
                if (vec[i] > res[i]) res[i] = vec[i];
            }
        }
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
        return Vector.of(3, val);
    }

    static from(arr) {
        _.assert(arr.length === 3, "invalid length");
        return Vector.from(arr);
    }

}

module.exports = Vector;