const
    types = exports,
    { util, is, constants: { $$instance } } = require('.');

types.number = (val) => parseFloat(val);
util.define(types.number, $$instance, is.number);
types.string = (val) => '' + val;
util.define(types.string, $$instance, is.string);
types.function = (val) => is.function(val) ? val : () => types.number(val);
util.define(types.function, $$instance, is.function);
types.array = (val) => is.array(val) ? val
    : val?.[Symbol.iterator] ? Array.from(val)
        : (val ?? null) === null ? [] : [val];
util.define(types.array, $$instance, is.array);

types.int = (val) => parseInt(val);
util.define(types.int, $$instance, is.number.integer);
types.int8 = (val) => types.int(val) % 128;
types.int16 = (val) => types.int(val) % 32768;
types.int32 = (val) => types.int(val) % 2147483648;
types.int64 = (val) => BigInt(val);
util.define(types.int64, $$instance, is.number.bigint);

types.uint = (val) => Math.abs(types.int(val));
util.define(types.uint, $$instance, (val) => is.number.integer(val) && val >= 0);
types.uint8 = (val) => types.uint(val) % 256;
types.uint16 = (val) => types.uint(val) % 65536;
types.uint32 = (val) => types.uint(val) % 4294967296;

types.float = (val) => parseFloat(val);
util.define(types.float, $$instance, is.number);
types.float32 = (val) => Math.max(1.2e-38, Math.min(3.4e38, types.float(val)));
types.float64 = (val) => Math.max(5.0e-324, Math.min(1.8e308, types.float(val)));

types.int_arr = (val) => val instanceof types.int_arr ? val : Int32Array.from(types.array(val));
util.define(types.int_arr, $$instance, (val) => (val instanceof Int32Array) || (val instanceof Int16Array) || (val instanceof Int8Array));
types.int8arr = (val) => val instanceof types.int8arr ? val : Int8Array.from(types.array(val));
util.define(types.int8arr, $$instance, (val) => val instanceof Int8Array);
types.int16arr = (val) => val instanceof types.int16arr ? val : Int16Array.from(types.array(val));
util.define(types.int16arr, $$instance, (val) => val instanceof Int16Array);
types.int32arr = (val) => val instanceof types.int32arr ? val : Int32Array.from(types.array(val));
util.define(types.int32arr, $$instance, (val) => val instanceof Int32Array);
types.int64arr = (val) => val instanceof types.int64arr ? val : BigInt64Array.from(types.array(val));
util.define(types.int64arr, $$instance, (val) => val instanceof BigInt64Array);

types.uint_arr = (val) => val instanceof types.uint_arr ? val : Uint32Array.from(types.array(val));
util.define(types.uint_arr, $$instance, (val) => (val instanceof Uint32Array) || (val instanceof Uint16Array) || (val instanceof Uint8Array));
types.uint8arr = (val) => val instanceof types.uint8arr ? val : Uint8Array.from(types.array(val));
util.define(types.uint8arr, $$instance, (val) => val instanceof Uint8Array);
types.uint16arr = (val) => val instanceof types.uint16arr ? val : Uint16Array.from(types.array(val));
util.define(types.uint16arr, $$instance, (val) => val instanceof Uint16Array);
types.uint32arr = (val) => val instanceof types.uint32arr ? val : Uint32Array.from(types.array(val));
util.define(types.uint32arr, $$instance, (val) => val instanceof Uint32Array);
types.uint64arr = (val) => val instanceof types.uint64arr ? val : BigUint64Array.from(types.array(val));
util.define(types.uint64arr, $$instance, (val) => val instanceof BigUint64Array);

types.float_arr = (val) => val instanceof types.float_arr ? val : Float64Array.from(types.array(val));
util.define(types.float_arr, $$instance, (val) => (val instanceof Float64Array) || (val instanceof Float32Array));
types.float32arr = (val) => val instanceof types.float32arr ? val : Float32Array.from(types.array(val));
util.define(types.float32arr, $$instance, (val) => val instanceof Float32Array);
types.float64arr = (val) => val instanceof types.float64arr ? val : Float64Array.from(types.array(val));
util.define(types.float64arr, $$instance, (val) => val instanceof Float64Array);

for (let type of Object.values(types)) {
    if (!type.hasOwnProperty($$instance))
        util.define(type, $$instance, (val) => val === type(val));
}

util.lock.all(types);