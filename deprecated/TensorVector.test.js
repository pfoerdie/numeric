const
    // numeric = require("numeric"),
    Vector = require("../Vector.js"),
    TensorVector = require("./TensorVector.js");

const size = 100;
const iterations = 10;
const count = 1000;

let v = Vector.of(size);
let tv = TensorVector.of(size);

for (let k = 0; k < iterations; k++) {
    let ak = new Array(size).fill().map(Math.random);

    ak.reduce((acc, val) => acc + val);

    console.time(`tv[k=${k}]`);
    let tvk = TensorVector.from(ak);
    for (let i = 0; i < count; i++) {
        tv = TensorVector.sum(tv, tvk);
    }
    console.timeEnd(`tv[k=${k}]`);

    ak.reduce((acc, val) => acc + val);

    console.time(`v[k=${k}]`);
    let vk = Vector.from(ak);
    for (let i = 0; i < count; i++) {
        v = Vector.sum(v, vk);
    }
    console.timeEnd(`v[k=${k}]`);

    ak.reduce((acc, val) => acc + val);

    // console.log(`v[k=${k}]=${v}`);
    // tv.value.then((v) => console.log(`tv[k=${k}]=${v}`));
}