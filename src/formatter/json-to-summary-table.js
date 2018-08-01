const utils = require('../utils')
const methods = require('../methods')
const renderMustache = require('./render-mustache')
const summaryTemplate = require('./templates/summary-string')
const getFormatterUtils = require('./get-formatter-utils')

const jsonToSummaryTable = (issueJSObject, cols, templateOverride, colorisationFunctions) => {
  cols = cols || 80

  const data = []

  utils.each(methods.main(null, issueJSObject), (issue) => {
    const attr = methods.attr(methods.main(null, issue))

    data.push({
      title: attr.title,
      creator: attr.creator,
      id: attr.id,
      assignee: attr.assignee,
      status: attr.status
    })
  })

  // TODO: if webpack build, drop the filename concat used by browserify (don't forget other instances in this file)
  const template = templateOverride || summaryTemplate

  return renderMustache(template, {
    util: getFormatterUtils(0, cols, colorisationFunctions),
    data: data
  })
}

module.exports = jsonToSummaryTable
