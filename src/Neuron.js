const { assert, is } = require("./util.js");
const Tensor = require("./Tensor.js");

class Axon {

    /**
     * @param {Neuron} source 
     * @param {Neuron|Axon} target 
     * @param {Tensor} tensor 
     */
    constructor(source, target, tensor) {
        /** @type {Neuron} */
        this.source = source;
        /** @type {Neuron} */
        this.target = target;
        /** @type {Tensor} */
        this.tensor = tensor;
        source._outputs.set(target, this);
        target._inputs.set(source, this);
        Object.freeze(this);
    } // Axon#constructor

    /**
     * @returns {Boolean} 
     */
    delete() {
        return this.source._outputs.delete(this.target)
            || this.target._inputs.delete(this.source);
    } // Axon#delete

} // Axon

class Neuron {

    /**
     * @param {Array<Number>|Number|Float64Array} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|Number} [data] The length of the data must be the product of the size.
     * @param {...Array<Number>} [args] The rest arguments for the size, if a number is supplied.
     */
    constructor(size, data, ...args) {
        /** @type {Tensor} */
        this.tensor = new Tensor(size, data, ...args);
        /** @type {Map<Neuron, Axon>} */
        this._inputs = new Map();
        /** @type {Map<Neuron, Axon>} */
        this._outputs = new Map();
        Object.freeze(this);
    } // Neuron#constructor

    /**
     * @returns {Iterator<Axon>} 
     */
    outputs() {
        return this._outputs.values();
    } // Neuron#outputs

    /**
     * @returns {Iterator<Axon>} 
     */
    inputs() {
        return this._inputs.values();
    } // Neuron#inputs

    /**
     * @param {Neuron|Axon} target 
     * @param {Array<Number>|Number|Float64Array} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|Number} [data] The length of the data must be the product of the size.
     * @param {...Array<Number>} [args] The rest arguments for the size, if a number is supplied.
     * @returns {Axon|undefined} 
     */
    connect(target, size, data, ...args) {
        assert((target instanceof Neuron) || (target instanceof Axon), "The target must be an instance of Neuron or Axon.");
        if (!this._outputs.has(target))
            return new Axon(this, target, new Tensor(size, data, ...args));
    } // Neuron#connect

} // Neuron

module.exports = Neuron;