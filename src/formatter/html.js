const formatter = require('./formatter')

function html(collection, options) {
  return formatter.html(collection.toArray(), options || {})
}

module.exports = html
