'use strict';

module.exports = function (utils) {

    return merger;

    function merger(left, right) {

        // inspired by: http://stackoverflow.com/a/6713782/665261
        function objectsEqual(x, y) {
            if (x === y) {
                return true;
            }
            if (!(x instanceof Object) || !(y instanceof Object)) {
                return false;
            }
            if (x.constructor !== y.constructor) {
                return false;
            }
            for (var p in x) {
                if (!x.hasOwnProperty(p)) {
                    continue;
                }
                if (!y.hasOwnProperty(p)) {
                    return false;
                }
                if (x[p] === y[p]) {
                    continue;
                }
                if (typeof (x[p]) !== 'object') {
                    return false;
                }
                if (!objectsEqual(x[p], y[p])) {
                    return false;
                }
            }
            for (p in y) {
                if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
                    return false;
                }
            }
            return true;
        }

        var rightUpdates = utils.copy(right.updates);

        // concat and sort issues
        var sorted = right.updates ? right.updates.concat(left.updates).sort(function (a, b) {
            return a.modified > b.modified;
        }) : left.updates;

        var merged = [];

        // remove duplicate entries
        for (var i = 0; i < sorted.length; i++) {
            if (JSON.stringify(sorted[i]) !== JSON.stringify(sorted[i - 1])) {
                merged.push(sorted[i]);
            }
        }

        // check inequality in issue head
        left.updates = null;
        right.updates = null;

        if (!objectsEqual(left, right)) {
            throw (Error('issues are not identical - head must not be modified, only updates added'));
        }

        right.updates = rightUpdates;

        left.updates = merged;

        return left;

    }

};