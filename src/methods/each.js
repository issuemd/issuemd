const utils = require('../utils')
const createCollection = require('./support/create-collection')

// loops over each issue - like underscore's each
function each(collection, func) {
  utils.each(collection, function(item, i) {
    return func(createCollection([item]), i)
  })

  return collection
}

module.exports = each
