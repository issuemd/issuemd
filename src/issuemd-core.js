'use strict';

! function () {

    var root = this;

    issuemd.version = '__VERSION__';

    issuemd.fn = require('./issuemd-methods.js')(issuemd);

    function issuemd() {

        return issuemd.fn.main.apply(null, arguments);

    }

    /***************************************
     * hook module into AMD/require etc... *
     ***************************************/

    if (typeof exports !== 'undefined') {

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = issuemd;
        }

        exports.issuemd = issuemd;

    } else {

        root.issuemd = issuemd;

    }

    if (typeof define === 'function' && define.amd) {

        define('issuemd', [], function () {
            return issuemd;
        });

    }

}();