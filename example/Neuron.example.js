const { Neuron } = require("../src/index.js");
const randomNumber = () => Math.floor(Math.random() * 100);
const randomFloatArr = (size) => (new Float64Array(size)).map(randomNumber);
const getJSON = (obj) => JSON.stringify(obj).replace(/[,:\[\]{}()]/g, match => match + " ").replace(/"/g, "");
const activator = (value, bias) => (Math.tanh(value - bias) + 1) / 2;
// const results = [];

// for (let i = 0; i < 10; i++) {

//     const n0 = new Neuron(randomFloatArr(2));
//     const n1 = new Neuron(randomFloatArr(2));
//     const n2 = new Neuron(randomFloatArr(2));

//     const a0_1 = n0.connect(n1, randomFloatArr(1));
//     const a1_2 = n1.connect(n2, randomFloatArr(1));

//     const v0 = activator(n0.tensor.data[0], n0.tensor.data[1]);
//     if (v0 < .5) continue;
//     n1.tensor.data[0] += n0.tensor.data[0] * a0_1.tensor.data[0];
//     const v1 = activator(n1.tensor.data[0], n1.tensor.data[1]);
//     if (v1 < .5) continue;
//     n2.tensor.data[0] += n1.tensor.data[0] * a1_2.tensor.data[0];
//     const v2 = activator(n2.tensor.data[0], n2.tensor.data[1]);
//     if (v2 < .5) continue;
//     results.push({ n0: n0.toJSON(), a0_1: a0_1.toJSON(), n1: n1.toJSON(), a1_2: a1_2.toJSON(), n2: n2.toJSON() });
// }

// console.log(...results);

((/* IIFE */) => {
    const n0 = new Neuron(randomFloatArr(2));
    const n1 = new Neuron(randomFloatArr(2));
    const n2 = new Neuron(randomFloatArr(2));

    const a0_1 = n0.connect(n1, randomFloatArr(1));
    const a1_2 = n1.connect(n2, randomFloatArr(1));

    const m0 = Neuron.fromJSON(JSON.stringify(n0));
    console.log(
        n0.tensor.data, m0.tensor.data,
        n0 === m0,
        n0.tensor === m0.tensor,
        n0.tensor.data === m0.tensor.data
    );
    console.log("\n" + getJSON(m0));
})(/* IIFE */);