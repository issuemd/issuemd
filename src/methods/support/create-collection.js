const issuemd = require('../../core')

const createCollection = (issues) => {
  var instance = new issuemd.fn.constructor()

  for (var i = 0, len = issues.length; i < len; i++) {
    instance.push(issues[i])
  }

  return instance
}

module.exports = createCollection
