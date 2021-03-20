const
    { is } = require('.'),
    isErrType = (fn) => is.function(fn) && (fn === Error || Error.isPrototypeOf(fn));

function assert(value, ...args) {
    if (!value) {
        const
            errType = isErrType(args[args.length - 1]) ? args.pop() : Error,
            errMsg = args.shift() ?? 'undefined',
            err = new errType(errMsg, ...args);
        Error.captureStackTrace(err, assert);
        throw err;
    }
}

module.exports = assert;