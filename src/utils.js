module.exports = {
    // inspired by: http://stackoverflow.com/a/6713782/665261
    objectsEqual: function (x, y) {
        if (x === y) return true;
        if (!( x instanceof Object ) || !( y instanceof Object )) return false;
        if (x.constructor !== y.constructor) return false;
        for (var p in x) {
            if (!x.hasOwnProperty(p)) continue;
            if (!y.hasOwnProperty(p)) return false;
            if (x[p] === y[p]) continue;
            if (typeof( x[p] ) !== "object") return false;
            if (!module.exports.objectsEqual(x[p], y[p])) return false;
        }
        for (p in y) {
            if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
        }
        return true;
    },
    makeIssue: function (original, updates) {
        original = original || {};
        return {
            original: {
                title: original.title || "",
                creator: original.creator || "",
                created: original.created || this.now(),
                meta: original.meta || [],
                body: original.body || ""
            },
            updates: updates || []
        };
    },
    // TODO: better method to deep copy
    copy: function (input) {
        return JSON.parse(JSON.stringify(input));
    },
    now: function () {
        // TODO: more general date converter method required
        return (new Date()).toISOString().replace("T", " ").slice(0, 19)
    },
    typeof: function (me) {
        return Object.prototype.toString.call(me).split(/\W/)[2].toLowerCase();
    },
    // TODO: probably not required, use more general `utils.typeof`
    isObject: function (input) {
        return this.typeof(input) === "object";
    },
    // TODO: this is only used once, can it be refactored and deleted?
    arrayWrap: function (input) {
        return this.typeof(input) !== "array" ? [input] : input;
    },
    indexOf: function (arr, val, from) {
        // TODO: should we cache a copy of `[]` as `arr` and use `arr.indexOf` instead of `Array.prototype.indexOf` - other libs seem to do that
        return arr == null ? -1 : Array.prototype.indexOf.call(arr, val, from);
    },
    // adapted from from underscore.js
    each: function (obj, iteratee, context) {
        if (obj == null) return obj;
        if (context !== void 0){
            iteratee = function (value, other) {
                return iteratee.call(context, value, other);
            };
        }
        var i, length = obj.length;
        if (length === +length) {
            for (i = 0; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            // TODO: IE 8 polyfill for Object.keys
            var keys = Object.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    },
    mapToArray: function (arr, iteratee) {
        var results = [];
        this.each(arr, function (val, index) {
            results.push(iteratee(val, index, arr));
        });
        return results;
    },
    debug: {
        warn: function(message){
            if(console.warn) console.warn(message);
            else console.log(message);
        },
        log: console.log
    }
};