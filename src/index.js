const numeric = exports;

const { util } = numeric.core = require('./core');
numeric.algebra = require('./algebra');
numeric.analysis = require('./analysis');
numeric.statistics = require('./statistics');

util.lock.all(numeric);
// util.freeze.deep(numeric);