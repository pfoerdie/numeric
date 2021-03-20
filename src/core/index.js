const core = exports;

core.util = require('./util');
core.constants = require('./constants');
core.errors = require('./errors');
core.assert = require('./assert');
core.is = require('./is');
core.types = require('./types');

core.util.lock.all(core);