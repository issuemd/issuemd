const objectKeys = require('./object-keys')

const each = (obj, iteratee, context) => {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (context !== void 0) {
    iteratee = (value, other) => iteratee.call(context, value, other)
  }

  let i
  let length = obj.length

  if (length === +length) {
    for (i = 0; i < length; i++) {
      if (iteratee(obj[i], i, obj) === false) {
        break
      }
    }
  } else {
    const keys = objectKeys(obj)

    for (i = 0, length = keys.length; i < length; i++) {
      if (iteratee(obj[keys[i]], keys[i], obj) === false) {
        break
      }
    }
  }

  return obj
}

module.exports = each
