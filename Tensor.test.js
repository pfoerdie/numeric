const
    Tensor = require("./Tensor.js");

let
    t1 = new Tensor(3, 3, 3),
    t2 = Tensor.from([0, 1, 2, 3]);

t1.forEach((val, i) => t1[i] = Math.trunc(100 * Math.random()) / 10);

console.log(t1.toString());
console.log(t1.getPosition(t1.getIndex(2, 1, 0)));
console.log(t1.getValue(2, 1, 0) === t1[t1.getIndex(2, 1, 0)]);