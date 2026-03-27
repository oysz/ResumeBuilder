function fallbackStructuredClone(value) {
  return JSON.parse(JSON.stringify(value))
}

const structuredCloneImpl =
  typeof globalThis.structuredClone === 'function'
    ? globalThis.structuredClone.bind(globalThis)
    : fallbackStructuredClone

module.exports = {
  default: structuredCloneImpl,
}
