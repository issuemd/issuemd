const renderMustache = require('./render-mustache')
const renderMarkdown = require('./render-markdown')
const jsonToSummaryTable = require('./json-to-summary-table')
const jsonTohtml = require('./json-to-html')
const jsonToMd = require('./json-to-md')
const jsonToString = require('./json-to-string')

module.exports = {
  render: {
    markdown: renderMarkdown,
    mustache: renderMustache
  },
  md: jsonToMd,
  html: jsonTohtml,
  string: jsonToString,
  summary: jsonToSummaryTable
}
