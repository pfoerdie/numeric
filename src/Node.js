const { assert, is } = require("./util.js");
const Tensor = require("./Tensor.js");

class Edge {

    /**
     * @param {Node} source 
     * @param {Node|Edge} target 
     * @param {Tensor} tensor 
     */
    constructor(source, target, tensor) {
        /** @type {Node} */
        this.source = source;
        /** @type {Node} */
        this.target = target;
        /** @type {Tensor} */
        this.tensor = tensor;
        source._outputs.set(target, this);
        target._inputs.set(source, this);
        Object.freeze(this);
    } // Edge#constructor

    /**
     * @returns {Boolean} 
     */
    delete() {
        return this.source._outputs.delete(this.target)
            || this.target._inputs.delete(this.source);
    } // Edge#delete

} // Edge

class Node {

    /**
     * @param {Array<Number>|Number} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|Number} [data] The length of the data must be the product of the size.
     * @param {...Array<Number>} [args] The rest arguments for the size, if a number is supplied.
     */
    constructor(size, data, ...args) {
        /** @type {Tensor} */
        this.tensor = new Tensor(size, data, ...args);
        /** @type {Map<Node, Edge>} */
        this._inputs = new Map();
        /** @type {Map<Node, Edge>} */
        this._outputs = new Map();
        Object.freeze(this);
    } // Node#constructor

    /**
     * @returns {Iterator<Edge>} 
     */
    outputs() {
        return this._outputs.values();
    } // Node#outputs

    /**
     * @returns {Iterator<Edge>} 
     */
    inputs() {
        return this._inputs.values();
    } // Node#inputs

    /**
     * @param {Node|Edge} target 
     * @param {Array<Number>|Number} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|Number} [data] The length of the data must be the product of the size.
     * @param {...Array<Number>} [args] The rest arguments for the size, if a number is supplied.
     * @returns {Edge|undefined} 
     */
    connect(target, size, data, ...args) {
        assert((target instanceof Node) || (target instanceof Edge), "The target must be an instance of Node or Edge.");
        if (!this._outputs.has(target))
            return new Edge(this, target, new Tensor(size, data, ...args));
    } // Node#connect

} // Node

module.exports = Node;