const utils = require('./utils.js')

// helper function ensures consistant signature creation
const composeSignature = (creator, created) => {
  return utils.trim(creator) + ' @ ' + utils.trim(created)
}

const issueJsonToLoose = (issue) => {
  let out = (utils.copy(issue) || {}).original || {}

  utils.each(out.meta, (meta) => (out[meta.key] = meta.value))

  delete out.meta

  return out
}

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

const now = () => dateString(new Date())

const dateString = (inputDate) => inputDate.toISOString().replace(/Z$/, '+0000')

// return firstbits hash of input, optionally specify `size` which defaults to 32
const hash = (string, size) => {
  const md5 = require('blueimp-md5')
  return md5(string).slice(0, size || 32)
}

module.exports = {
  composeSignature: composeSignature,
  issueJsonToLoose: issueJsonToLoose,
  looseJsonToIssueJson: looseJsonToIssueJson,
  now: now,
  dateString: dateString,
  hash: hash
}
