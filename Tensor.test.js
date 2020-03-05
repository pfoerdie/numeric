const Tensor = require("./Tensor.js");

const A = new Tensor(4, 3);
const B = new Tensor(3, 2);
const v = new Tensor(3);
const w = new Tensor(3);

B[0] = 1; B[1] = 2; B[5] = 3;
A[0] = 1; A[4] = 1; A[8] = 1;
v[0] = 1; v[1] = 2; v[2] = 3;
w[0] = Math.PI; w[1] = Math.E; w[2] = Number.EPSILON;

console.log("A: " + A);
console.log("B: " + B);
console.log("v: " + v);
console.log("w: " + w);

console.log("v.w: " + v.hadMultiply(w));
console.log("v*w: " + v.multiply(w));
// console.log("A*v: " + A.multiply(v));
console.log("v*B: " + v.multiply(B));
console.log("A*B: " + A.multiply(B));