const
    { core: { assert } } = require('../src');

describe('numeric.core.assert', () => {

    test('should be a function', () => {
        expect(typeof assert).toBe('function');
    });

    test('should pass on truthy value', () => {
        const truthy = [true, 42, 'hello', {}];
        for (let val of truthy) {
            expect(() => assert(val)).not.toThrow();
        }
    });

    test('should throw on falsy value', () => {
        const falsy = [false, undefined, 0, '', null];
        for (let val of falsy) {
            expect(() => assert(val)).toThrow(Error);
        }
    });

    test('should throw errMsg with an errType', () => {
        expect(() => assert(false, 'hello')).toThrow(new Error('hello'));
        expect(() => assert(false, 'world', TypeError)).toThrow(TypeError);
        expect(() => assert(false, TypeError)).toThrow(TypeError);
    });

});