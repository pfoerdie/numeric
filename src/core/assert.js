function assert(value, errMsg = 'undefined', errType = Error) {
    if (!value) {
        const err = new errType(errMsg);
        Error.captureStackTrace(err, assert);
        throw err;
    }
}

module.exports = assert;