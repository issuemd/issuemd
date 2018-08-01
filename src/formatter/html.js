const formatter = require('./formatter')

const html = (collection, options) => formatter.html(collection.toArray(), options || {})

module.exports = html
