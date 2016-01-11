'use strict';

describe('issuemd load', function () {

    var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../issuemd.min.js') : require('../src/issuemd.js');

    it('should load the library', function () {
        expect(typeof issuemd).toBe('function');
    });

});