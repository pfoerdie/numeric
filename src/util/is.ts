export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value)
}

export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0
}

export function isArray(value: unknown): value is any[] {
  return Array.isArray(value)
}

export function isNonEmptyArray(value: unknown): value is any[] {
  return isArray(value) && value.length > 0
}

export function isFloat64Array(value: unknown): value is Float64Array {
  return value instanceof Float64Array
}

export default {
  number: Object.assign(isNumber, {
    integer: Object.assign(isInteger, {
      positive: isPositiveInteger
    })
  }),
  array: Object.assign(isArray, {
    nonempty: isNonEmptyArray,
    typed: {
      float64: isFloat64Array
    }
  })
}