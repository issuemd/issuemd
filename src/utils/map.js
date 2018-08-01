// adapted from:
//     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Map#Polyfill
// ... and ...
//     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill
const map = (a, b, c) => {
  let d, e, f
  if (a == null) throw new TypeError(' this is null or not defined')
  const g = Object(a),
    h = g.length >>> 0
  if (typeof b !== 'function') throw new TypeError(b + ' is not a function')
  for (arguments.length > 1 && (d = c), e = new Array(h), f = 0; h > f; ) {
    let i, j
    f in g && ((i = g[f]), (j = b.call(d, i, f, g)), (e[f] = j)), f++
  }
  return e
}

module.exports = map
