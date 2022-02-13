const
    { algebra: { Tensor } } = require('../src'),
    config = {
        min_degree: 1,
        max_degree: 3,
        min_basis_part: 1,
        max_basis_part: 3,
        min_factor_part: 1,
        max_factor_part: 3,
        min_dim_size: 2,
        max_dim_size: 9,
        do_naive_product: true,
        do_improved_product: true,
        do_fast_product: true
    };

function randomTensor(...size) {
    const tensor = new Tensor(size);
    for (let [index] of tensor.entries()) {
        tensor.data[index] = Math.round(200 * Math.random() - 100);
    }
    return tensor;
} // randomTensor

function randomTensorSize(dim, min, max) {
    return Array.from(
        { length: dim },
        () => Math.floor(min + Math.random() * (max + 1 - min))
    );
} // randomTensorSize

function tensorDotProduct(basis, factor) {
    let product = 0;
    for (let index = 0, max = basis.data.length; index < max; index++) {
        product += basis.data[index] * factor.data[index];
    }
    return product;
} // tensorDotProduct

function tensorDataIndex(tensor, indices) {
    let index = 0;
    for (let pos = 0; pos < indices.length; pos++) {
        index += indices[pos] * tensor.offset[pos];
    }
    return index;
} // tensorDataIndex

function naiveTensorProduct(basis, factor, degree = 1) {
    if (basis.dim === degree && factor.dim === degree)
        return tensorDotProduct(basis, factor);

    const product = new Tensor(...basis.size.slice(0, -degree), ...factor.size.slice(degree));
    for (let [b_index, b_value, ...b_indices] of basis.entries()) {
        indexLoop: for (let [f_index, f_value, ...f_indices] of factor.entries()) {
            for (let k = 1; k <= degree; k++) {
                if (b_indices[b_indices.length - k] !== f_indices[degree - k])
                    continue indexLoop;
            }
            const indices = [...b_indices.slice(0, -degree), ...f_indices.slice(degree)];
            const index = tensorDataIndex(product, indices);
            product.data[index] += b_value * f_value;
        }
    }
    return product;
} // naiveTensorProduct

function improvedTensorProduct(basis, factor, degree = 1) {
    if (basis.dim === degree && factor.dim === degree)
        return tensorDotProduct(basis, factor);

    const
        product = new Tensor([...basis.size.slice(0, -degree), ...factor.size.slice(degree)]),
        indices = (new Array(basis.dim + factor.dim - degree)).fill(0),
        size = [...basis.size, ...factor.size.slice(degree)],
        max = indices.length - 1;

    let
        pos = max;

    indexLoop: while (true) {
        const
            p_index = tensorDataIndex(product, [...indices.slice(0, basis.dim - degree), ...indices.slice(basis.dim)]),
            b_index = tensorDataIndex(basis, indices.slice(0, basis.dim)),
            f_index = tensorDataIndex(factor, indices.slice(basis.dim - degree));

        product.data[p_index] += basis.data[b_index] * factor.data[f_index];

        while (indices[pos] === size[pos] - 1) {
            if (pos > 0) pos--;
            else break indexLoop;
        }

        indices[pos]++;
        while (pos < max) {
            pos++;
            indices[pos] = 0;
        }
    }

    return product;
} // improvedTensorProduct

function fastTensorProduct(basis, factor, degree = 1) {
    if (basis.dim === degree && factor.dim === degree)
        return tensorDotProduct(basis, factor);

    const
        product = new Tensor([...basis.size.slice(0, -degree), ...factor.size.slice(degree)]),
        indices = (new Array(basis.dim + factor.dim - degree)).fill(0),
        size = [...basis.size, ...factor.size.slice(degree)],
        max = indices.length - 1,
        b_max = basis.dim - 1,
        f_min = basis.dim - degree,
        p_offset = factor.offset[degree - 1] - 1;

    let
        pos = max,
        p_index = 0,
        b_index = 0,
        f_index = 0;

    indexLoop: while (true) {
        product.data[p_index] += basis.data[b_index] * factor.data[f_index];

        while (indices[pos] === size[pos] - 1) {
            if (pos > 0) pos--;
            else break indexLoop;
        }

        if (pos > b_max) {
            p_index++;
            f_index++;
        } else if (pos < f_min) {
            p_index++;
            b_index++;
            f_index = 0;
        } else {
            p_index -= p_offset;
            b_index++;
            f_index++;
        }

        indices[pos]++;
        while (pos < max) {
            pos++;
            indices[pos] = 0;
        }
    }

    return product;
} // fastTensorProduct

