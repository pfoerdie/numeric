const
    _ = require("./tools.js"),
    { Vec1 } = Vector = require("./Vector.js");

class Matrix extends Float64Array {

    /**
     * Constructs a matrix of given dimensions.
     * Entries are stored as one array, with the rows concatenated.
     * @param {number} rows 
     * @param {number} cols 
     * @constructs Matrix
     * @extends Float64Array
     */
    constructor(rows, cols) {
        rows = parseInt(rows);
        _.assert(_.is.number(rows) && rows > 0, "invalid rows");
        cols = parseInt(cols);
        _.assert(_.is.number(cols) && cols > 0, "invalid columns");
        super(rows * cols);
        _.define(this, "rows", rows);
        _.define(this, "cols", cols);
    }

    /**
     * Returns the matrix as array of row vectors.
     * @returns {Array<Vector>}
     */
    toJSON() {
        let res = new Array(this.rows);
        for (let i = 0; i < this.rows; i++) {
            res[i] = new Vector(this.cols);
            for (let j = 0; j < this.cols; j++) {
                res[i][j] = this[i * this.rows + j];
            }
        }
        return res;
    }

    /**
     * Size of a matrix, equal to its rows and cols.
     * @type {[number, number]}
     */
    get size() {
        return [this.rows, this.cols];
    }

    /**
     * Provides a 1d-vector for a given entry in this vector.
     * @param {number} i row
     * @param {number} j column
     * @returns {Vec1}
     */
    get(i, j) {
        _.assert(_.is.number(i) && i === parseInt(i) && i >= 0 && i < this.rows, "invalid index");
        _.assert(_.is.number(j) && j === parseInt(j) && j >= 0 && j < this.cols, "invalid jndex");
        let res = Vector.of(1);
        res[0] = this[i * this.rows + j];
        return res;
    }

    static of(rows, cols, val = 0) {
        let res = new Matrix(rows, cols);
        if (!val) return res;
        let isVec = val instanceof Vec1;
        let isFn = (typeof val === "function");
        _.assert(isVec || isFn || _.is.number(val), "not a number");
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (isFn) {
                    let v = val(i, j);
                    _.assert(_.is.number(v), "not a number");
                    res[i * rows + j] = v;
                } else {
                    res[i * rows + j] = isVec ? val[0] : val;
                }
            }
        }
        return res;
    }

    /**
     * Constructs a matrix from an array of rows.
     * @param {Matrix|Array<Vector|Array<number>>} arr
     * @returns {Matrix} 
     * @static
     */
    static from(arr) {
        if (arr instanceof Matrix) {
            let res = new Matrix(arr.rows, arr.cols);
            for (let i = 0; i < arr.length; i++) {
                res[i] = arr[i];
            }
            return res;
        } else {
            _.assert(_.is.array(arr) && arr.every((row, i) => (row instanceof Vector || (_.is.array(row) && row.every(_.is.number))) && (!i || row.length === arr[0].length)), "no matrix array of rows");
            _.assert(arr.length > 0 && arr[0].length > 0, "to few entries");
            let rows = arr.length, cols = arr[0].length;
            let res = Matrix.of(rows, cols);
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    res[i * rows + j] = arr[i][j];
                }
            }
            return res;
        }
    }

    static gaussElim(mat) {
        _.assert(mat instanceof Matrix, "not a matrix");
        // _.assert(mat.cols > 1, "at least 2 columns needed");
        if (mat.cols === 1) return Matrix.of(mat.rows, mat.cols, i => i ? 0 : 1);
        /** @type {Array<Vector>} */
        let arr = mat.toJSON();
        main: for (let k = 0, kmax = Math.min(mat.rows, mat.cols - 1); k < kmax; k++) {

            // big TODO

            if (arr[k][k] === 0) {
                let next_k = arr.findIndex((row, i) => i > k && row[k] !== 0);
                if (next_k < 0) break main;
                _.assert(next_k > k, "not diag");
                let tmp = arr[k];
                arr[k] = arr[next_k];
                arr[next_k] = tmp;
            }
            for (let i = k + 1; i < mat.cols; i++) {

            }
        }
        throw new Error("not implemented yet");
        return Matrix.from(arr);
    }

}

module.exports = Matrix;