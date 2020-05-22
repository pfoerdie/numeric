/**
 * @module Numeric.Method
 */

const _ = require("./tools.js");
const Tensor = require("./Tensor.js");
const $range = Symbol();

class Method {

    constructor(param = {}) {
        _.assert(_.is.object(param), "The parameter for the method is not an object.");
        Object.assign(this, param);
    }

    get range() {
        if (this[$range] === undefined) this[$range] = Infinity;
        return this[$range];
    }

    set range(range) {
        if (range !== Infinity) {
            range = parseInt(range);
            _.assert(_.is.number(range) && range >= 0, "The range must be a number from 0 to Infinity.");
        }
        _.set(this, $range, range);
    }

    compute(...args) {
        if (this.range < Infinity) _.assert(args.length === this.range, `The number of arguments does not match the methods range of ${this.range}."`);
        args = args.map(val => _.is.number(val) ? Tensor.from([val]) : val);
        _.assert(args.every(arg => arg instanceof Tensor), "All arguments must be Tensors.");
        return args;
    }

    derivative(k = 1) {
        k = parseInt(k);
        _.assert(_.is.number(k) && k > 0, "To get a derivation, a number index greater than 0 must be given.");
        return this;
    }

}

module.exports = Method;