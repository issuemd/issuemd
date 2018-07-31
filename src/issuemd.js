/* global define */

void (function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return (root.returnExportsGlobal = factory(root))
    })
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(root)
  } else {
    // Browser globals
    root.returnExportsGlobal = factory(root)
  }
})(typeof window !== 'undefined' ? window : this, function(root) {
  const utils = require('./utils')
  const issuemd = require('./core')
  const methods = require('./methods')
  const formatter = require('./formatter')
  const _issuemd = this ? this.issuemd : undefined

  // attach methods to Issuemd prototype (`issuemd.fn`)
  utils.each(utils.extend(methods, formatter), function(method, name) {
    issuemd.fn[name] = function(...args) {
      return method(this, ...args)
    }
  })

  issuemd.noConflict = function() {
    if (root && root.issuemd === issuemd) {
      root.issuemd = _issuemd
    }
    return this
  }

  issuemd.utils = utils

  return issuemd
})
