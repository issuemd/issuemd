/* global describe, it */

const assert = require('assert')

const issuemd = require('./issuemd')
const fixtures = require('../test/fixtures')
const { ERROR_MAIN_INVALID_INPUT } = require('./error-messages')

const emptyIssue = issuemd({ created: fixtures.timeString })

describe('export issuemd function', () => {
  it('should load issuemd library', () => {
    assert.equal(typeof issuemd, 'function')
  })
})

describe('issuemd create', () => {
  it('should create empty issue when no argument provided', () => {
    const issueString = issuemd().toString()
    assert.equal(issueString, fixtures.emptyString)
  })

  it('should create empty issue when passing empty object', () => {
    const issueString = issuemd({})
      .attr({ created: fixtures.timeString })
      .toString()

    assert.equal(issueString, emptyIssue)
  })

  it('should create empty issues divided with "\\n" when passing multiple empty objects', () => {
    const issueString = issuemd({}, {}, {})
      .attr({
        created: fixtures.timeString
      })
      .toString()

    const threeIssues = emptyIssue + '\n' + emptyIssue + '\n' + emptyIssue

    assert.equal(issueString, threeIssues)
  })

  it('should return issuemd object instance if passed in', () => {
    const issueOne = issuemd({
      randomParam: 'random value'
    })
    const issueTwo = issuemd(issueOne)

    assert.equal(issueOne, issueTwo)
  })

  describe('invalid parameters', () => {
    const errorMessage = ERROR_MAIN_INVALID_INPUT

    it('should throw error when passing null', () => {
      function throwError() {
        const testIssue = issuemd(null)
      }
      expect(throwError).toThrow(errorMessage)
    })

    it('should throw error when passing invalid params', () => {
      function throwError() {
        const testIssue = issuemd(undefined)
      }
      expect(throwError).toThrow(errorMessage)
    })
  })
})

describe('array like syntax', () => {
  let issues

  beforeEach(() => {
    issues = issuemd({}, {}, {}).attr({
      creator: 'someguy',
      created: fixtures.timeString
    })
  })

  it('should look like array of three objects', () => {
    assert.equal(typeof issues[0], 'object')
    assert.equal(typeof issues[1], 'object')
    assert.equal(typeof issues[2], 'object')
    assert.equal(typeof issues[3], 'undefined')
    assert.equal(issues.length, 3)
  })

  it('should have pop methods', () => {
    issues.pop()
    assert.equal(typeof issues[2], 'undefined')
    assert.equal(issues.length, 2)
  })

  it('should have push methods', () => {
    issues.push(issuemd())
    assert.equal(typeof issues[3], 'object')
    assert.equal(issues.length, 4)
  })

  it('should format correctly after issues are popped off', () => {
    issues.pop()
    issues.pop()
    assert.equal(issues.toString(), fixtures.emptyIssue)
  })

  it('should format newly initialised issue taken from array access method', () => {
    const issue = issuemd(issues[1])
    assert.equal(issue, fixtures.emptyIssue)
  })

  it('should have shift and unshift methods', () => {
    assert.equal(typeof issues.unshift === 'function', true)
  })

  it('should format correctly after issues are shifted off', () => {
    issues.shift()
    issues.shift()
    assert.equal(issues.toString(), fixtures.emptyIssue)
  })
})
