const formatter = require('./formatter')

function summary(collection, cols, templateOverride, colorisationFunctions) {
  return formatter.summary(collection.toArray(), cols, templateOverride, colorisationFunctions)
}

module.exports = summary
