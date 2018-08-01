const marked = require('marked')
const utils = require('../utils')
const htmlTemplate = require('./templates/issue-html')
const renderMustache = require('./render-mustache')

const json2html = (issueJSObject, options) => {
  const issues = utils.copy(issueJSObject)

  utils.each(issues, (issue) => {
    issue.original.body = issue.original.body ? marked(issue.original.body) : ''

    utils.each(issue.updates, (update) => {
      update.body = update.body ? marked(update.body) : ''
    })
  })

  const template = options.template || htmlTemplate

  return renderMustache(template, issues)
}

module.exports = json2html
