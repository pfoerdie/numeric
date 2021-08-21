const
    constants = exports,
    util = require('@pfoerdie/utility');

constants.$$iterator = Symbol.iterator;
constants.$$species = Symbol.species;
constants.$$instance = Symbol.hasInstance;

constants.PI = Math.PI;
constants.EPSILON = Number.EPSILON;

util.prop.lock.all(constants);