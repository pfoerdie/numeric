
const Tensor = require("./Tensor.js");
const Method = require("./Method.js");
const Polynomial = require("./Polynomial.js");

let m1 = new Method({ range: 2 });
let m2 = new Polynomial({ coeffs: [4, 3, 2, 1] });
console.log(m1.range);
console.log(m2.coeffs);
m1.range = 3;
console.log(m1.compute(1, 2, 3));
let x = 7;
console.log("********************");
console.log(`m2( x = ${x} ) =`, m2.compute(x));
console.log("********************");
console.log(`m2'( x = ${x} ) =`, m2.derivative(1).compute(x));