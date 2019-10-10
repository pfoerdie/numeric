const _ = require("./tools.js");

class Vector extends Float64Array {

    /**
     * Constructs a vector of given length.
     * @param {number} length 
     * @constructs Vector
     * @constructs Float64Array
     * @constructs Array<number>
     */
    constructor(length) {
        length = parseInt(length);
        _.assert(_.is.number(length) && length > 0, "invalid length");
        super(length);
    }

    /**
     * Value of 1d-vectors.
     * @type {number}
     */
    get value() {
        _.assert(this.length === 1, "wrong length");
        return this[0];
    }

    /**
     * X-value for 2d- and 3d-vectors.
     * @type {number}
     */
    get x() {
        _.assert(this.length === 2 || this.length === 3, "wrong length");
        return this[0];
    }

    /**
     * Y-value for 2d- and 3d-vectors.
     * @type {number}
     */
    get y() {
        _.assert(this.length === 2 || this.length === 3, "wrong length");
        return this[1];
    }

    /**
     * Z-value for 3d-vectors.
     * @type {number}
     */
    get z() {
        _.assert(this.length === 3, "wrong length");
        return this[2];
    }

    /**
     * Add any number of vectors to this.
     * @param  {...Vector} vecs 
     * @returns {Vector} this vector
     */
    add(...vecs) {
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        _.assert(vecs.every(vec.length === this.length), "different length vectors");
        for (let vec of vecs) {
            vec.forEach((val, i) => { this[i] += val });
        }
        return this;
    }

    /**
     * Multiply entrywise any number of vectors to this.
     * @param  {...Vector} vecs 
     * @returns {Vector} this vector
     */
    hadMult(...vecs) {
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        _.assert(vecs.every(vec.length === this.length), "different length vectors");
        for (let vec of vecs) {
            vec.forEach((val, i) => { this[i] *= val });
        }
        return this;
    }

    /**
     * Constructs a vector of given length.
     * @param {number} length 
     * @returns {Vector} new vector
     */
    static of(length) {
        return new Vector(length);
    }

    /**
     * Constructs a vector from a number array.
     * @param {Array<number>} arr
     * @returns {Vector} new vector
     */
    static from(arr) {
        _.assert(_.is.array(arr), "no array");
        _.assert(arr.every(_.is.number), "not all numbers");
        let res = new Vector(arr.length);
        arr.forEach((val, i) => { res[i] = val });
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
     * @returns {Vector} new vector
     */
    static sum(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let size = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === size), "different length vectors");
        let res = new Vector(size);
        for (let vec of vecs) {
            vec.forEach((val, i) => { res[i] += val });
        }
        return res;
    }

    /**
     * Returns the entrywise product of any number of vectors.
     * @param  {...Vector} vecs 
     * @returns {Vector} new vector
     */
    static hadProd(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let size = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === size), "different length vectors");
        let res = new Vector(size).fill(1);
        for (let vec of vecs) {
            vec.forEach((val, i) => { res[i] *= val });
        }
        return res;
    }

    /**
     * Returns the dot product of any numer of vectors.
     * @param  {...Vector} vecs 
     * @returns {Vec1} new vector
     */
    static dotProd(...vecs) {
        // TODO
    }

    /**
     * TODO
     */
    static crossProd() {
        // TODO
    }

    /**
     * TODO
     */
    static scalarProd() {
        // TODO
    }

    /**
     * Returns the entrywise negative of a vector.
     * @param {Vector} vec 
     * @returns {Vector} new vector
     */
    static negative(vec) {
        // TODO
    }

    /**
     * Returns the entrywise inverse of a vector.
     * @param {Vector} vec 
     * @returns {Vector} new Vector
     */
    static inverse(vec) {
        // TODO
    }

    /**
     * Returns the euklidean norm of a vector.
     * @param {Vector} vec 
     * @returns {Vector} new vector
     */
    static euklNorm(vec) {
        // TODO
    }

    /**
     * Returns the euklidean distance of a vector.
     * @param {Vector} vec 
     * @returns {Vec1} new vector
     */
    static euklDist(vec) {
        // TODO
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

    static of(length = 1) {
        _.assert(length === 1, "invalid length");
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

    static of(length = 2) {
        _.assert(length === 2, "invalid length");
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

    static of(length = 3) {
        _.assert(length === 3, "invalid length");
    }

    static from(arr) {
        _.assert(arr.length === 3, "invalid length");
        return Vector.from(arr);
    }

}

module.exports = Vector;