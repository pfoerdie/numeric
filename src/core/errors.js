const
    errors = exports,
    { util } = require('.');

errors.Error = Error;
errors.TypeError = TypeError;

util.lock.all(errors);