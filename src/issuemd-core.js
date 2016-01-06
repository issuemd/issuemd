(function (root, factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return (root.returnExportsGlobal = factory(root));
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(root);
    } else {
        // Browser globals
        root.returnExportsGlobal = factory(root);
    }

}(typeof window !== 'undefined' ? window : this, function (root) {

    'use strict';

    var _issuemd = this ? this.issuemd : undefined;

    var issuemd = function () {
        return issuemd.fn.main.apply(null, arguments);
    };

    issuemd.version = '__VERSION__';

    issuemd.fn = require('./issuemd-methods.js')(issuemd);

    issuemd.noConflict = function () {
        if (root && root.issuemd === issuemd) {
            root.issuemd = _issuemd;
        }
        return this;
    };

    return issuemd;

}));