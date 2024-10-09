export type float = number
export function float(value: number | string): float {
  return Number(value)
}
export function isFloat(value: unknown): value is float {
  return typeof value === 'number'
}
export function assertFloat(value: unknown): asserts value is float {
  if (!isFloat(value)) throw new TypeError('expected to be a float')
}

export type float64 = float
export function float64(value: number | string): float64 {
  return Float64Array.of(float(value))[0]
}
export function isFloat64(value: unknown): value is float64 {
  return isFloat(value)
}
export function assertFloat64(value: unknown): asserts value is float64 {
  if (!isFloat64(value)) throw new TypeError('expected to be a float64')
}

export type float32 = float64
export function float32(value: number | string): float32 {
  return Float32Array.of(float(value))[0]
}
export function isFloat32(value: unknown): value is float32 {
  return isFloat(value) && (Number.isNaN(value) || Math.fround(value) === value)
}
export function assertFloat32(value: unknown): asserts value is float32 {
  if (!isFloat32(value)) throw new TypeError('expected to be a float32')
}

export type int = number
export function int(value: number | string): int {
  return Math.round(Number(value))
}
export function isInt(value: unknown): value is int {
  return typeof value === 'number' && Number.isSafeInteger(value)
}
export function assertInt(value: unknown): asserts value is int {
  if (!isInt(value)) throw new TypeError('expected to be an int')
}

export type int32 = int
export function int32(value: number | string): int32 {
  return Int32Array.of(int(value))[0]
}
export function isInt32(value: unknown): value is int32 {
  return isInt(value) && value >= -2147483648 && value <= 2147483647
}
export function assertInt32(value: unknown): asserts value is int32 {
  if (!isInt32(value)) throw new TypeError('expected to be an int32')
}

export type int16 = int32
export function int16(value: number | string): int16 {
  return Int16Array.of(int(value))[0]
}
export function isInt16(value: unknown): value is int16 {
  return isInt(value) && value >= -32768 && value <= 32767
}
export function assertInt16(value: unknown): asserts value is int16 {
  if (!isInt16(value)) throw new TypeError('expected to be an int16')
}

export type int8 = int16
export function int8(value: number | string): int8 {
  return Int8Array.of(int(value))[0]
}
export function isInt8(value: unknown): value is int8 {
  return isInt(value) && value >= -128 && value <= 127
}
export function assertInt8(value: unknown): asserts value is int8 {
  if (!isInt8(value)) throw new TypeError('expected to be an int8')
}

export type uint = int
export function uint(value: number | string): uint {
  return Math.abs(int(value))
}
export function isUint(value: unknown): value is uint {
  return isInt(value) && value >= 0
}
export function assertUint(value: unknown): asserts value is uint {
  if (!isUint(value)) throw new TypeError('expected to be a uint')
}

export type uint32 = uint
export function uint32(value: number | string): uint32 {
  return Uint32Array.of(int(value))[0]
}
export function isUint32(value: unknown): value is uint32 {
  return isUint(value) && value <= 4294967295
}
export function assertUint32(value: unknown): asserts value is uint32 {
  if (!isUint32(value)) throw new TypeError('expected to be a uint32')
}

export type uint16 = uint32
export function uint16(value: number | string): uint16 {
  return Uint16Array.of(int(value))[0]
}
export function isUint16(value: unknown): value is uint16 {
  return isUint(value) && value <= 65535
}
export function assertUint16(value: unknown): asserts value is uint16 {
  if (!isUint16(value)) throw new TypeError('expected to be a uint16')
}

export type uint8 = uint16
export function uint8(value: number | string): uint8 {
  return Uint8Array.of(int(value))[0]
}
export function isUint8(value: unknown): value is uint8 {
  return isUint(value) && value <= 255
}
export function assertUint8(value: unknown): asserts value is uint8 {
  if (!isUint8(value)) throw new TypeError('expected to be a uint8')
}