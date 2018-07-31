const issuemd = require('./issuemd-core.js')

// issuemd utils and helpers
const utils = require('./utils.js')
const helpers = require('./issuemd-helpers.js')
const errors = require('./error-messages')

// issuemd modules
const issuemdParser = require('./parser')

/**********************
 * collection methods *
 **********************/

// methods to use as native overrides
// ... also `function toString` defined further down

function concat(collection, arr) {
  return createCollection(collection.toArray().concat(arr.toArray()))
}

function toArray(collection) {
  return [].slice.call(collection)
}

function toJSON(collection) {
  // same implementation as .toArray
  return [].slice.call(collection)
}

// requiring parser/helpers/utils

function main(collection, arr) {
  // if collection passed in, just return it without further ado
  if (arr instanceof issuemd.fn.constructor) {
    return arr
  }

  // we don't care if you supply array of arguments, or multiple arguments
  // just coerce into array...
  if (utils.type(arr) !== 'array') {
    arr = [].slice.call(arguments, 1)
  }

  arr.forEach(function(item) {
    if (utils.type(item) === 'null' || utils.type(item) === 'undefined') {
      throw Error(errors.ERROR_MAIN_INVALID_INPUT)
    }
  })

  var issues = []

  for (var i = 0, len = (arr || []).length; i < len; i++) {
    if (utils.type(arr[i]) === 'string') {
      var parsed = issuemdParser.parse(arr[i])
      utils.each(parsed, parsedHandler)
    } else if (arr[i].original) {
      issues.push(createIssue(arr[i]))
    } else {
      issues.push(createIssue(helpers.looseJsonToIssueJson(arr[i])))
    }
  }

  return createCollection(issues)

  function parsedHandler(issue) {
    issues.push(createIssue(issue))
  }
}

// requiring merger/helpers/utils

function merge(collection, input) {
  var hashes = collection.hash(true)

  utils.each(input, function(issue) {
    var idx
    var merged = false
    var issueHash = helpers.hash(helpers.composeSignature(issue.original.creator, issue.original.created))

    if ((idx = hashes.indexOf(issueHash)) !== -1) {
      issuemdMerger(collection[idx], issue)
      merged = true
    }

    if (!merged) {
      collection.push(issue)
    }
  })

  return collection
}

// requiring helpers/utils

function attr(collection, attrs) {
  if (!attrs) {
    return helpers.issueJsonToLoose(collection.toArray()[0])
  } else if (utils.type(attrs) === 'string') {
    return collection.attr()[attrs]
  } else {
    utils.each(collection, function(issue) {
      var issueJsonIn = helpers.looseJsonToIssueJson(attrs, true)
      issueJsonIn.original.meta = issue.original.meta.concat(issueJsonIn.original.meta)
      issueJsonIn.updates = issue.updates.concat(issueJsonIn.updates)
      issue.original = utils.extend(issue.original, issueJsonIn.original)
    })

    return collection
  }
}

// return signature of first issue in collection
function signature(collection) {
  var creator = collection.attr('creator')
  var created = collection.attr('created')
  return creator && created ? helpers.composeSignature(creator, created) : null
}

function filter(collection, first, second) {
  return second ? filterByAttr(collection, first, second) : filterByFunction(collection, first)

  function filterByFunction(collection, filterFunction) {
    var out = createCollection([])

    collection.each(function(item, index) {
      if (filterFunction(item, index)) {
        out.merge(item)
      }
    })

    return out
  }

  function filterByAttr(collection, key, valueIn) {
    var values = utils.type(valueIn) === 'array' ? valueIn : [valueIn]

    return filterByFunction(collection, function(issue) {
      var attrValue = issue.attr(key)
      var match = false

      utils.each(values, function(value) {
        if ((!match && (utils.type(value) === 'regexp' && value.test(attrValue))) || attrValue === value) {
          match = true
          return match
        }
      })

      return match
    })
  }
}

function hash(collection /*, all */) {
  var all = arguments[arguments.length - 1]
  var arr = []
  var howMany = typeof all === 'boolean' && all ? collection.length : 1
  var length = typeof arguments[1] === 'number' ? arguments[1] : undefined

  for (var i = 0; i < howMany; i++) {
    arr.push(helpers.hash(helpers.composeSignature(collection.attr('creator'), collection.attr('created')), length))
  }

  return typeof all === 'boolean' && all ? arr : arr[0]
}

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

// requiring utils

function comments(collection) {
  return utils.reduce(
    updates(collection),
    function(memo, updateInput) {
      if (updateInput.type === 'comment') {
        memo.push(updateInput)
      }
      return memo
    },
    []
  )
}

function updates(collection) {
  if (collection[0]) {
    var out = []

    utils.each(collection[0].updates, function(updateInput) {
      if (utils.type(updateInput.body) === 'string' && updateInput.body.length) {
        out.push(utils.copy(updateInput))
      }
    })

    return out
  }
}

// return a deep copy of a collection - breaking references
function clone(collection) {
  return createCollection(utils.copy(collection.toArray()))
}

// remove the issues specified by `input` (accepts array, or one or more argument specified indices to be deleted)
function remove(collection, input) {
  // set indices to input if it is an array, or arguments array (by converting from arguments array like object)
  input = utils.type(input) === 'array' ? input : [].slice.call(arguments, 1)

  // sort and reverse input so that elements are removed from back, and don't change position of next one to remove
  input.sort().reverse()

  utils.each(input, function(index) {
    collection.splice(index, 1)
  })

  return collection
}

// loops over each issue - like underscore's each
function each(collection, func) {
  utils.each(collection, function(item, i) {
    return func(createCollection([item]), i)
  })

  return collection
}

function eq(collection, index) {
  var newCollection = createCollection([])
  newCollection.push(collection[index])
  return newCollection
}

function add(collection, issueJson) {
  collection.push(createIssue(issueJson))
}

function sortUpdates(collection) {
  collection.each(function(issue) {
    issue[0].updates.sort(function(a, b) {
      return new Date(a.modified) - new Date(b.modified)
    })
  })

  return collection
}

/***********************
 * supporting funtions *
 ***********************/

function Issue() {}

function createIssue(issueJson) {
  var instance = utils.extend(new Issue(), issueJson)
  return instance
}

function createCollection(issues) {
  var instance = new issuemd.fn.constructor()

  for (var i = 0, len = issues.length; i < len; i++) {
    instance.push(issues[i])
  }

  return instance
}

function issuemdMerger(left, right) {
  var rightUpdates = utils.copy(right.updates)

  // concat and sort issues
  var sorted = right.updates
    ? right.updates.concat(left.updates).sort(function(a, b) {
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

module.exports = {
  main,
  toJSON,
  toArray,
  concat,
  merge,
  attr,
  signature,
  filter,
  hash,
  update,
  updates,
  comments,
  clone,
  remove,
  each,
  eq,
  add,
  sortUpdates
}
