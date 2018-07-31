const utils = require('../utils')

const issueJsonToLoose = (issue) => {
  let out = (utils.copy(issue) || {}).original || {}

  utils.each(out.meta, (meta) => (out[meta.key] = meta.value))

  delete out.meta

  return out
}

module.exports = issueJsonToLoose
