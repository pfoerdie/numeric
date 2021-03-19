const
    types = exports,
    _ = require('../util'),
    numeric = require('..');

types.number = (value) => parseFloat(value);
types.string = (value) => '' + value;
types.function = (value) => typeof value === 'function' ? value : () => value;
types.array = (value) => Array.isArray(value) || ArrayBuffer.isView(value) ? value
    : value?.[Symbol.iterator] ? Array.from(value)
        : (value ?? null) === null ? [] : [value];

types.int = (value) => parseInt(value);
types.int8 = (value) => types.int(value) % 128;
types.int16 = (value) => types.int(value) % 32768;
types.int32 = (value) => types.int(value) % 2147483648;
types.int64 = (value) => typeof value === 'bigint' ? value : BigInt(value);

types.int_arr = (value) => (value instanceof Int8Array) || (value instanceof Int16Array) || (value instanceof Int32Array)
    ? value : Int32Array.from(types.array(value));
types.int8arr = (value) => value instanceof Int8Array ? value : Int8Array.from(types.array(value));
types.int16arr = (value) => value instanceof Int16Array ? value : Int16Array.from(types.array(value));
types.int32arr = (value) => value instanceof Int32Array ? value : Int32Array.from(types.array(value));
types.int64arr = (value) => value instanceof BigInt64Array ? value : BigInt64Array.from(types.array(value));

types.uint = (value) => Math.abs(types.int(value));
types.uint8 = (value) => types.uint(value) % 256;
types.uint16 = (value) => types.uint(value) % 65536;
types.uint32 = (value) => types.uint(value) % 4294967296;

types.uint_arr = (value) => (value instanceof Uint8Array) || (value instanceof Uint16Array) || (value instanceof Uint32Array)
    ? value : Uint32Array.from(types.array(value));
types.uint8arr = (value) => value instanceof Uint8Array ? value : Uint8Array.from(types.array(value));
types.uint16arr = (value) => value instanceof Uint16Array ? value : Uint16Array.from(types.array(value));
types.uint32arr = (value) => value instanceof Uint32Array ? value : Uint32Array.from(types.array(value));
types.uint64arr = (value) => value instanceof BigUint64Array ? value : BigUint64Array.from(types.array(value));

types.float = (value) => parseFloat(value);
types.float32 = (value) => Math.max(1.2e-38, Math.min(3.4e38, types.float(value)));
types.float64 = (value) => Math.max(5.0e-324, Math.min(1.8e308, types.float(value)));

types.float_arr = (value) => (value instanceof Float32Array) || (value instanceof Float64Array)
    ? value : Float64Array.from(types.array(value));
types.float32arr = (value) => value instanceof Float32Array ? value : Float32Array.from(types.array(value));
types.float64arr = (value) => value instanceof Float64Array ? value : Float64Array.from(types.array(value));

for (let type of Object.values(types)) {
    Object.defineProperty(type, Symbol.hasInstance, {
        value: (value) => value === type(value)
    });
}

module.exports = Object.freeze({ ...exports });