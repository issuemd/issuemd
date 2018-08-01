const utils = require('../utils')

// remove the issues specified by `input` (accepts array, or one or more argument specified indices to be deleted)
function remove(collection, input) {
  // set indices to input if it is an array, or arguments array (by converting from arguments array like object)
  input = utils.type(input) === 'array' ? input : [].slice.call(arguments, 1)

  // sort and reverse input so that elements are removed from back, and don't change position of next one to remove
  input.sort().reverse()

  utils.each(input, function(index) {
    collection.splice(index, 1)
  })

  return collection
}

module.exports = remove
