function formatMessage(format, args) {
  if (!format) {
    return 'Invariant violation'
  }

  let index = 0
  return String(format).replace(/%s/g, () => String(args[index++]))
}

function invariant(condition, format, ...args) {
  if (condition) {
    return
  }

  const error = new Error(formatMessage(format, args))
  error.name = 'Invariant Violation'
  throw error
}

module.exports = invariant
module.exports.default = invariant
