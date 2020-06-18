const Crypto = require("crypto");

exports.define = function (obj, key, value, get, set) {
    Object.defineProperty(obj, key, (get || set) ? { get, set } : { value });
};

exports.enumerate = function (obj, key, value, get, set) {
    let enumerable = true;
    Object.defineProperty(obj, key, (get || set) ? { get, set, enumerable } : { value, enumerable });
};

exports.assert = function assert(value = false, errMsg = "", errType = Error) {
    if (value) {
        return;
    } else if (errMsg instanceof Error) {
        throw errMsg;
    } else {
        const err = new errType(errMsg);
        Error.captureStackTrace(err, assert);
        throw err;
    }
};

exports.is = {};

exports.is.number = function (value) {
    return typeof value === "number" && !isNaN(value);
};

exports.is.number.minmax = function (min = - Infinity, max = Infinity) {
    return function (value) {
        return typeof value === "number" && value >= min && value <= max;
    };
};

exports.is.number.integer = function (value) {
    return typeof value === "number" && value === parseInt(value);
};

exports.is.number.integer.minmax = function (min = - Infinity, max = Infinity) {
    return function (value) {
        return typeof value === "number" && value === parseInt(value) && value >= min && value <= max;
    };
};

exports.is.number.finite = function (value) {
    return typeof value === "number" && value < Infinity && value > -Infinity;
};

exports.is.string = function (value) {
    return typeof value === "string";
};

exports.is.string.nonempty = function (value) {
    return typeof value === "string" && value.length > 0;
};

exports.is.array = function (value) {
    return Array.isArray(value);
};

exports.is.array.nonempty = function (value) {
    return Array.isArray(value) && value.length > 0;
};

exports.is.object = function (value) {
    return typeof value == "object";
};

exports.is.object.nonnull = function (value) {
    return typeof value == "object" && value !== null;
};

exports.is.function = function (value) {
    return typeof value === "function";
};