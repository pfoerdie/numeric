const { Tensor } = Numeric = require("../src/index.js");
const randomNumber = () => Math.floor(Math.random() * 100);
const randomFloatArr = (size) => (new Float64Array(size)).map(randomNumber);
const formatTable = (str) => str.replace(/,(?=\[)/g, ",\n").replace(/,(?=\d)/g, ", ");
const printTensor = (tensor) => formatTable(JSON.stringify(tensor));

const t0 = new Tensor([4, 5], randomFloatArr(20));
console.log(printTensor(t0));