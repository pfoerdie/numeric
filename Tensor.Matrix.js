/**
 * @module Numeric.Matrix
 */

const _ = require("./tools.js");
const Tensor = require("./Tensor.js");

class Matrix extends Tensor {

    constructor(rows, columns) {
        super(rows, columns);
    }

} // Matrix

module.exports = Matrix;