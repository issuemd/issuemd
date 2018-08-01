const helpers = require('../helpers')

function hash(collection /*, all */) {
  var all = arguments[arguments.length - 1]
  var arr = []
  var howMany = typeof all === 'boolean' && all ? collection.length : 1
  var length = typeof arguments[1] === 'number' ? arguments[1] : undefined

  for (var i = 0; i < howMany; i++) {
    arr.push(helpers.hash(helpers.composeSignature(collection.attr('creator'), collection.attr('created')), length))
  }

  return typeof all === 'boolean' && all ? arr : arr[0]
}

module.exports = hash
