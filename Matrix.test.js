const
    // numeric = require("numeric"),
    Matrix = require("./Matrix.js");

let m1 = Matrix.of(3, 3, Math.random);
console.log(m1);

// let m2 = Matrix.from(JSON.parse(JSON.stringify(m1)));
// console.log(m2);
// console.log("equal:", m1.toString() === m2.toString());

// let m3 = Matrix.gaussElim(m1);
// console.log(m3);