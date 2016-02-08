'use strict';

var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../issuemd.min.js') : require('../src/issuemd.js');

var fixtures = require('./fixtures.js');

describe('issuemd formatter', function () {

    it('should format issues as ', function () {
        var timestring = '2015-06-27T19:42:56.000+0000';
        expect(issuemd({}).attr({
            creator: 'someguy',
            created: timestring
        }) + '').toBe(fixtures.emptyIssue);
        expect(issuemd({}, {}, {}).attr({
            creator: 'someguy',
            created: timestring
        }) + '').toBe(fixtures.emptyIssue + '\n' + fixtures.emptyIssue + '\n' + fixtures.emptyIssue);
    });

});