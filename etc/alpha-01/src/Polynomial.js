/**
 * @module Numeric.Polynomial
 */

const _ = require("./tools.js");
const Tensor = require("./Tensor.js");
const Method = require("./Method.js");
const $coeffs = Symbol("coeffs"), $base = Symbol("base"), $degree = Symbol("degree");

class Polynomial extends Method {

    get degree() {
        return this.coeffs.length - 1;
    }

    get coeffs() {
        _.assert(this[$coeffs], "Coefficients of the Polynomial have to been defined.");
        return this[$coeffs];
    }

    set coeffs(coeffs) {
        _.set(this, $coeffs, Tensor.from(coeffs));
    }

    get base() {
        if (this[$base]) {
            _.assert(this.coeffs.length === this[$base].length, `The base has not the same length of ${this.coeffs.length} as the coefficients.`);
            return this[$base];
        } else {
            this.base = new Array(this.coeffs.length).fill(null).map((tmp, degree) => new PolynomialBase({ degree }));
            return this[$base];
        }
    }

    set base(base) {
        _.assert(_.is.array(base) && base.length === this.coeffs.length, `The base is not an array of the coefficients length of ${this.coeffs.length}.`);
        _.assert(base.every(baseFn => baseFn instanceof PolynomialBase), "The base must contain polynomial base functions.");
        _.set(this, $base, [...base]);
    }

    compute(...args) {
        args = super.compute(...args);
        let { coeffs, base } = this;
        let resTensor = Tensor.from(coeffs, (coeff, n) => coeff * base[n].compute(...args));
        return resTensor.reduce((acc, val) => acc + val, 0);
    }

    derivative(k = 1) {
        super.derivative(k);
        let derivative = new Polynomial({
            coeffs: k >= this.coeffs.length ? [0] : this.coeffs.slice(k),
            // base: this.base.map(baseFn => baseFn.derivative(k))
        });
        // console.log(`Polynomial#derivative( k = ${k} )`);
        // console.log("degree =", this.degree);
        // console.log("derivative =", derivative);
        // console.log("base =", this.base);
        // console.log("--------------------");
        return derivative;
    }

    static get Base() { return PolynomialBase; }

}

class PolynomialBase extends Method {

    get range() {
        return 1;
    }

    get degree() {
        return this[$degree] || 0;
    }

    set degree(degree) {
        degree = parseInt(degree);
        _.assert(_.is.number(degree), "The degree of a base function has to be a number.");
        _.set(this, $degree, degree);
    }

    get coeffs() {
        if (this[$coeffs] === undefined) this.coeffs = [1];
        return this[$coeffs];
    }

    set coeffs(coeffs) {
        coeffs = Tensor.from(coeffs);
        _.assert(coeffs.length === 1, "This is the scaling factor for the derivation.");
        _.set(this, $coeffs, coeffs);
    }

    compute(...args) {
        let [xTensor] = super.compute(...args);
        return this.degree < 0 ? 0 : xTensor[0] ** this.degree;
    }

    derivative(k = 1) {
        super.derivative(k);
        let factor = new Uint32Array(k).fill(this.degree).reduce((acc, val, i) => acc * (val - i), 1);
        let derivative = new PolynomialBase({ degree: Math.max(0, this.degree - k), coeffs: [(factor * this.coeffs[0])] });
        // console.log(`PolynomialBase#derivative( k = ${k} )`);
        // console.log("degree =", this.degree);
        // console.log("factor =", factor);
        // console.log("derivative =", derivative);
        // console.log("--------------------");
        return derivative;
    }

}

module.exports = Polynomial;