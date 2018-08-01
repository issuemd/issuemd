const utils = require('../utils')
const renderMustache = require('./render-mustache')
const methods = require('../methods')
const getFormatterUtils = require('./get-formatter-utils')
const stringTemplate = require('./templates/issue-string')

function json2string(issueJSObject, cols, templateOverride, colorisationFunctions) {
  cols = cols || 80

  const splitLines = (input) => {
    const output = []

    const lines = utils
      .wordwrap(input, cols - 4)
      .replace(/\n\n+/, '\n\n')
      .split('\n')

    utils.each(lines, function(item) {
      if (item.length < cols - 4) {
        output.push(item)
      } else {
        output = output.concat(item.match(new RegExp('.{1,' + (cols - 4) + '}', 'g')))
      }
    })

    return output
  }

  const template = templateOverride || stringTemplate

  if (issueJSObject) {
    const out = []
    const issues = methods.main(null, issueJSObject)

    utils.each(issues, function(issueJson) {
      const issue = methods.main(null, issueJson)
      const data = {
        meta: [],
        comments: []
      }

      let widest = 'signature'.length

      utils.each(issue.attr(), function(value, key) {
        if (key === 'title' || key === 'body') {
          data[key] = splitLines(value)
        } else if (key === 'created' || key === 'creator') {
          data[key] = value

          if (key.length > widest) {
            widest = key.length
          }
        } else {
          data.meta.push({
            key: key,
            value: value
          })

          if (key.length > widest) {
            widest = key.length
          }
        }
      })

      utils.each(issue.updates(), function(value) {
        value.body = splitLines(value.body)
        data.comments.push(value)
      })

      out.push(
        renderMustache(template, {
          util: getFormatterUtils(widest, cols, colorisationFunctions),
          data: data
        })
      )
    })

    return out.join('\n')
  }
}

module.exports = json2string