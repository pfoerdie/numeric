const Tensor = require("./Tensor.js");

// const t0 = new Tensor(3, 3);
// t0[5] = Number.EPSILON; t0[2] = Math.PI; t0[4] = Math.E;

// const t1 = Tensor.from(t0).add(t0);
// t1[0] = Number.MAX_VALUE;
// t1[6] = 4; t1[7] = 2; t1[8] = 0;

// const t2 = t1.map((value, [i, j]) => value * (i + j));
// t2[8] = Number.MAX_SAFE_INTEGER;

// console.log("t0: " + t0);
// console.log("t1: " + t1);
// console.log("t2: " + t2);
// console.log(Tensor.product(t0, 42));
// console.log(Tensor.product(t0, t1, 2));

function logTensor(label, tensor) {
    console.log(`${label}: Tensor<${tensor.size}> [${tensor}]`);
}

const A = new Tensor(4, 3);
const B = new Tensor(3, 2);
const v = new Tensor(3);
v[0] = 1; v[1] = 2; v[2] = 3;
B[0] = 1; B[1] = 2; B[5] = 3;
A[0] = 1; A[4] = 1; A[8] = 1;
console.log("A: " + A);
console.log("B: " + B);
console.log("v: " + v);
console.log("A*v: " + Tensor.product(A, v, 1));
console.log("A*B: " + Tensor.product(A, B, 1));