const { Tensor } = Numeric = require("../src/index.js");
const randomNumber = () => Math.floor(Math.random() * 100);
const randomFloatArr = (size) => (new Float64Array(size)).map(randomNumber);
const formatTable = (str) => str.replace(/,(?=\[)/g, ",\n").replace(/,(?=\d)/g, ", ");
const printTensor = (tensor) => formatTable(JSON.stringify(tensor));

const t0 = new Tensor([4, 5], randomFloatArr(20));
console.log("t0:", printTensor(t0));
const t1 = Tensor.fromJSON(t0.toJSON());
console.log("t0 and t1 equal?", JSON.stringify(t0) === JSON.stringify(t1));