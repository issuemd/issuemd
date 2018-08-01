const utils = require('../utils')
const helpers = require('../helpers')

function attr(collection, attrs) {
  if (!attrs) {
    return helpers.issueJsonToLoose(collection.toArray()[0])
  } else if (utils.type(attrs) === 'string') {
    return collection.attr()[attrs]
  } else {
    utils.each(collection, function(issue) {
      var issueJsonIn = helpers.looseJsonToIssueJson(attrs, true)
      issueJsonIn.original.meta = issue.original.meta.concat(issueJsonIn.original.meta)
      issueJsonIn.updates = issue.updates.concat(issueJsonIn.updates)
      issue.original = utils.extend(issue.original, issueJsonIn.original)
    })

    return collection
  }
}

module.exports = attr
