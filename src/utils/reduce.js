const reduce = (a, b) => {
  if (a == null) throw new TypeError('Array.prototype.reduce called on null or undefined')
  if (typeof b !== 'function') throw new TypeError(b + ' is not a function')
  let f,
    c = Object(a),
    d = c.length >>> 0,
    e = 0
  if (arguments.length == 3) f = arguments[2]
  else {
    for (; d > e && !(e in c); ) e++
    if (e >= d) throw new TypeError('Reduce of empty array with no initial value')
    f = c[e++]
  }
  for (; d > e; e++) e in c && (f = b(f, c[e], e, c))
  return f
}

module.exports = reduce
