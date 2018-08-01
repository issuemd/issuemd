const issuemd = require('../core')
const utils = require('../utils')
const issuemdParser = require('../parser')
const createIssue = require('./support/create-issue')
const createCollection = require('./support/create-collection')
const helpers = require('../helpers')
const errors = require('../error-messages')

function main(collection, arr) {
  // if collection passed in, just return it without further ado
  if (arr instanceof issuemd.fn.constructor) {
    return arr
  }

  // we don't care if you supply array of arguments, or multiple arguments
  // just coerce into array...
  if (utils.type(arr) !== 'array') {
    arr = [].slice.call(arguments, 1)
  }

  arr.forEach(function(item) {
    if (utils.type(item) === 'null' || utils.type(item) === 'undefined') {
      throw Error(errors.ERROR_MAIN_INVALID_INPUT)
    }
  })

  var issues = []

  for (var i = 0, len = (arr || []).length; i < len; i++) {
    if (utils.type(arr[i]) === 'string') {
      var parsed = issuemdParser.parse(arr[i])
      utils.each(parsed, parsedHandler)
    } else if (arr[i].original) {
      issues.push(createIssue(arr[i]))
    } else {
      issues.push(createIssue(helpers.looseJsonToIssueJson(arr[i])))
    }
  }

  return createCollection(issues)

  function parsedHandler(issue) {
    issues.push(createIssue(issue))
  }
}

module.exports = main
