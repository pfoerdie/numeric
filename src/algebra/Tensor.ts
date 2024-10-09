import { type int, isInt, type uint, isUint, type float64, isFloat64 } from '@pfoerdie/numeric/core/numbers'

function assertSize(size: unknown): asserts size is number[] {
  if (!Array.isArray(size)) throw new Error('The size of a tensor must be an array.')
  if (size.length === 0) throw new Error('The size of a tensor must include entries.')
  for (let i = 0, l = size.length; i < l; i++) {
    if (!isInt(size[i])) throw new Error('The size of a tensor must consist of integers.')
    if (size[i] < 1) throw new Error('The size of a tensor must not contain numbers less than 1.')
    if (size[i] > Number.MAX_SAFE_INTEGER) throw new Error('The size of a tensor must not contain numbers greater than ' + Number.MAX_SAFE_INTEGER + '.')
  }
}

function calculateOffset(size: number[] | readonly number[]): number[] {
  const offset = new Array(size.length)
  for (let i = 0, l = size.length; i < l; i++) {
    let factor = 1
    for (let j = i + 1; j < l; j++) {
      factor *= size[j]
    }
    offset[i] = factor
  }
  return offset
}

const numberListCache: Record<string, readonly number[]> = Object.create(null)

function cacheNumberList(values: number[] | readonly number[]): readonly number[] {
  const key = values.join(' ')
  return numberListCache[key] ??= Object.freeze([...values])
}

export default class Tensor {

  readonly data: Float64Array
  readonly length: number
  readonly dimension: number
  readonly size: readonly number[]
  readonly offset: readonly number[]

  constructor(...size: number[])
  constructor(data: Float64Array)
  // TODO constructor(size: number, data?: Float64Array)
  constructor(size: number[] | readonly number[], data?: Float64Array)

  constructor(...args: any[]) {
    if (typeof args[0] === 'number') {
      assertSize(args)
      this.size = cacheNumberList(args)
      this.offset = cacheNumberList(calculateOffset(this.size))
      this.dimension = this.size.length
      this.length = this.size.reduce((acc, val) => acc * val, 1)
      this.data = new Float64Array(this.length)
    } else if (args[0] instanceof Float64Array) {
      this.data = args[0]
      this.length = this.data.length
      this.size = cacheNumberList([this.length])
      this.offset = cacheNumberList(calculateOffset(this.size))
      this.dimension = this.size.length
    } else {
      assertSize(args[0])
      this.length = args[0].reduce((acc, val) => acc * val, 1)
      if (args[1] instanceof Float64Array) {
        if (args[1].length !== this.length) throw new Error('The length of the data must be the product of the tensor size.')
        this.data = args[1]
      } else {
        this.data = new Float64Array(this.length)
      }
      this.size = cacheNumberList(args[0])
      this.offset = cacheNumberList(calculateOffset(this.size))
      this.dimension = this.size.length
    }

    Object.defineProperties(this, {
      data: { writable: false, configurable: false },
      length: { writable: false, configurable: false },
      dimension: { writable: false, configurable: false },
      size: { writable: false, configurable: false },
      offset: { writable: false, configurable: false }
    })
  }

  static sum(...summands: Tensor[]): Tensor {
    if (summands.length < 2) throw new Error('The tensor sum needs at least 2 summands.')
    if (!summands.every(summand => summand instanceof Tensor)) throw new Error('The tensor sum can only be solved with tensors.')
    if (!summands.every(summand => summand.size === summands[0].size)) throw new Error('The tensor sum can only be solved with equally sized tensors.')

    const sum = new Tensor(summands[0].size)
    const length = summands[0].data.length

    for (let summand of summands) {
      for (let key = 0; key < length; key++) {
        sum.data[key] += summand.data[key]
      }
    }

    return sum
  }

  static product(basis: Tensor, factor: Tensor, degree: int = 1): Tensor {
    if (!(basis instanceof Tensor && factor instanceof Tensor)) throw new Error('The tensor product can only be solved with tensors.')
    if (!(isInt(degree) && degree > 0)) throw new Error('The degree of the product must be an integer > 0.')
    if (!(degree <= basis.dimension && degree <= factor.dimension)) throw new Error('The degree of the product must be equal or less than the tensors minimal dimension.')
    if (!(degree < basis.dimension || degree < factor.dimension)) throw new Error('For a degree of the product equal to both the basis dimension and factor dimension use the scalar product instead.')
    if (!basis.size.slice(-degree).every((val, i) => factor.size[i] === val)) throw new Error('The last portion of the basis size must overlap the first portion of the factor size by a length equal to the degree.')

    const product = new Tensor([...basis.size.slice(0, -degree), ...factor.size.slice(degree)])
    const indices = (new Array(basis.dimension + factor.dimension - degree)).fill(0)
    const size = [...basis.size, ...factor.size.slice(degree)]
    const max = indices.length - 1
    const b_max = basis.dimension - 1
    const f_min = basis.dimension - degree
    const p_offset = factor.offset[degree - 1] - 1

    let pos = max
    let p_key = 0
    let b_key = 0
    let f_key = 0

    main_loop: while (true) {
      product.data[p_key] += basis.data[b_key] * factor.data[f_key]

      while (indices[pos] === size[pos] - 1) {
        if (pos > 0) pos--
        else break main_loop
      }

      if (pos > b_max) {
        p_key++
        f_key++
      } else if (pos < f_min) {
        p_key++
        b_key++
        f_key = 0
      } else {
        p_key -= p_offset
        b_key++
        f_key++
      }

      indices[pos]++
      while (pos < max) {
        pos++
        indices[pos] = 0
      }
    }

    return product
  }

