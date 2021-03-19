const numeric = exports;

numeric.core = require('./core');
numeric.algebra = require('./algebra');
numeric.analysis = require('./analysis');
numeric.statistics = require('./statistics');

module.exports = Object.freeze({ ...exports });