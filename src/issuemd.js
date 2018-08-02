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
  if (this && this.issuemd === issuemd) {
    this.issuemd = _issuemd
  }
  return this
}

issuemd.utils = utils

module.exports = issuemd
