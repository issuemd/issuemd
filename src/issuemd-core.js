'use strict';

! function () {

    // only for jshint
    var self = self || {};

    // defining root, underscore's style 
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    // root should be Window when loaded in browser, but it isn't. 
    // but, it does exist outside this anonymus function
    var _issuemd = root ? root.issuemd : undefined;

    var issuemd = function () {
        return issuemd.fn.main.apply(null, arguments);
    };

    issuemd.version = '__VERSION__';

    issuemd.fn = require('./issuemd-methods.js')(issuemd);

    issuemd.noConflict = function () {
        // same error as when caching existing issuemd in _issuemd variable, root is undefined which it shouldn't be
        if (root) {
            root.issuemd = _issuemd;
        }
        return this;
    };

    /***************************************
     * hook module into AMD/require etc... *
     ***************************************/

    if (typeof exports !== 'undefined' && !exports.nodeType) {
        if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
            module.exports = issuemd;
        }
        exports.issuemd = issuemd;
    } else {
        root.issuemd = issuemd;
    }

    if (typeof define === 'function' && define.amd) {
        define('underscore', [], function () {
            return issuemd;
        });
    }

}();