const utils = require('../utils')

function updates(collection) {
  if (collection[0]) {
    var out = []

    utils.each(collection[0].updates, function(updateInput) {
      if (utils.type(updateInput.body) === 'string' && updateInput.body.length) {
        out.push(utils.copy(updateInput))
      }
    })

    return out
  }
}

module.exports = updates
