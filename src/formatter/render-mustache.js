const mustache = require('mustache')

function renderMustache(template, data) {
  return mustache.render(template, data)
}

module.exports = renderMustache
