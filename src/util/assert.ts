export default function assert(valid: boolean, message: string): asserts valid is true {
  if (valid) return
  const err = new Error(message)
  Error.captureStackTrace(err, assert)
  throw err
}