const
    { algebra: { Tensor } } = require('../src');

function randomTensor(...size) {
    const tensor = new Tensor(size);
    for (let [index] of tensor.entries()) {
        tensor.data[index] = Math.round(200 * Math.random() - 100);
    }
    return tensor;
} // randomTensor

console.log('generating ...');
const
    tests = [],
    min_degree = 1,
    max_degree = 5,
    min_basis_part = 1,
    max_basis_part = 5,
    min_factor_part = 1,
    max_factor_part = 5;
console.log('from %d to %d degree', min_degree, max_degree);
console.log('from %d to %d basis part', min_basis_part, max_basis_part);
console.log('from %d to %d factor part', min_factor_part, max_factor_part);
for (let degree = min_degree; degree <= max_degree; degree++) {
    for (let basis_part = min_basis_part; basis_part <= max_basis_part; basis_part++) {
        for (let factor_part = min_factor_part; factor_part <= max_factor_part; factor_part++) {
            const basis = randomTensor(...Array.from({ length: basis_part + degree }, () => Math.floor(2 + Math.random() * 8)));
            const factor = randomTensor(...basis.size.slice(-degree), ...Array.from({ length: factor_part }, () => Math.floor(2 + Math.random() * 8)));
            tests.push({ basis, factor, degree });
        }
    }
    console.log('%d%%', 100 * (1 + degree - min_degree) / (1 + max_degree - min_degree));
}
console.log('tests: %d', tests.length);

console.log('\ntesting ...');
let time, diff, product_timeSum = 0, naiveProduct_timeSum = 0, improvedProduct_timeSum = 0;
for (let i = 0, max = tests.length; i < max; i++) {
    const test = tests[i];
    console.log('[%d/%d]: Basis<%s> *%d Factor<%s>', i + 1, max, test.basis.size.join(), test.degree, test.factor.size.join());

    time = process.hrtime();
    test.product = Tensor.product(test.basis, test.factor, test.degree);
    diff = process.hrtime(time);
    test.product_time = diff[0] * 1e9 + diff[1];
    product_timeSum += test.product_time;

    time = process.hrtime();
    test.improvedProduct = Tensor.improvedProduct(test.basis, test.factor, test.degree);
    diff = process.hrtime(time);
    test.improvedProduct_time = diff[0] * 1e9 + diff[1];
    improvedProduct_timeSum += test.improvedProduct_time;

    time = process.hrtime();
    test.naiveProduct = Tensor.naiveProduct(test.basis, test.factor, test.degree);
    diff = process.hrtime(time);
    test.naiveProduct_time = diff[0] * 1e9 + diff[1];
    naiveProduct_timeSum += test.naiveProduct_time;
}

console.log('\nnaive product:     %d s', 1e-9 * naiveProduct_timeSum);

console.log('\nimproved product:  %d s', 1e-9 * improvedProduct_timeSum);
console.log('~ %d times faster than naive', Math.round(10 * naiveProduct_timeSum / improvedProduct_timeSum) / 10);

console.log('\nfast product:      %d s', 1e-9 * product_timeSum);
console.log('~ %d times faster than naive', Math.round(10 * naiveProduct_timeSum / product_timeSum) / 10);
console.log('~ %d times faster than improved', Math.round(10 * improvedProduct_timeSum / product_timeSum) / 10);