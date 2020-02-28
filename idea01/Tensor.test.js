const Tensor = require("./Tensor.js");

const t0 = new Tensor(3, 3);
t0[5] = Number.EPSILON; t0[2] = Math.PI; t0[4] = Math.E;

const t1 = Tensor.from(t0).add(t0);
t1[0] = Number.MAX_VALUE;
t1[6] = 4; t1[7] = 2; t1[8] = 0;

const t2 = t1.map((value, [i, j]) => value * (i + j));
t2[8] = Number.MAX_SAFE_INTEGER;

console.log("t0: " + t0);
console.log("t1: " + t1);
console.log("t2: " + t2);