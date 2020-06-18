const { assert, is, uuid } = require("./util.js");
const Tensor = require("./Tensor.js");

/** @type {WeakSet<Tensor>} */
const assignedTensors = new WeakSet();

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
        assignedTensors.add(tensor);

    } // Axon#constructor

    /**
     * @returns {Boolean} 
     */
    delete() {
        const rmTarget = this.source._outputs.delete(this.target);
        const rmSource = this.target._inputs.delete(this.source);
        return rmTarget || rmSource;
    } // Axon#delete

} // Axon

class Neuron {

    /**
     * @param {Array<Number>|Number|Float64Array|Tensor} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|Number} [data] The length of the data must be the product of the size.
     * @param {...Array<Number>} [args] The rest arguments for the size, if a number is supplied.
     */
    constructor(size, data, ...args) {

        if (size instanceof Tensor) {
            /** @type {Tensor} */
            assert(!assignedTensors.has(size),
                "The tensor has already been used to construct a Neuron or Axon.");
            this.tensor = size;
        } else {
            /** @type {Tensor} */
            this.tensor = new Tensor(size, data, ...args);
        }

        /** @type {Map<Neuron, Axon>} */
        this._inputs = new Map();
        /** @type {Map<Neuron, Axon>} */
        this._outputs = new Map();

        Object.freeze(this);
        assignedTensors.add(this.tensor);

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
     * @param {Array<Number>|Number|Float64Array|Tensor} size The size must only contain one or more integer greater than zero.
     * @param {Float64Array|Number} [data] The length of the data must be the product of the size.
     * @param {...Array<Number>} [args] The rest arguments for the size, if a number is supplied.
     * @returns {Axon|undefined} 
     */
    connect(target, size, data, ...args) {
        assert((target instanceof Neuron) || (target instanceof Axon), "The target must be an instance of Neuron or Axon.");
        if (!this._outputs.has(target)) {
            if (size instanceof Tensor) {
                assert(!assignedTensors.has(size),
                    "The tensor has already been used to construct a Neuron or Axon.");
                return new Axon(this, target, size);

            } else {
                return new Axon(this, target, new Tensor(size, data, ...args));
            }
        }
    } // Neuron#connect

    /**
     * @returns {{"@graph": Array<{"@type": "Neuron"|"Axon", "@id": Number, tensor: JSON<Tensor>, source: Number, target: Number}>}}
     */
    toJSON() {
        /** @type {Map<Neuron|Axon, Number>} */
        const idMap = new Map();
        /** @type {Number} */
        let currentID = 0;

        (function visit(elem) {
            if (idMap.has(elem)) return;
            if (elem instanceof Neuron) {
                /** @type {Neuron} */
                const neuron = elem;
                idMap.set(neuron, currentID++);
                for (let input of neuron._inputs.values()) {
                    visit(input);
                }
                for (let output of neuron._outputs.values()) {
                    visit(output);
                }
            } else if (elem instanceof Axon) {
                /** @type {Axon} */
                const axon = elem;
                idMap.set(axon, currentID++);
                visit(axon.source);
                visit(axon.target);
            }
        })(this);

        const json = {
            "@graph": []
        };

        for (let [elem, id] of idMap.entries()) {
            if (elem instanceof Neuron) {
                /** @type {Neuron} */
                const neuron = elem;
                json["@graph"].push({
                    "@type": "Neuron",
                    "@id": id,
                    "tensor": neuron.tensor.toJSON()
                });
            } else if (elem instanceof Axon) {
                /** @type {Axon} */
                const axon = elem;
                json["@graph"].push({
                    "@type": "Axon",
                    "@id": id,
                    "source": idMap.get(axon.source),
                    "target": idMap.get(axon.target),
                    "tensor": axon.tensor.toJSON()
                });
            }
        }

        idMap.clear();
        return json;
    } // Neuron#toJSON

    /**
     * @param {{"@graph": Array<{"@type": "Neuron"|"Axon", "@id": Number, tensor: JSON<Tensor>, source: Number, target: Number}>}} json 
     */
    static fromJSON(json) {
        if (is.string(json)) json = JSON.parse(json);
        assert(is.object.nonnull(json) && is.array.nonempty(json["@graph"]),
            "The json must include a serialized Neuron graph.");
        // TODO
    } // Neuron.fromJSON

} // Neuron

module.exports = Neuron;