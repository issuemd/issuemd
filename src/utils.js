'use strict';

module.exports = {
    // inspired by: http://stackoverflow.com/a/6713782/665261
    objectsEqual: function (x, y) {
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
            if (!this.objectsEqual(x[p], y[p])) {
                return false;
            }
        }
        for (p in y) {
            if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
                return false;
            }
        }
        return true;
    },
    makeIssue: function (original, updates) {
        original = original || {};
        var out = {
            original: {
                title: original.title || '',
                creator: original.creator || '',
                created: original.created || this.now(),
                meta: original.meta || [],
                body: original.body || ''
            },
            updates: updates || []
        };
        // TODO: does it make sense to set modified time for all updates if not set?
        var that = this;
        this.each(out.updates, function (update) {
            update.modified = update.modified || that.now();
        });
        return out;
    },
    // takes hash and returns array of key/value objects
    toKeyVal: function (input) {
        return this.mapToArray(input, function (value, key) {
            return {
                key: key,
                value: value
            };
        });
    },
    // TODO: better method to deep copy
    copy: function (input) {
        return JSON.parse(JSON.stringify(input));
    },
    now: function () {
        // TODO: more general date converter method required
        return (new Date()).toISOString().replace('T', ' ').slice(0, 19);
    },
    typeof: function (me) {
        return Object.prototype.toString.call(me).split(/\W/)[2].toLowerCase();
    },
    // TODO: probably not required, use more general `utils.typeof`
    isObject: function (input) {
        return this.typeof(input) === 'object';
    },
    // TODO: this is only used once, can it be refactored and deleted?
    arrayWrap: function (input) {
        return this.typeof(input) !== 'array' ? [input] : input;
    },
    indexOf: function (arr, value, from) {
        // TODO: should we cache a copy of `[]` as `arr` and use `arr.indexOf` instead of `Array.prototype.indexOf` - other libs seem to do that
        return arr === null || arr === undefined ? -1 : Array.prototype.indexOf.call(arr, value, from);
    },
    // adapted from from underscore.js
    each: function (obj, iteratee, context) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (context !== void 0) {
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
        this.each(arr, function (value, index) {
            results.push(iteratee(value, index, arr));
        });
        return results;
    },
    // return firstbits hash of input, optionally specify `size` which defaults to 6
    hash: function (string, size) {
        return require('blueimp-md5').md5(string).slice(0, size || 6);
    },
    trim: function (string) {
        return string.replace(/(^\s+|\s+$)/g, '');
    },
    debug: {
        warn: function (message) {
            if (console.warn) {
                console.warn(message);
            } else {
                console.log(message);
            }
        },
        log: console.log
    },
    // initially from: http://phpjs.org/functions/wordwrap/
    // TODO: rewrite this function to be more easily understood/maintained
    wordwrap: function (str, intWidth, strBreak, cut) {

        intWidth = ((arguments.length >= 2) ? arguments[1] : 75);
        strBreak = ((arguments.length >= 3) ? arguments[2] : '\n');
        cut = ((arguments.length >= 4) ? arguments[3] : false);

        var i, j, lineCount, line, result;

        str += '';

        if (intWidth < 1) {
            return str;
        }

        for (i = -1, lineCount = (result = str.split(/\r\n|\n|\r/)).length; ++i < lineCount; result[i] += line) {
            for (line = result[i], result[i] = ''; line.length > intWidth; result[i] += line.slice(0, j) + ((line = line.slice(j)).length && (line = line.replace(/^\s\b/, '') || true) ? strBreak : '')) {
                j = cut === 2 || (j = line.slice(0, intWidth + 1).match(/\S*(\s)?$/))[1] ? intWidth : j.input.length - j[0].length || cut === 1 && intWidth || j.input.length + (j = line.slice(intWidth).match(/^\S*/))[0].length;
            }
        }

        return result.join('\n');
    }
};