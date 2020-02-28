const Tensor = require("./Tensor.js");

const t0 = new Tensor(3, 3);

t0[0] = Number.EPSILON;
t0[2] = Math.PI;
t0[4] = Math.E;

const t1 = Tensor.from(t0);
t1[6] = 4;
t1[7] = 2;
const t2 = t1.map((val, i, j) => val * (i + j));

console.log("t0: " + t0.join(", "));
console.log("t1: " + t1.join(", "));
console.log("t2: " + t2.join(", "));