console.log('generating ...');
const tests = [];
console.log('from %d to %d degree', config.min_degree, config.max_degree);
console.log('from %d to %d basis part', config.min_basis_part, config.max_basis_part);
console.log('from %d to %d factor part', config.min_factor_part, config.max_factor_part);
for (let degree = config.min_degree; degree <= config.max_degree; degree++) {
    for (let basis_part = config.min_basis_part; basis_part <= config.max_basis_part; basis_part++) {
        for (let factor_part = config.min_factor_part; factor_part <= config.max_factor_part; factor_part++) {
            const basis = randomTensor(...randomTensorSize(basis_part + degree, config.min_dim_size, config.max_dim_size));
            const factor = randomTensor(...basis.size.slice(-degree), ...randomTensorSize(factor_part, config.min_dim_size, config.max_dim_size));
            tests.push({ basis, factor, degree });
        }
    }
    console.log('%d%%', Math.round(100 * (1 + degree - config.min_degree) / (1 + config.max_degree - config.min_degree)));
}
console.log('tests: %d', tests.length);

console.log('\ntesting ...');
let time, diff, product_timeSum = 0, naiveProduct_timeSum = 0, improvedProduct_timeSum = 0;
for (let i = 0, max = tests.length; i < max; i++) {
    const test = tests[i];
    console.log('\n[%d/%d]: Tensor<%s> *%d Tensor<%s>', i + 1, max, test.basis.size.join(), test.degree, test.factor.size.join());

    if (config.do_fast_product) {
        time = process.hrtime();
        test.product = fastTensorProduct(test.basis, test.factor, test.degree);
        diff = process.hrtime(time);
        test.product_time = diff[0] * 1e9 + diff[1];
        product_timeSum += test.product_time;
    }

    if (config.do_improved_product) {
        time = process.hrtime();
        test.improvedProduct = improvedTensorProduct(test.basis, test.factor, test.degree);
        diff = process.hrtime(time);
        test.improvedProduct_time = diff[0] * 1e9 + diff[1];
        improvedProduct_timeSum += test.improvedProduct_time;
    }

    if (config.do_naive_product) {
        time = process.hrtime();
        test.naiveProduct = naiveTensorProduct(test.basis, test.factor, test.degree);
        diff = process.hrtime(time);
        test.naiveProduct_time = diff[0] * 1e9 + diff[1];
        naiveProduct_timeSum += test.naiveProduct_time;
    }

    if (config.do_naive_product) console.log('naive product:     %d s', 1e-9 * test.naiveProduct_time);
    if (config.do_improved_product) console.log('improved product:  %d s', 1e-9 * test.improvedProduct_time);
    if (config.do_fast_product) console.log('fast product:      %d s', 1e-9 * test.product_time);
}

console.log('\nfinished');

if (config.do_naive_product) console.log('summed naive product:     %d s', 1e-9 * naiveProduct_timeSum);

if (config.do_improved_product) {
    console.log('summed improved product:  %d s', 1e-9 * improvedProduct_timeSum);
    if (config.do_naive_product) console.log('improved product is ~ %d times faster than naive product', Math.round(10 * naiveProduct_timeSum / improvedProduct_timeSum) / 10);
}

if (config.do_fast_product) {
    console.log('summed fast product:      %d s', 1e-9 * product_timeSum);
    if (config.do_naive_product) console.log('fast product is ~ %d times faster than naive product', Math.round(10 * naiveProduct_timeSum / product_timeSum) / 10);
    if (config.do_improved_product) console.log('fast product is ~ %d times faster than improved product', Math.round(10 * improvedProduct_timeSum / product_timeSum) / 10);
}