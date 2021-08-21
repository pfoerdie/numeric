const
    errors = exports,
    util = require('@pfoerdie/utility');

errors.Error = Error;
errors.TypeError = TypeError;

util.prop.lock.all(errors);