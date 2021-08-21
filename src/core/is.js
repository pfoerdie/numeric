const
    is = exports,
    util = require('@pfoerdie/utility');

is.defined = (val) => (val ?? null) === null;

is.number = (val) => typeof val === "number" && !isNaN(val);
is.number.minmax = (min = - Infinity, max = Infinity) =>
    (val) => is.number(val) && val >= min && val <= max;
is.number.integer = (val) => Number.isInteger(val);
is.number.integer.minmax = (min = - Infinity, max = Infinity) =>
    (val) => is.number.integer(val) && val >= min && val <= max;
is.number.finite = (val) => Number.isFinite(val);
is.number.bigint = (val) => typeof val === 'bigint';

is.string = (val) => typeof val === "string";
is.string.nonempty = (val) => is.string(val) && val.length > 0;

is.array = (val) => Array.isArray(val) || ArrayBuffer.isView(val);
is.array.nonempty = (val) => is.array(val) && val.length > 0;

is.object = (val) => typeof val == "object";
is.object.nonnull = (val) => val && is.object(val);

is.function = (value) => typeof value === "function";

util.prop.lock.deep(is);