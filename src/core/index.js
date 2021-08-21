const
    core = exports,
    util = require('@pfoerdie/utility');

core.constants = require('./constants');
core.errors = require('./errors');
core.is = require('./is');
core.types = require('./types');

util.prop.lock.all(core);