const Tensor = require("./Tensor.js");

let A = new Tensor([
    2, 3
], Float64Array.from([
    1, 2, 3,
    4, 5, 6
]));

let v = new Tensor([
    2
], Float64Array.from([
    3, 7
]));

let w = new Tensor(2);

console.log(v);
console.log(Array.from(A.entries()));
console.log(
    v === w,
    v.dim === w.dim,
    v.buffer === w.buffer,
    v.size === w.size,
    v.offset === w.offset
);