const utils = require('../../utils')
const Issue = require('./issue-constructor')

const createIssue = (issueJson) => {
  var instance = utils.extend(new Issue(), issueJson)
  return instance
}

module.exports = createIssue
