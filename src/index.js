const
    numeric = exports,
    util = require('@pfoerdie/utility');

numeric.core = require('./core');
numeric.algebra = require('./algebra');
numeric.analysis = require('./analysis');
numeric.statistics = require('./statistics');

util.prop.lock.all(numeric);