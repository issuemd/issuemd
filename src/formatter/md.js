const formatter = require('./formatter')
const utils = require('../utils')

const md = (collection, input /*, options */) => {
  const options = utils.getLastArgument(arguments, 'object') || {}

  if (utils.type(input) === 'string') {
    return collection.merge(input)
  } else if (options) {
    return formatter.md(collection.toArray(), options)
  }
}

module.exports = md
