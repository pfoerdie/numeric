const
    { core } = require('../src');

describe('numeric.core', () => {

    describe('.assert', () => {

        test('should be a function', () => {
            expect(typeof core.assert).toBe('function');
        });

        test('should pass on truthy value', () => {
            const truthy = [true, 42, 'test', {}];
            for (let val of truthy) {
                expect(() => core.assert(val)).not.toThrow();
            }
        });

        test('should throw on falsy value', () => {
            const falsy = [false, undefined, 0, '', null];
            for (let val of falsy) {
                expect(() => core.assert(val)).toThrow();
            }
        });

    });

});