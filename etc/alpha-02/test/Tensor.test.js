const { Tensor } = Numeric = require("../src/index.js.js");
/** {@link https://jestjs.io/docs/en/expect Expect - Jest} */

describe("constructing a tensor ...", () => {

    test("... should allow any length > 0 of integers > 0 as argument for the size", () => {
        expect(() => new Tensor()).toThrow();
        expect(() => new Tensor(1, 2)).not.toThrow();
        expect(() => new Tensor(4, 5, 9, 1, 3)).not.toThrow();
        expect(() => new Tensor("hello world")).toThrow();
    });

    test("... should allow an array of integers > 0 for the size", () => {
        expect(() => new Tensor([3, 2, 4])).not.toThrow();
        expect(() => new Tensor([2])).not.toThrow();
        expect(() => new Tensor([2, 0, 3])).toThrow();
        expect(() => new Tensor([2, Math.PI])).toThrow();
    });

    test("... should allow a float64 array as second argument for the data, with a length equal to the sizes multiplied", () => {
        expect(() => new Tensor(4, Float64Array.from([1, 2, 3, 4]))).not.toThrow();
        expect(() => new Tensor([2, 3, 5], new Float64Array(2 * 3 * 5))).not.toThrow();
        expect(() => new Tensor(4, new Float64Array(3))).toThrow();
    });

});

describe("a tensor should ...", () => {
    let a = Float64Array.from([1, 2, 3]);
    let v = new Tensor(a.length, a);
    let w = new Tensor(1, 2, 3, 4);

    test("... have a dimension (.dim) equal to the length of the size array", () => {
        expect(v.dim).toBe(1);
        expect(w.dim).toBe(4);
    });

    test("... have a float64 data array (.data) with a length of the sizes multiplied", () => {
        expect(v.data).toBeInstanceOf(Float64Array);
        expect(v.data).toHaveLength(3);
        expect(w.data).toBeInstanceOf(Float64Array);
        expect(w.data).toHaveLength(1 * 2 * 3 * 4);
    });

    test("... have the data array (.data) from the arguments, if supplied", () => {
        expect(v.data === a).toBe(true);
    });

    test("... have a size array (.size) with the size from the construction arguments", () => {
        expect(v.size).toEqual([3]);
        expect(w.size).toEqual([1, 2, 3, 4]);
    });

    test("... have an offset array (.offset) the same size as the size and with calculated numbers greater than zero", () => {
        expect(v.offset).toHaveLength(1);
        v.offset.forEach(val => expect(val).toBeGreaterThan(0));
        expect(w.offset).toHaveLength(4);
        w.offset.forEach(val => expect(val).toBeGreaterThan(0));
    });
});

describe("two tensors of the same size should ...", () => {
    let v = new Tensor(3);
    let w = new Tensor([3], Float64Array.from([1, 2, 3]));

    test("... not be equal", () => {
        expect(v === w).toBe(false);
    });

    test("... have equal dimension (.dim)", () => {
        expect(v.dim === w.dim).toBe(true);
    });

    test("... not have equal data arrays (.data)", () => {
        expect(v.data === w.data).toBe(false);
    });

    test("... have the equal size array (.size)", () => {
        expect(v.size === w.size).toBe(true);
    });

    test("... have the equal offset array (.offset)", () => {
        expect(v.offset === w.offset).toBe(true);
    });

});

test.todo("correct (de-)serialization with toJSON(/fromJSON)");