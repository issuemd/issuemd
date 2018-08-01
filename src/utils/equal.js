// TODO: copy is working based on JSON.parse and JSON.stringify,
// should this work in the same principle?
// inspired by: http://stackoverflow.com/a/6713782/665261
const equal = (x, y) => {
  if (x === y) {
    return true
  }
  if (!(x instanceof Object) || !(y instanceof Object)) {
    return false
  }
  if (x.constructor !== y.constructor) {
    return false
  }
  for (var p in x) {
    if (!x.hasOwnProperty(p)) {
      continue
    }
    if (!y.hasOwnProperty(p)) {
      return false
    }
    if (x[p] === y[p]) {
      continue
    }
    if (typeof x[p] !== 'object') {
      return false
    }
    if (!equal(x[p], y[p])) {
      return false
    }
  }
  for (p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
      return false
    }
  }
  return true
}

module.exports = equal
