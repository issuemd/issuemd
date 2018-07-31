const mustache = require('mustache')
const marked = require('marked')

const summaryTemplate = require('./templates/summary-string')
const stringTemplate = require('./templates/issue-string')
const htmlTemplate = require('./templates/issue-html')
const mdTemplate = require('./templates/issue-md')

const utils = require('../utils')
const methods = require('../methods')

const issuemdFormatter = {
  render: {
    markdown: renderMarkdown,
    mustache: renderMustache
  },
  md: json2md,
  html: json2html,
  string: json2string,
  summary: json2summaryTable
}

function json2summaryTable(issueJSObject, cols, templateOverride, colorisationFunctions) {
  cols = cols || 80

  const data = []

  utils.each(methods.main(null, issueJSObject), function(issue) {
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

function getFormatterUtils(widest, cols, colorisationFunctions) {
  cols = cols || 80

  const renderEcho = (val, render) => render(val)

  const curtailed = () => (str, render) => {
    let content = render(str)
    return curtail(content + repeat(' ', cols - 4 - content.length), cols - 4)
  }

  const body = () => (str, render) => {
    let content = render(str)
    return content + repeat(' ', cols - 4 - content.length)
  }

  const padleft = () => (str, render) => {
    return repeat(render(str), widest)
  }

  const padright = () => (str, render) => {
    return repeat(render(str), cols - widest - 7)
  }

  const pad12 = () => (str, render) => {
    return (render(str) + '            ').substr(0, 12)
  }

  const key = () => (str, render) => {
    let content = render(str)
    return content + repeat(' ', widest - content.length)
  }

  const value = () => (str, render) => {
    return render(str) + repeat(' ', cols - 7 - widest - render(str).length)
  }

  const pad = () => (str, render) => {
    return repeat(render(str), cols - 4)
  }

  const pad6 = () => (str, render) => {
    return (render(str) + '      ').substr(0, 6)
  }

  const bkey = () => (colorisationFunctions && colorisationFunctions.bkey) || renderEcho
  const bsep = () => (colorisationFunctions && colorisationFunctions.bsep) || renderEcho
  const htext = () => (colorisationFunctions && colorisationFunctions.htext) || renderEcho
  const hsep = () => (colorisationFunctions && colorisationFunctions.hsep) || renderEcho
  const btext = () => (colorisationFunctions && colorisationFunctions.btext) || renderEcho

  return {
    body,
    key,
    value,
    pad,
    pad6,
    pad12,
    padleft,
    padright,
    curtailed,
    bkey,
    bsep,
    htext,
    hsep,
    btext
  }
}

function renderMarkdown(input) {
  return marked(input)
}

function renderMustache(template, data) {
  return mustache.render(template, data)
}

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

function json2md(issueJSObject, options) {
  const template = options.template || mdTemplate

  return renderMustache(template, issueJSObject)
}

function repeat(char, qty) {
  let out = ''

  for (let i = 0; i < qty; i++) {
    out += char
  }

  return out
}

function curtail(input, width) {
  return input.length > width ? input.slice(0, width - 3) + '...' : input
}

/**********************
 * collection methods *
 **********************/

// requiring formatter/utils

function toString(collection, cols, templateOverride, colorisationFunctions) {
  return issuemdFormatter.string(collection.toArray(), cols, templateOverride, colorisationFunctions)
}

// return string summary table of collection
function summary(collection, cols, templateOverride, colorisationFunctions) {
  return issuemdFormatter.summary(collection.toArray(), cols, templateOverride, colorisationFunctions)
}

function md(collection, input /*, options */) {
  const options = utils.getLastArgument(arguments, 'object') || {}

  if (utils.type(input) === 'string') {
    return collection.merge(input)
  } else if (options) {
    return issuemdFormatter.md(collection.toArray(), options)
  }
}

function html(collection, options) {
  return issuemdFormatter.html(collection.toArray(), options || {})
}

module.exports = {
  toString,
  summary,
  md,
  html
}
