/**
 * @module Numeric.Vector
 */

const _ = require("./tools.js");
const Tensor = require("./Tensor.js");

class Vector extends Tensor {

    constructor(length) {
        super(length);
    }

} // Vector

module.exports = Vector;