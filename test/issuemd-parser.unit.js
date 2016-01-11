'use strict';

var fixtures = require('./fixtures.js');

describe('issuemd parser', function () {

    var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../issuemd.min.js') : require('../src/issuemd.js');

    it('should parse simple markdown issue', function () {

        var issue = issuemd(fixtures.simpleIssue);

        expect(issue.length).toBe(1);
        expect(JSON.stringify(issue[0])).toBe(fixtures.simpleIssueJson);

    });

    it('should parse markdown issue with meta', function () {

        var issue = issuemd(fixtures.simpleIssueWithMeta);

        expect(issue.length).toBe(1);
        expect(JSON.stringify(issue[0])).toBe(fixtures.simpleIssueWithMetaJson);

    });

    it('should reproduce markdown after parsing', function () {

        var issue = issuemd(fixtures.simpleIssueWithMeta);
        expect(issue.md()).toBe(fixtures.simpleIssueWithMeta);

    });

    it('should reproduce markdown after parsing malformed input', function () {

        var issue = issuemd(fixtures.simpleIssueWithMetaMalformed);
        expect(issue.md()).toBe(fixtures.simpleIssueWithMeta);

    });

    it('should parse markdown issue with comments', function () {

        var issue = issuemd(fixtures.issueWithComments);

        expect(issue.length).toBe(1);
        expect(JSON.stringify(issue[0])).toBe(fixtures.issueWithCommentsJson);

    });

});