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
        const issueString = issuemd().attr({
            created: fixtures.timeString
        }).toString()

        assert.equal(issueString, fixtures.emptyString)
    })

    it('should create empty issue passing empty object', () => {
        const issueString = issuemd({}).attr({
            creator: 'someguy',
            created: fixtures.timeString
        }).toString()
        
        assert.equal(issueString, fixtures.emptyIssue)
    })

    it('should create empty issues passing multiple empty objects', () => {
        const issueString = issuemd({}, {}, {}).attr({
            creator: 'someguy',
            created: fixtures.timeString
        }).toString()

        const threeIssues = fixtures.emptyIssue + '\n' + fixtures.emptyIssue + '\n' + fixtures.emptyIssue

        assert.equal(issueString, threeIssues)
    })
})