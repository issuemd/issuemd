'use strict';

module.exports = (function () {

    issuemd.version = '__VERSION__';

    issuemd.fn = Issuemd.prototype = {

        // don't use default object constructor so we can identify collections later on
        constructor: Issuemd,

        // enable collections to behave like an Array
        length: 0,

        push: [].push,
        sort: [].sort,
        splice: [].splice,
        pop: [].pop

    };

    return issuemd;

    function issuemd() {
        return issuemd.fn.main.apply(null, arguments);
    }

    // main constructor function
    function Issuemd() {}

})();