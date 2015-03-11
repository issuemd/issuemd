module.exports = function () {

    var utils = require('./utils.js');

    var merge = function (left, right) {

        // TODO: should the merge happen in place or not?
        // // take copies of inputs
        // left = utils.copy(left);
        // right = utils.copy(right);

        var rightComments = utils.copy(right.updates);

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
        if (!utils.objectsEqual(left,right)) {
            // TODO: better error handling required here - perhaps like: http://stackoverflow.com/a/5188232/665261
            console.log("issues are not identical - head must not be modified, only updates added");
        }

        // TODO: better way to ensure updates on right side remain untouched
        right.updates = rightComments;

        left.updates = merged;

        return left;

    }

    return merge;

}();