//@ts-nocheck

import Tensor from '@pfoerdie/numeric/algebra/Tensor'

describe('Tensor', () => {

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

  describe('constructing a tensor ...', () => {

    test('... should allow any length > 0 of integers > 0 as argument for the size', () => {
      expect(() => new Tensor()).toThrow();
      expect(() => new Tensor(1, 2)).not.toThrow();
      expect(() => new Tensor(4, 5, 9, 1, 3)).not.toThrow();
      expect(() => new Tensor('hello world')).toThrow();
    });

    test('... should allow an array of integers > 0 for the size', () => {
      expect(() => new Tensor([3, 2, 4])).not.toThrow();
      expect(() => new Tensor([2])).not.toThrow();
      expect(() => new Tensor([2, 0, 3])).toThrow();
      expect(() => new Tensor([2, Math.PI])).toThrow();
    });

    test('... should allow a float64 array as second argument for the data, with a length equal to the sizes multiplied', () => {
      expect(() => new Tensor(4, Float64Array.from([1, 2, 3, 4]))).not.toThrow();
      expect(() => new Tensor([2, 3, 5], new Float64Array(2 * 3 * 5))).not.toThrow();
      expect(() => new Tensor(4, new Float64Array(3))).toThrow();
    });

  });

  describe('a tensor should ...', () => {
    let a: Float64Array;
    let v: Tensor;
    let w: Tensor;

    beforeAll(() => {
      let a = Float64Array.from([1, 2, 3]);
      let v = new Tensor(a.length, a);
      let w = new Tensor(1, 2, 3, 4);
    });

    test('... have a dimension (.dimension) equal to the length of the size array', () => {
      expect(v.dimension).toBe(1);
      expect(w.dimension).toBe(4);
    });

    test('... have a float64 data array (.data) with a length of the sizes multiplied', () => {
      expect(v.data).toBeInstanceOf(Float64Array);
      expect(v.data).toHaveLength(3);
      expect(w.data).toBeInstanceOf(Float64Array);
      expect(w.data).toHaveLength(1 * 2 * 3 * 4);
    });

    test('... have the data array (.data) from the arguments, if supplied', () => {
      expect(v.data === a).toBe(true);
    });

    test('... have a size array (.size) with the size from the construction arguments', () => {
      expect(v.size).toEqual([3]);
      expect(w.size).toEqual([1, 2, 3, 4]);
    });

    test('... have an offset array (.offset) the same size as the size and with calculated numbers greater than zero', () => {
      expect(v.offset).toHaveLength(1);
      v.offset.forEach(val => expect(val).toBeGreaterThan(0));
      expect(w.offset).toHaveLength(4);
      w.offset.forEach(val => expect(val).toBeGreaterThan(0));
    });
  });

  describe('two tensors of the same size should ...', () => {
    let v: Tensor;
    let w: Tensor;

    beforeAll(() => {
      v = new Tensor(3);
      w = new Tensor([3], Float64Array.from([1, 2, 3]));
    });

    test('... not be equal', () => {
      expect(v === w).toBe(false);
    });

    test('... have equal dimension (.dimension)', () => {
      expect(v.dimension === w.dimension).toBe(true);
    });

    test('... not have equal data arrays (.data)', () => {
      expect(v.data === w.data).toBe(false);
    });

    test('... have the equal size array (.size)', () => {
      expect(v.size === w.size).toBe(true);
    });

    test('... have the equal offset array (.offset)', () => {
      expect(v.offset === w.offset).toBe(true);
    });

  });

  test('should sum multiple tensors of same size', () => {
    expect(() => Tensor.sum(
      Tensor.fromArray([1]),
      Tensor.fromArray([1])
    )).not.toThrow();
    expect(() => Tensor.sum(
      Tensor.fromArray([1])
    )).toThrow();
    expect(() => Tensor.sum(
      Tensor.fromArray([1]),
      Tensor.fromArray([2, 3])
    )).toThrow();
    expect(Tensor.sum(
      Tensor.fromArray([1, 2, 3]),
      Tensor.fromArray([2, 4, 6]),
      Tensor.fromArray([5, 2, -1])
    ).toArray()).toMatchObject([8, 8, 8]);
  });

  describe('a tensor product ...', () => {

    function randomTensor(...size: number[]) {
      const tensor = new Tensor(size);
      for (let [index] of tensor.entries()) {
        tensor.data[index] = Math.round(200 * Math.random() - 100);
      }
      return tensor;
    } // randomTensor

    function tensorDotProduct(basis: Tensor, factor: Tensor) {
      let product = 0;
      for (let index = 0, max = basis.data.length; index < max; index++) {
        product += basis.data[index] * factor.data[index];
      }
      return product;
    } // tensorDotProduct

    function tensorDataIndex(tensor: Tensor, indices: number[]) {
      let index = 0;
      for (let pos = 0; pos < indices.length; pos++) {
        index += indices[pos] * tensor.offset[pos];
      }
      return index;
    } // tensorDataIndex

    function naiveTensorProduct(basis: Tensor, factor: Tensor, degree: number = 1) {
      if (basis.dimension === degree && factor.dimension === degree)
        return tensorDotProduct(basis, factor);

      const product = new Tensor(...basis.size.slice(0, -degree), ...factor.size.slice(degree));
      for (let [b_index, b_value, ...b_indices] of basis.entries()) {
        indexLoop: for (let [f_index, f_value, ...f_indices] of factor.entries()) {
          for (let k = 1; k <= degree; k++) {
            if (b_indices[b_indices.length - k] !== f_indices[degree - k])
              continue indexLoop;
          }
          const indices = [...b_indices.slice(0, -degree), ...f_indices.slice(degree)];
          const index = tensorDataIndex(product, indices);
          product.data[index] += b_value * f_value;
        }
      }
      return product;
    } // naiveTensorProduct

    describe('... of degree 1 ...', () => {

      test('with two vectors', () => {
        expect(Tensor.scalarProduct(
          Tensor.fromArray([1, 2, 3]),
          Tensor.fromArray([2, 4, 6])
        )).toBe(1 * 2 + 2 * 4 + 3 * 6);

        const
          basis = randomTensor(6),
          factor = randomTensor(6),
          product = naiveTensorProduct(basis, factor, 1);
        expect(Tensor.scalarProduct(basis, factor)).toBe(product);
      });

      test('with two matrices', () => {
        expect(naiveTensorProduct(
          Tensor.fromArray([[1, 2, 3], [2, 4, 6]]),
          Tensor.fromArray([[2, 0], [1, 2], [0, 1]])
        ).toArray()).toMatchObject([[4, 7], [8, 14]]);
        expect(Tensor.product(
          Tensor.fromArray([[1, 2, 3], [2, 4, 6]]),
          Tensor.fromArray([[2, 0], [1, 2], [0, 1]])
        ).toArray()).toMatchObject([[4, 7], [8, 14]]);

        const
          basis = randomTensor(6, 9),
          factor = randomTensor(9, 5),
          product = naiveTensorProduct(basis, factor, 1);
        expect(Tensor.product(basis, factor, 1).toArray())
          .toMatchObject(product.toArray());
      });

      test('with vector and matrix', () => {
        expect(naiveTensorProduct(
          Tensor.fromArray([1, 2, 3]),
          Tensor.fromArray([[0, 0, 6], [0, 3, 0], [2, 0, 0]])
        ).toArray()).toMatchObject([6, 6, 6]);
        expect(Tensor.product(
          Tensor.fromArray([1, 2, 3]),
          Tensor.fromArray([[0, 0, 6], [0, 3, 0], [2, 0, 0]])
        ).toArray()).toMatchObject([6, 6, 6]);

        const
          basis = randomTensor(6),
          factor = randomTensor(6, 5),
          product = naiveTensorProduct(basis, factor, 1);
        expect(Tensor.product(basis, factor, 1).toArray())
          .toMatchObject(product.toArray());
      });

      test('with matrix and vector', () => {
        expect(naiveTensorProduct(
          Tensor.fromArray([[0, 0, 6], [0, 3, 0], [2, 0, 0]]),
          Tensor.fromArray([1, 2, 3]),
        ).toArray()).toMatchObject([18, 6, 2]);
        expect(Tensor.product(
          Tensor.fromArray([[0, 0, 6], [0, 3, 0], [2, 0, 0]]),
          Tensor.fromArray([1, 2, 3]),
        ).toArray()).toMatchObject([18, 6, 2]);

        const
          basis = randomTensor(6, 9),
          factor = randomTensor(9),
          product = naiveTensorProduct(basis, factor, 1);
        expect(Tensor.product(basis, factor, 1).toArray())
          .toMatchObject(product.toArray());
      });

    });

    describe('... of defree 2 ...', () => {

      test('with two matrices', () => {
        expect(naiveTensorProduct(
          Tensor.fromArray([[1, 2, 3], [2, 4, 6], [3, 6, 9]]),
          Tensor.fromArray([[2, 1, 0], [1, 2, 1], [0, 3, 2]]),
          2
        )).toBe(1 * 2 + 2 * 1 + 3 * 0 + 2 * 1 + 4 * 2 + 6 * 1 + 3 * 0 + 6 * 3 + 9 * 2);
        expect(Tensor.scalarProduct(
          Tensor.fromArray([[1, 2, 3], [2, 4, 6], [3, 6, 9]]),
          Tensor.fromArray([[2, 1, 0], [1, 2, 1], [0, 3, 2]])
        )).toBe(1 * 2 + 2 * 1 + 3 * 0 + 2 * 1 + 4 * 2 + 6 * 1 + 3 * 0 + 6 * 3 + 9 * 2);

        const
          basis = randomTensor(6, 9),
          factor = randomTensor(6, 9),
          product = naiveTensorProduct(basis, factor, 2);
        expect(Tensor.scalarProduct(basis, factor))
          .toBe(product);
      });

      test('with Tensor<5> and Tensor<4>', () => {
        const
          basis = randomTensor(5, 2, 4, 3, 6),
          factor = randomTensor(3, 6, 3, 5),
          product = naiveTensorProduct(basis, factor, 2);
        expect(Tensor.product(basis, factor, 2).toArray())
          .toMatchObject(product.toArray());
      });

      test('with Tensor<3> and Tensor<3>', () => {
        const
          basis = randomTensor(5, 6, 7),
          factor = randomTensor(6, 7, 5),
          product = naiveTensorProduct(basis, factor, 2);
        expect(Tensor.product(basis, factor, 2).toArray())
          .toMatchObject(product.toArray());
      });

    });

  });

});