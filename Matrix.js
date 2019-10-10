const _ = require("./tools.js");

class Matrix extends Float64Array {

    constructor(width, height) {
        width = parseInt(width);
        _.assert(_.is.number(width) && width > 0, "invalid width");
        height = parseInt(height);
        _.assert(_.is.number(height) && height > 0, "invalid height");
        super(width * height);
        _.define(this, "width", width);
        _.define(this, "height", height);
    }

}

module.exports = Matrix;