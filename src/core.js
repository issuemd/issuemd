// TODO: does it make sense to define a function to
// call a method of itself that is not yet attached!?
const issuemd = (...args) => issuemd.fn.main(...args)

// main constructor function
function Issuemd() {}

issuemd.fn = Issuemd.prototype = {
  // don't use default object constructor so we can identify collections later on
  constructor: Issuemd,

  // enable collections to behave like an Array
  length: 0,

  push: [].push,
  sort: [].sort,
  splice: [].splice,
  pop: [].pop,
  shift: [].shift,
  unshift: [].unshift
}

issuemd.version = 'v__VERSION__'

module.exports = issuemd
