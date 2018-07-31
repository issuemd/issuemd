const issuemd = require('../../core')
const utils = require('../../utils')

const issuemdMerger = (left, right) => {
  var rightUpdates = utils.copy(right.updates)

  // concat and sort issues
  var sorted = right.updates
    ? right.updates.concat(left.updates).sort((a, b) => {
        return a.modified > b.modified
      })
    : left.updates

  var merged = []

  // remove duplicate entries
  for (var i = 0; i < sorted.length; i++) {
    if (JSON.stringify(sorted[i]) !== JSON.stringify(sorted[i - 1])) {
      merged.push(sorted[i])
    }
  }

  // check inequality in issue head
  left.updates = null
  right.updates = null

  if (!utils.equal(left, right)) {
    throw Error('issues are not identical - head must not be modified, only updates added')
  }

  right.updates = rightUpdates

  left.updates = merged

  return left
}

module.exports = issuemdMerger
