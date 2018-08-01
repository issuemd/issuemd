const utils = require('../utils')
const createCollection = require('./support/create-collection')

// return a deep copy of a collection - breaking references
function clone(collection) {
  return createCollection(utils.copy(collection.toArray()))
}

module.exports = clone
