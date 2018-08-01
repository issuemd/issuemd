const utils = require('../utils')
const updates = require('./updates')

function comments(collection) {
  return utils.reduce(
    updates(collection),
    function(memo, updateInput) {
      if (updateInput.type === 'comment') {
        memo.push(updateInput)
      }
      return memo
    },
    []
  )
}

module.exports = comments
