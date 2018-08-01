const createIssue = require('./support/create-issue')

function add(collection, issueJson) {
  collection.push(createIssue(issueJson))
}

module.exports = add
