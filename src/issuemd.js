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

    var utils = require('./utils.js'),
        issuemd = require('./issuemd-core.js'),
        methods = require('./issuemd-methods.js'),
        formatter = require('./issuemd-formatter.js'),
        _issuemd = this ? this.issuemd : undefined;

    // attach methods to Issuemd prototype (`issuemd.fn`)
    utils.each(utils.extend(methods, formatter), function (method, name) {
        issuemd.fn[name] = function () {
            return method.apply(null, [this].concat([].slice.call(arguments, 0)));
        };
    });

    issuemd.noConflict = function () {
        if (root && root.issuemd === issuemd) {
            root.issuemd = _issuemd;
        }
        return this;
    };

    return issuemd;

}));