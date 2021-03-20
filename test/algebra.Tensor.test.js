const
    { algebra: { Tensor } } = require('../src');

describe('numeric.algebra.Tensor', () => {

    test('should be a function', () => {
        expect(typeof Tensor).toBe('function');
    });

});