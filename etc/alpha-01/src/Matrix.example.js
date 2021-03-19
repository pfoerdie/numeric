const
    // numeric = require("numeric"),
    Matrix = require("./Matrix.js"),
    m2s = (m) => "\n" + m.toJSON().map(r => r.join("\t")).join("\n");

let m1 = Matrix.of(6, 1, Math.random);
// console.log(m1);
console.log("\nm1:" + m2s(m1));
// console.log(m1.get(m1.rows - 1, m1.cols - 1));

let m2 = Matrix.from([
    [1, -(1), 0],
    [1, -(-1), 1],
    [1, -(1), 0],
    [1, -(1), 0]
]);

let m3 = Matrix.gaussElim(m1);
console.log("\nm3:" + m2s(m3));