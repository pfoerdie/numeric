const
    constants = exports,
    { util } = require('.');

constants.$$iterator = Symbol.iterator;
constants.$$species = Symbol.species;
constants.$$instance = Symbol.hasInstance;

constants.PI = Math.PI;
constants.EPSILON = Number.EPSILON;

util.lock.all(constants);