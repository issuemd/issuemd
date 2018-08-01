const type = require('./type')

// return last argument if it is of targetType, otherwise return null
const getLastArgument = (args, targetType, defaultValue) => {
  const last = args[args.length - 1]
  return type(last) === targetType ? last : defaultValue || null
}

module.exports = getLastArgument
