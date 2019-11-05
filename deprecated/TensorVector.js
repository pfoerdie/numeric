const _ = require("../tools.js");
const Tf = require("@tensorflow/tfjs");
// const Tf = require("@tensorflow/tfjs-node");

class Vector {

    #tensor = null;

    /**
     * Constructs a vector.
     * @param {...number} arr 
     * @constructs Vector
     */
    constructor(...arr) {
        _.assert(arr.every(_.is.number), "not all numbers");
        this.#tensor = Tf.tensor1d(arr, "float32");
    }

    get length() {
        return this.#tensor.size;
    }

    get value() {
        return this.#tensor.array();
    }

    /**
     * Constructs a vector of given length.
     * @param {number} len 
     * @param {number|Vec1} [val=0]
     * @returns {Vector} new vector
     */
    static of(len, val = 0) {
        let arr = new Array(len).fill(val);
        arr = (typeof val === "function")
            ? arr.map((v, i) => val(i))
            : arr.fill(val);
        let res = new Vector(...arr);
        return res;
    }

    /**
     * Constructs a vector from a number array.
     * @param {Vector|Array<number>} arr
     * @returns {Vector} new vector
     */
    static from(arr) {
        _.assert(_.is.array(arr), "no array");
        if (arr instanceof Vector) throw "not implemented yet"; // TODO
        let res = new Vector(...arr);
        return res;
    }

    /**
     * Returns the sum of any number of vectors.
     * @param  {...Vector} vecs 
     * @returns {Vector} new vector
     */
    static sum(...vecs) {
        _.assert(vecs.length > 0, "to few arguments");
        _.assert(vecs.every(vec => vec instanceof Vector), "not all vectors");
        let len = vecs[0].length;
        _.assert(vecs.every(vec => vec.length === len), "different length vectors");
        let res = Vector.of(len, 0);
        for (let vec of vecs) {
            res.#tensor = res.#tensor.add(vec.#tensor);
        }
        return res;
    }

}

module.exports = Vector;