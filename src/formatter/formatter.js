const jsonTohtml = require('./json-to-html')
const jsonToMd = require('./json-to-md')
const jsonToString = require('./json-to-string')
const jsonToSummaryTable = require('./json-to-summary-table')
const renderMarkdown = require('./render-markdown')
const renderMustache = require('./render-mustache')

module.exports = {
  html: jsonTohtml,
  md: jsonToMd,
  render: {
    markdown: renderMarkdown,
    mustache: renderMustache
  },
  string: jsonToString,
  summary: jsonToSummaryTable
}
