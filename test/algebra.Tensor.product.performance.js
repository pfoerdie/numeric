const
    { algebra: { Tensor } } = require('../src');

function randomTensor(...size) {
    const tensor = new Tensor(size);
    for (let [index] of tensor.entries()) {
        tensor.data[index] = Math.round(200 * Math.random() - 100);
    }
    return tensor;
} // randomTensor

const tests = [];
console.log('generating ...');
for (let degree = 1; degree <= 3; degree++) {
    for (let basis_part = 0; basis_part <= 2; basis_part++) {
        for (let factor_part = 0; factor_part <= 2; factor_part++) {
            const basis = randomTensor(...Array.from({ length: basis_part + degree }, () => Math.floor(2 + Math.random() * 8)));
            const factor = randomTensor(...basis.size.slice(-degree), ...Array.from({ length: factor_part }, () => Math.floor(2 + Math.random() * 8)));
            tests.push({ basis, factor, degree });
        }
    }
}
console.log('tests: ' + tests.length);

console.log('testing ...');
let time, diff, product_timeSum = 0, naiveProduct_timeSum = 0;
for (let test of tests) {
    time = process.hrtime();
    test.product = Tensor.product(test.basis, test.factor, test.degree);
    diff = process.hrtime(time);
    test.product_time = diff[0] * 1e9 + diff[1];
    product_timeSum += test.product_time;

    time = process.hrtime();
    test.naiveProduct = Tensor.naiveProduct(test.basis, test.factor, test.degree);
    diff = process.hrtime(time);
    test.naiveProduct_time = diff[0] * 1e9 + diff[1];
    naiveProduct_timeSum += test.naiveProduct_time;
}

console.log('percentage: ' + (100 * product_timeSum / naiveProduct_timeSum) + '%');