  static scalarProduct(...factors: Tensor[]): number {
    if (factors.length < 2) throw new Error('The tensor scalar product needs at least 2 factors.')
    if (!factors.every(factor => factor instanceof Tensor)) throw new Error('The tensor scalar product can only be solved with tensors.')
    if (!factors.every(factor => factor.size === factors[0].size)) throw new Error('The tensor scalar product can only be solved with equally sized tensors.')

    const length = factors[0].data.length
    let sum = 0

    for (let key = 0; key < length; key++) {
      let product = factors[0].data[key]
      for (let k = 1; k < factors.length; k++) {
        product *= factors[k].data[key]
      }
      sum += product
    }

    return sum
  }

  static entrywiseProduct(...factors: Tensor[]): Tensor {
    if (factors.length < 2) throw new Error('The tensor entrywise product needs at least 2 factors.')
    if (!factors.every(factor => factor instanceof Tensor)) throw new Error('The tensor entrywise product can only be solved with tensors.')
    if (!factors.every(factor => factor.size === factors[0].size)) throw new Error('The tensor entrywise product can only be solved with equally sized tensors.')

    const product = new Tensor(factors[0].size)
    const first = factors.shift() as Tensor
    const length = first.data.length

    for (let key = 0; key < length; key++) {
      product.data[key] = first.data[key]
    }
    for (let factor of factors) {
      for (let key = 0; key < length; key++) {
        product.data[key] *= factor.data[key]
      }
    }

    return product
  }

  scale(factor: float64): this {
    if (!isFloat64(factor)) throw new Error('Scaling a tensor requires a number.')

    for (let key = 0, length = this.data.length; key < length; key++) {
      this.data[key] *= factor
    }
    return this
  }

  // IDEA Tensor#add
  // TODO other inplace methods

  /**
   * The first value of an entry is the key in the data,
   * the second value is the value of the data at that location
   * and all following values are the indices of the tensor.
   * @returns [key, value, ...indices]
   */
  * entries(): Generator<[number, number, ...number[]]> {
    const indices = (new Array(this.dimension)).fill(0)
    const max = indices.length - 1
    for (let key = 0, pos = max; key < this.data.length; key++) {
      yield [key, this.data[key], ...indices]
      while (indices[pos] === this.size[pos] - 1) {
        pos--
      }
      indices[pos]++
      while (pos < max) {
        pos++
        indices[pos] = 0
      }
    }
  }

  keyAt(indices: uint[]): uint
  keyAt(...indices: uint[]): uint

  keyAt(...indices: uint[] | [uint[]]): uint {
    indices = Array.isArray(indices[0]) ? indices[0] : indices as uint[]

    if (indices.length !== this.dimension) throw new Error('The indices must have a length equal to the dimension of the tensor.')
    if (!indices.every((val, i) => isUint(val) && val < this.size[i])) throw new Error('The indices must be nonnegative integers less than the size of the tensor.')

    let key = 0
    for (let pos = 0; pos < indices.length; pos++) {
      key += indices[pos] * this.offset[pos]
    }
    return key
  }

  dataAt(indices: uint[]): float64
  dataAt(...indices: uint[]): float64

  dataAt(...indices: uint[] | [uint[]]): float64 {
    indices = Array.isArray(indices[0]) ? indices[0] : indices as uint[]

    const key = this.keyAt(...indices)
    return this.data[key]
  }

  indicesFor(key: uint): uint[] {
    if (!(isUint(key) && key < this.data.length)) throw new Error('The key must be a nonnegative integer less than the length of the tensor data.')

    const indices = (new Array(this.dimension)).fill(0)
    for (let pos = 0; pos < indices.length; pos++) {
      indices[pos] = key % this.offset[pos]
      key -= indices[pos]
    }
    return indices
  }

  toArray(): any[] {
    const dataArr = new Array(this.size[0])
    for (let [key, value, ...indices] of this.entries()) {
      let target = dataArr
      let max = indices.length - 1
      for (let pos = 0; pos < max; pos++) {
        let index = indices[pos]
        if (!target[index])
          target[index] = new Array(this.size[pos + 1])
        target = target[index]
      }
      target[indices[max]] = value
    }
    return dataArr
  }


  static fromArray(dataArr: any[]): Tensor {
    if (!Array.isArray(dataArr)) throw new Error('The dataArr must be an array.')

    let size = []
    let temp = dataArr
    while (Array.isArray(temp)) {
      size.push(temp.length)
      temp = temp[0]
    }
    const result = new Tensor(size)
    for (let [key, value, ...indices] of result.entries()) {
      let target = dataArr, max = indices.length - 1
      for (let pos = 0; pos < max; pos++) {
        let index = indices[pos]
        if (!(Array.isArray(target[index]) && target[index].length === size[pos + 1])) throw new Error('Expected an array of length ' + size[pos + 1] + ' at position ' + indices.slice(0, pos - max).reduce((acc, val) => acc + '[' + val + ']', '') + '.')
        if (!target[index]) target[index] = new Array(result.size[pos + 1])
        target = target[index]
      }
      if (!isFloat64(target[indices[max]])) throw new Error('Expected a number at position ' + indices.reduce((acc, val) => acc + '[' + val + ']', '') + '.')
      result.data[key] = target[indices[max]]
    }
    return result
  }

  toJSON(): { type: 'Tensor', size: int[], data: float64[] } {
    return {
      type: 'Tensor',
      size: Array.from(this.size),
      data: Array.from(this.data)
    }
  }

  static fromJSON(json: string | { type: 'Tensor', size: int[], data: float64[] }): Tensor {
    json = typeof json === 'string' ? JSON.parse(json) : json

    if (!(typeof json === 'object' && json !== null && json.type === 'Tensor')) throw new Error('The json must be a serialized Tensor.')

    const size = Array.from(json.size), data = Float64Array.from(json.data)
    return new Tensor(size, data)
  }

}