const extend = (original, options) => {
  for (const prop in options) {
    if (Object.prototype.hasOwnProperty.call(options, prop)) {
      original[prop] = options[prop]
    }
  }

  return original
}

module.exports = extend
