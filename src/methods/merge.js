const utils = require('../utils')
const helpers = require('../helpers')

function merge(collection, input) {
  var hashes = collection.hash(true)

  utils.each(input, function(issue) {
    var idx
    var merged = false
    var issueHash = helpers.hash(helpers.composeSignature(issue.original.creator, issue.original.created))

    if ((idx = hashes.indexOf(issueHash)) !== -1) {
      issuemdMerger(collection[idx], issue)
      merged = true
    }

    if (!merged) {
      collection.push(issue)
    }
  })

  return collection
}

module.exports = merge
