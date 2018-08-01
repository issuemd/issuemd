const marked = require('marked')
const utils = require('../utils')
const htmlTemplate = require('./templates/issue-html')
const renderMustache = require('./render-mustache')

function json2html(issueJSObject, options) {
  const issues = utils.copy(issueJSObject)

  utils.each(issues, function(issue) {
    issue.original.body = issue.original.body ? marked(issue.original.body) : ''

    utils.each(issue.updates, function(update) {
      update.body = update.body ? marked(update.body) : ''
    })
  })

  const template = options.template || htmlTemplate

  return renderMustache(template, issues)
}

module.exports = json2html
