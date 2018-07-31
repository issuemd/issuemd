const md5 = require('blueimp-md5')

// return firstbits hash of input, optionally specify `size` which defaults to 32
const hash = (string, size) => {
  return md5(string).slice(0, size || 32)
}

module.exports = hash
