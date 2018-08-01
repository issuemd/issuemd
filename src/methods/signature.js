const helpers = require('../helpers')

// return signature of first issue in collection
function signature(collection) {
  var creator = collection.attr('creator')
  var created = collection.attr('created')
  return creator && created ? helpers.composeSignature(creator, created) : null
}

module.exports = signature
