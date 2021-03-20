const util = exports;

util.lock = (obj, ...keys) => {
    const lock = { writable: false, configurable: false };
    for (let key of keys)
        if (Reflect.getOwnPropertyDescriptor(obj, key)?.configurable ?? true)
            Object.defineProperty(obj, key, lock);
    return obj;
};
util.lock.all = (obj) => util.lock(obj, ...Object.keys(obj));
util.lock.deep = (obj, depth = Infinity) => {
    const lock = { writable: false, configurable: false };
    for (let [key, val] of Object.entries(obj)) {
        // infinite recursion savety
        if (Reflect.getOwnPropertyDescriptor(obj, key)?.configurable ?? true) {
            Object.defineProperty(obj, key, lock);
            if (depth > 0 && val instanceof Object)
                util.lock.deep(val, depth - 1);
        }
    }
    return obj;
};

util.freeze = (obj) => Object.freeze(obj);
util.freeze.deep = (obj, depth = Infinity) => {
    // infinite recursion savety
    if (Object.isFrozen(obj)) return obj;
    Object.freeze(obj);
    if (depth > 0) for (let val of Object.values(obj)) {
        if (val instanceof Object)
            util.freeze.deep(val, depth - 1);
    }
    return obj;
};

util.define = (obj, key, value, get, set) => {
    if (Reflect.getOwnPropertyDescriptor(obj, key)?.configurable ?? true)
        Object.defineProperty(obj, key, (get || set) ? { get, set } : { value });
    return obj;
};

util.lock.deep(util);