const createCollection = require('./support/create-collection')

function eq(collection, index) {
  var newCollection = createCollection([])
  newCollection.push(collection[index])
  return newCollection
}

module.exports = eq
