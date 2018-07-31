// return last argument if it is of targetType, otherwise return null
const getLastArgument = (args, targetType, defaultValue) => {
  const last = args[args.length - 1]
  return type(last) === targetType ? last : defaultValue || null
}

const copy = (input) => {
  return JSON.parse(JSON.stringify(input))
}

const type = (me) => {
  return Object.prototype.toString
    .call(me)
    .split(/\W/)[2]
    .toLowerCase()
}

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

const objectKeys = (obj) => {
  const keys = []

  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      keys.push(i)
    }
  }

  return keys
}

const trim = (string) => {
  return (string + '').replace(/(^\s+|\s+$)/g, '')
}

const extend = (original, options) => {
  for (const prop in options) {
    if (Object.prototype.hasOwnProperty.call(options, prop)) {
      original[prop] = options[prop]
    }
  }

  return original
}

// more full featured implementation: https://gist.github.com/billymoon/91db9ccada62028b50c7
const wordwrap = (str, intWidth) => {
  const result = []

  each(str.split(/\r\n|\n|\r/), (line) => {
    line = line.replace(/^\s\b/, '')

    let endPosition
    let segment
    let out = ''

    while (line.length > intWidth) {
      segment = line.slice(0, intWidth + 1).match(/\S*(\s)?$/)

      if (segment[1]) {
        endPosition = intWidth
      } else if (segment.input.length - segment[0].length) {
        endPosition = segment.input.length - segment[0].length
      } else {
        endPosition = intWidth
      }

      out += line.slice(0, endPosition)

      line = line.slice(endPosition)

      if (!!line && line.length) {
        out += '\n'
      }
    }

    result.push(out + line)
  })

  return result.join('\n')
}

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

module.exports = {
  getLastArgument,
  copy,
  type,
  each,
  objectKeys,
  trim,
  extend,
  wordwrap,
  map,
  reduce,
  equal
}
