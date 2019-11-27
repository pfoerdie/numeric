const
    _ = require("./tools.js"),
    { Vec1 } = Vector = require("./Vector.js");

class Matrix extends Float64Array {

    /**
     * Constructs a matrix of given dimensions.
     * Entries are stored as one array, with the rows concatenated.
     * @param {number} [rows=1] 
     * @param {number} [cols=1] 
     * @constructs Matrix
     * @extends Float64Array
     */
    constructor(rows = 1, cols = 1) {
        rows = parseInt(rows);
        _.assert(_.is.number(rows) && rows > 0 && rows < Infinity && Math.trunc(rows) === rows, "invalid rows");
        cols = parseInt(cols);
        _.assert(_.is.number(cols) && cols > 0 && cols < Infinity && Math.trunc(cols) === cols, "invalid columns");
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
                res[i][j] = this[i * this.cols + j];
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
        res[0] = this[i * this.cols + j];
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
                    res[i * cols + j] = v;
                } else {
                    res[i * cols + j] = isVec ? val[0] : val;
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
                    res[i * cols + j] = arr[i][j];
                }
            }
            return res;
        }
    }

    static get [Symbol.species]() {
        return Matrix;
    }

    /**
     * Executes the gaussian elimination on a matrix.
     * @param {Matrix} arr
     * @returns {Matrix} 
     * @static
     */
    static gaussElim(mat) {
        _.assert(mat instanceof Matrix, "not a matrix");

        /** @type {Array<Vector>} */
        let arr = mat.toJSON(); // array of rows
        let p_row = 0, p_col = 0; // pivot row and column

        while (p_row < mat.rows && p_col < mat.cols) {

            // find next pivot
            let ni = p_row, nv = arr[ni][p_col];
            for (let i = p_row + 1; i < mat.rows; i++) {
                let v = arr[i][p_col];
                if (Math.abs(v) > Math.abs(nv)) { ni = i; nv = v; }
            }

            if (nv === 0) {
                // no pivot found, so increase pivot column
                p_col++;
            } else {
                // else swap with pivot row
                let tmp = arr[p_row]; arr[p_row] = arr[ni]; arr[ni] = tmp;

                // then reduce rows below
                for (let i = 0; i < mat.rows; i++) {
                    if (i !== p_row) {
                        arr[i] = Vector.sum(arr[i], Vector.scalarProd(arr[p_row], - arr[i][p_col] / arr[p_row][p_col]));
                        arr[i][p_col] = 0;
                    }
                }

                // increase both pivots
                p_col++; p_row++;
            }

        } // while

        return Matrix.from(arr);
    }

}

module.exports = Matrix;