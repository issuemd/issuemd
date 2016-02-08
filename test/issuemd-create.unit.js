'use strict';

var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../issuemd.min.js') : require('../src/issuemd.js');

var fixtures = require('./fixtures.js');

describe('issuemd create', function () {

    it('should create empty issues', function () {
        var timestring = '2015-06-27T19:42:56.000+0000';
        expect(issuemd().attr({
            created: timestring
        }) + '').toBe('');
        expect(issuemd({}).attr({
            creator: 'someguy',
            created: timestring
        }) + '').toBe(fixtures.emptyIssue);
    });

});