const marked = require('marked')

function renderMarkdown(input) {
  return marked(input)
}

module.exports = renderMarkdown
