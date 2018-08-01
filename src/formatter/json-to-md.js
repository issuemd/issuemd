const utils = require('../utils')
const mdTemplate = require('./templates/issue-md')
const renderMustache = require('./render-mustache')

function jsonToMd(issueJSObject, options) {
  const template = options.template || mdTemplate

  return renderMustache(template, issueJSObject)
}

module.exports = jsonToMd
