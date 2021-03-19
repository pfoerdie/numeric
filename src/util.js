const _ = exports;

_.assert = (value, errMsg = '', errType = Error) => {
    if (!value) {
        const err = new errType(errMsg);
        Error.captureStackTrace(err, _.assert);
        throw err;
    }
};

_.is = function (value) {
    return (value ?? null) === null;
};

_.is.number = function (value) {
    return typeof value === "number" && !isNaN(value);
};

_.is.number.minmax = function (min = - Infinity, max = Infinity) {
    return function (value) {
        return typeof value === "number" && value >= min && value <= max;
    };
};

_.is.number.integer = function (value) {
    return typeof value === "number" && value === parseInt(value);
};

_.is.number.integer.minmax = function (min = - Infinity, max = Infinity) {
    return function (value) {
        return typeof value === "number" && value === parseInt(value) && value >= min && value <= max;
    };
};

_.is.number.finite = function (value) {
    return typeof value === "number" && value < Infinity && value > -Infinity;
};

_.is.string = function (value) {
    return typeof value === "string";
};

_.is.string.nonempty = function (value) {
    return typeof value === "string" && value.length > 0;
};

_.is.array = function (value) {
    return Array.isArray(value);
};

_.is.array.nonempty = function (value) {
    return Array.isArray(value) && value.length > 0;
};

_.is.object = function (value) {
    return typeof value == "object";
};

_.is.object.nonnull = function (value) {
    return typeof value == "object" && value !== null;
};

_.is.function = function (value) {
    return typeof value === "function";
};