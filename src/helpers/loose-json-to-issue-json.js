const utils = require('../utils')
const now = require('./now')

// accept original main properties mixed with arbitrary meta, and return issueJson structure
// coerces all values to strings, adds default created/modified timestamps
const looseJsonToIssueJson = (original /*, updates..., sparse */) => {
  const sparse = utils.getLastArgument(arguments, 'boolean', false)

  const updates = [].slice(arguments, 1)

  if (sparse) {
    updates.pop()
  }

  const out = {
    original: {
      title: (original.title || '') + '',
      creator: (original.creator || '') + '',
      created: (original.created || now()) + '',
      meta: original.meta || [],
      body: (original.body || '') + ''
    },
    updates: updates || []
  }

  utils.each(original, (value, key) => {
    if (utils.objectKeys(out.original).indexOf(key) === -1) {
      out.original.meta.push({
        key: key,
        value: value + ''
      })
    }
  })

  utils.each(out.updates, (update) => (update.modified = update.modified || now()))

  if (sparse) {
    utils.each(out.original, (value, key) => {
      if (key !== 'meta' && utils.objectKeys(original).indexOf(key) === -1) {
        delete out.original[key]
      }
    })
  }

  return out
}

module.exports = looseJsonToIssueJson
