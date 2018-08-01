const helpers = require('../helpers')
const utils = require('../utils')

// accepts `input` object including modifier, modified
function update(collection, input /* ... */) {
  if (utils.type(input) !== 'array') {
    input = [].slice.call(arguments, 1)
  }

  var updates = []

  utils.each(input, function(updateInput) {
    var build = {
      meta: []
    }

    utils.each(updateInput, function(value, key) {
      if (key === 'type' || key === 'modified' || key === 'modifier' || key === 'body') {
        build[key] = value
      } else {
        build.meta.push({
          key: key,
          value: value
        })
      }
    })

    build.modified = build.modified || helpers.now()

    updates.push(build)
  })

  utils.each(collection, function(issue) {
    issue.updates = issue.updates || []
    // must retain original reference to array, not copy, hence...
    ;[].push.apply(issue.updates, updates)
  })

  return collection
}

module.exports = update
