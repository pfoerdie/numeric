const core = exports;

core.util = require('./util');
core.constants = require('./constants');
core.errors = require('./errors');
core.is = require('./is');
core.types = require('./types');
core.assert = require('./assert');

core.util.lock.all(core);