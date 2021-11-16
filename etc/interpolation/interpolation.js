(function () {

    const _ = {
        define(obj, key, value, get, set) {
            Object.defineProperty(obj, key, (get || set) ? { get, set } : { value });
        },
        enumerate(obj, key, value, get, set) {
            let enumerable = true;
            Object.defineProperty(obj, key, (get || set) ? { get, set, enumerable } : { value, enumerable });
        },
        assert(value, msg, errType = Error) {
            if (!value) {
                let err = msg instanceof Error ? msg : new errType(msg);
                Error.captureStackTrace(err, _.assert);
                throw err;
            }
        },
        is: {
            number: val => typeof val === 'number' && !isNaN(val) && val > - Infinity && val < Infinity,
            array: val => Array.isArray(val),
            function: val => typeof val === 'function'
        }
    };

    function _defaultGen(n, k) {
        if (n - k < 0) return (x) => 0;
        let j = n - k, q = 1;
        for (let i = j + 1; i <= n; i++)
            q *= i;
        return (x) => q * (x ** j);
    } // _defaultGen

    _.define(window, 'Polynom', Polynom);
    function Polynom(coeffs, base, ...derivations) {
        _.assert(_.is.array(coeffs) && coeffs.every(_.is.number));
        _.assert(coeffs.length > 1);
        if (base) {
            if (_.is.function(base))
                base = coeffs.map((coeff, n) => base(n));
            _.assert(_.is.array(base) && base.every(_.is.function));
            _.assert(base.length == coeffs.length);
            derivations = derivations.map(deriv => _.is.function(deriv) ? coeffs.map((coeff, n) => deriv(n)) : deriv);
            _.assert(derivations.every(derivBase => _.is.array(derivBase) && derivBase.length == coeffs.length && derivBase.every(_.is.function)));
        } else {
            _.assert(derivations.length == 0);
            base = coeffs.map((coeff, n) => _defaultGen(n, 0));
            for (let k = 1; k < coeffs.length; k++)
                derivations.push(coeffs.map((coeff, n) => _defaultGen(n, k)));
        }
        let P = (x) => coeffs.reduce((sum, coeff, n) => sum + coeff * base[n](x), 0);
        _.define(P, 'derive', function (k = 1) {
            _.assert(_.is.number(k) && k > 0);
            _.assert(k <= derivations.length);
            return Polynom(coeffs, ...(derivations.slice(k - 1)));
        });
        _.define(P, 'base', base.slice(0));
        _.define(P, 'coeffs', coeffs.slice(0));
        return P;
    } // Polynom

    _.define(window, 'BSpline', BSpline);
    function BSpline(args) {
        _.assert(_.is.array(args) && args.every(_.is.number));
        _.assert(args.length > 2 && args.every((val, index) => index == 0 || val > args[index - 1]));
        let coeffs = new Array(args.length);
        for (let k = 0; k < args.length; k++) {
            coeffs[k] = args.length - 1;
            for (let i = 0; i < args.length; i++)
                if (i != k) coeffs[k] *= 1 / (args[k] - args[i]);
        }
        let deg = coeffs.length - 2;
        let genFns = [];
        let xs = args[0];
        let i = 1;
        for (let j = deg; j >= 0; j--) {
            let q = i;
            genFns.push((n) => {
                let xn = args[n];
                return (x) => (x > xs && x < xn) ? q * ((xn - x) ** j) : 0;
            });
            i *= -j;
        }
        return Polynom(coeffs, ...genFns);
    } // BSpline

    function _calcSplineCoeffs(args, values, base, deriv, ...bndValues) {
        let matrix = args.map(arg => base.map(baseFn => baseFn(arg)));
        let coeffs = values.slice(0);
        bndValues.forEach((bnd, k) => {
            coeffs.unshift(bnd[0]);
            matrix.unshift(deriv[k].map(derivFn => derivFn(args[0])));
            if (bnd.length > 1) {
                coeffs.push(bnd[1]);
                matrix.push(deriv[k].map(derivFn => derivFn(args[args.length - 1])));
            }
        });
        for (let i = 0; i < matrix.length; i++) {
            _.assert(matrix[i][i] !== 0);
            let p = 1 / matrix[i][i];
            matrix[i] = matrix[i].map(val => val * p);
            coeffs[i] *= p;
            for (let j = 0; j < matrix.length; j++) {
                if (i != j && matrix[j][i] !== 0) {
                    let q = -matrix[j][i];
                    coeffs[j] += q * coeffs[i];
                    for (let k = i; k < coeffs.length; k++) {
                        matrix[j][k] += q * matrix[i][k];
                    }
                }
            }
        }
        return coeffs;
    }

    _.define(window, 'Spline', Spline);
    function Spline(args, values, ...bndValues) {
        _.assert(_.is.array(args) && args.every(_.is.number));
        _.assert(_.is.array(values) && values.every(_.is.number) && args.length == values.length);
        _.assert(args.length >= 2 && args.every((val, index) => index == 0 || val > args[index - 1]));
        _.assert(bndValues.every(bnd => _.is.array(bnd) && (bnd.length == 1 || bnd.length == 2) && bnd.every(_.is.number)));
        let deg = bndValues.reduce((acc, bnd) => acc + bnd.length, 1);
        let base = new Array(args.length + deg - 1);
        for (let k = 0; k < base.length; k++) {
            let i = k - deg, j = k + 1;
            let baseArgs = args.slice(Math.max(0, i), Math.min(base.length, j + 1));
            if (i < 0) baseArgs.unshift(...(new Array(-i).fill(null).map((val, n) => args[0] + (args[1] - args[0]) * (n + i))));
            if (j >= args.length) baseArgs.push(...(new Array(j - args.length + 1).fill(null).map((val, n) => args[args.length - 1] + (args[args.length - 1] - args[args.length - 2]) * (n + 1))));
            base[k] = BSpline(baseArgs);
        }
        let deriv = bndValues.map((bnd, k) => base.map(bspline => bspline.derive(k + 1)));
        function updateValues(newValues) {
            _.assert(_.is.array(newValues) && newValues.every(_.is.number) && args.length == newValues.length);
            let coeffs = _calcSplineCoeffs(args, newValues, base, deriv, ...bndValues);
            let S = Polynom(coeffs, base, ...deriv);
            _.define(S, 'update', updateValues);
            return S;
        }
        return updateValues(values);
    } // Spline

})();