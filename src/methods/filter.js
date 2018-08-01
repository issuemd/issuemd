const utils = require('../utils')
const createCollection = require('./support/create-collection')

function filter(collection, first, second) {
  return second ? filterByAttr(collection, first, second) : filterByFunction(collection, first)

  function filterByFunction(collection, filterFunction) {
    var out = createCollection([])

    collection.each(function(item, index) {
      if (filterFunction(item, index)) {
        out.merge(item)
      }
    })

    return out
  }

  function filterByAttr(collection, key, valueIn) {
    var values = utils.type(valueIn) === 'array' ? valueIn : [valueIn]

    return filterByFunction(collection, function(issue) {
      var attrValue = issue.attr(key)
      var match = false

      utils.each(values, function(value) {
        if ((!match && (utils.type(value) === 'regexp' && value.test(attrValue))) || attrValue === value) {
          match = true
          return match
        }
      })

      return match
    })
  }
}

module.exports = filter
