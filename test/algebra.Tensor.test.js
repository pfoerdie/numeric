const
    { algebra: { Tensor } } = require('../src');

describe('numeric.algebra.Tensor', () => {

    test('should be a function', () => {
        expect(typeof Tensor).toBe('function');
    });

    test('should serialize and deserialize to/from an array representation', () => {
        const arr = [[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]]];
        expect(Tensor.fromArray(arr).toArray()).toEqual(arr);
    });

    test('should serialize and deserialize to/from a json representation', () => {
        const json = {
            type: 'Tensor',
            size: [3, 2, 2],
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        };
        expect(Tensor.fromJSON(json).toJSON()).toEqual(json);
        expect(JSON.parse(JSON.stringify(Tensor.fromJSON(json)))).toEqual(json);
    });

});