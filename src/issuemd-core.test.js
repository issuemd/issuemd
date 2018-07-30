/* global describe, it */

const assert = require('assert')

const issuemd = require('./issuemd')
const fixtures = require('../test/fixtures')

describe('export issuemd function', () => {
  it('should load issuemd library', () => {
    assert.equal(typeof issuemd, 'function')
  })
})

describe('issuemd create', () => {
  it('should create empty issue with no argument', () => {
    const issueString = issuemd()
      .attr({
        created: fixtures.timeString
      })
      .toString()

    assert.equal(issueString, fixtures.emptyString)
  })

  it('should create empty issue passing empty object', () => {
    const issueString = issuemd({})
      .attr({
        creator: 'someguy',
        created: fixtures.timeString
      })
      .toString()

    assert.equal(issueString, fixtures.emptyIssue)
  })

  it('should create empty issues passing multiple empty objects', () => {
    const issueString = issuemd({}, {}, {})
      .attr({
        creator: 'someguy',
        created: fixtures.timeString
      })
      .toString()

    const threeIssues = fixtures.emptyIssue + '\n' + fixtures.emptyIssue + '\n' + fixtures.emptyIssue

    assert.equal(issueString, threeIssues)
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
