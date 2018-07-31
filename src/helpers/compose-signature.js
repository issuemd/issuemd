const utils = require('../utils')

// helper function ensures consistant signature creation
const composeSignature = (creator, created) => {
  return utils.trim(creator) + ' @ ' + utils.trim(created)
}

module.exports = composeSignature
