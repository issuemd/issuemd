const formatter = require('./formatter')

function toString(collection, cols, templateOverride, colorisationFunctions) {
  return formatter.string(collection.toArray(), cols, templateOverride, colorisationFunctions)
}

module.exports = toString
