'use strict';

// module layout inspired by underscore
! function () {

    var formatter = issuemd.formatter = require('./issuemd-formatter.js')(issuemd);
    var parser = issuemd.parser = require('../issuemd-parser.min.js');
    var merger = issuemd.merger = require('./issuemd-merger.js');
    // var utils = issuemd.utils = require('./utils.js');

    var root = this;

    issuemd.version = '0.0.0';

    issuemd.fn = Issuemd.prototype = {

        // don't use default object constructor so we can identify collections later on
        constructor: Issuemd,

        // enable collections to behave like an Array
        length: 0,
        toArray: function () {
            return [].slice.call(this);
        },
        push: [].push,
        concat: function (arr) {
            return createCollection(this.toArray().concat(arr.toArray()));
        },
        sort: [].sort,
        splice: [].splice,
        pop: [].pop,

        // expose useful functions publicly
        add: issuemdAddIssueToCollection,
        toString: issuemdToString,
        attr: issuemdAttr,
        each: issuemdEach,
        comments: issuemdComments,
        merge: issuemdMerge,
        md: issuemdMd,
        hash: issuemdHash,
        eq: issuemdEq,
        filter: issuemdFilter,
        summary: issuemdSummary,
        update: issuemdUpdate,
        sortUpdates: require('./plugins/issuemd.sort-updates.js')

        // TODO: re-implement these currently unused methods

        // toJSON: passThis(toJSON),
        // html: passThis(html),
        // clone: passThis(clone),
        // remove: passThis(remove),
        // signature: passThis(signature),

    };

    /***************
     * main objects *
     ***************/

    function issuemd(arr) {

        // if collection passed in, just return it without further ado
        if (arr instanceof issuemd.fn.constructor) {
            return arr;
        }

        // we don't care if you supply array of arguments, or multiple arguments
        // just coerce into array...
        if (type(arr) !== 'array') {
            arr = [].slice.call(arguments, null);
        }

        var issues = [];

        for (var i = 0, len = (arr || []).length; i < len; i++) {
            if (type(arr[i]) === 'string') {
                var parsed = parser.parse(arr[i]);
                each(parsed, parsedHandler);
            } else if (arr[i].original) {
                issues.push(createIssue(arr[i]));
            } else {
                issues.push(createIssue(looseJsonToIssueJson(arr[i])));
            }

        }

        return createCollection(issues);

        function parsedHandler(issue) {
            // TODO: parser to output in this order...
            var ordered = {
                original: {
                    title: issue.original.title || '',
                    creator: issue.original.creator || '',
                    created: issue.original.created || '',
                    meta: issue.original.meta || [],
                    body: issue.original.body || ''
                },
                updates: issue.updates || []
            };
            issues.push(createIssue(ordered));
        }

    }

    function Issuemd() {}

    function Issue() {}

    /************
     * factories *
     ************/

    function createIssue(issueJson) {

        var instance = extend(new Issue(), issueJson);

        return instance;

    }

    function createCollection(issues) {

        var instance = new Issuemd();

        for (var i = 0, len = issues.length; i < len; i++) {
            instance.push(issues[i]);
        }

        return instance;

    }

    /******************
     * issuemd methods *
     ******************/

    function issuemdToString(cols, templateOverride) {
        return formatter.string(this.toArray(), cols, templateOverride);
    }

    // accepts `input` object including modifier, modified
    function issuemdUpdate(input /*...*/ ) {

        if (type(input) !== 'array') {
            input = [].slice.call(arguments);
        }
        var updates = [];
        each(input, function (update) {
            var build = {
                meta: []
            };
            each(update, function (value, key) {
                if (key === 'type' || key === 'modified' || key === 'modifier' || key === 'body') {
                    build[key] = value;
                } else {
                    build.meta.push({
                        key: key,
                        value: value
                    });
                }
            });
            build.modified = build.modified || now();
            updates.push(build);
        });

        each(this, function (issue) {
            issue.updates = issue.updates || [];
            // must retain original reference to array, not copy, hence...
            [].push.apply(issue.updates, updates);
        });

        return this;
    }

    // return string summary table of collection
    function issuemdSummary(cols, templateOverride) {
        return formatter.summary(this.toArray(), cols, templateOverride);
    }

    function issuemdHash( /*all*/ ) {
        var all = arguments[arguments.length - 1];
        var arr = [];
        var howMany = typeof all === 'boolean' && all ? this.length : 1;
        var length = typeof arguments[1] === 'number' ? arguments[1] : undefined;
        for (var i = 0; i < howMany; i++) {
            arr.push(hash(signature(this.eq(i)), length));
        }
        return typeof all === 'boolean' && all ? arr : arr[0];
    }

    function issuemdMerge(input) {

        var hashes = this.hash(true);

        var that = this;

        each(input, function (issue) {
            var idx;
            var merged = false;
            var issueHash = hash(composeSignature(issue.original.creator, issue.original.created));
            if ((idx = hashes.indexOf(issueHash)) !== -1) {
                merger(that[idx], issue);
                merged = true;
            }
            if (!merged) {
                that.push(issue);
            }
        });

        return that;

    }

    function issuemdEq(index) {
        var newCollection = issuemd();
        newCollection.push(this[index]);
        return newCollection;
    }

    // TODO: rationalise function signature
    function issuemdMd(input, templateOverride) {
        if (typeof input === 'string') {
            return this.merge(input);
        } else {
            return formatter.md(this.toArray(), templateOverride);
        }
    }

    // loops over each issue - like underscore's each
    function issuemdEach(func) {
        each(this, function (item) {
            func(issuemd([item]));
        });
        return this;
    }

    function issuemdAttr(attrs) {
        if (!attrs) {
            return issueJsonToLoose(this.toArray()[0]);
        } else if (type(attrs) === 'string') {
            return this.attr()[attrs];
        } else {
            each(this, function (issue) {
                var issueJsonIn = looseJsonToIssueJson(attrs, true);
                issueJsonIn.original.meta = issue.original.meta.concat(issueJsonIn.original.meta); // TODO: unique
                issueJsonIn.updates = issue.updates.concat(issueJsonIn.updates); // TODO: unique
                issue.original = extend(issue.original, issueJsonIn.original);
            });
            return this;
        }
    }

    function issuemdAddIssueToCollection(issueJson) {
        this.push(createIssue(issueJson));
    }

    function issuemdComments() {
        if (this[0]) {
            var out = [];
            each(this[0].updates, function (update) {
                if (type(update.body) === 'string' && update.body.length) {
                    out.push(copy(update));
                }
            });
            return out;
        }
    }

    function issuemdFilter(first, second) {
        return second ? filterByAttr(this, first, second) : filterByFunction(this, first);
    }

    /*************************
     * issuemd specific utils *
     *************************/

    function filterByFunction(collection, filterFunction) {
        var out = issuemd();
        collection.each(function (item, index) {
            if (filterFunction(item, index)) {
                out.merge(item);
            }
        });
        return out;
    }

    function filterByAttr(collection, key, valueIn) {
        var values = type(valueIn) === 'array' ? valueIn : [valueIn];
        return filterByFunction(collection, function (issue) {
            var attrValue = issue.attr(key),
                match = false;
            each(values, function (value) {
                if (!match && (type(value) === 'regexp' && value.test(attrValue)) || attrValue === value) {
                    match = true;
                    return match;
                }
            });
            return match;
        });
    }

    function signature(collection) {
        return composeSignature(collection.attr('creator'), collection.attr('created'));
    }

    // helper function ensures consistant signature creation
    function composeSignature(creator, created) {
        return trim(creator) + ' @ ' + trim(created);
    }

    function issueJsonToLoose(issue) {
        var out = (issue || {}).original || {};
        each(out.meta, function (meta) {
            out[meta.key] = meta.value;
        });
        delete out.meta;
        // delete out.body;
        return out;
    }

    // accept original main properties mixed with arbitrary meta, and return issueJson structure
    // coerces all values to strings, adds default created/modified timestamps
    function looseJsonToIssueJson(original /*, updates..., sparse*/ ) {
        var sparse = type(arguments[arguments.length - 1]) === 'boolean' && arguments[arguments.length - 1];
        // var updates = [].slice.apply(arguments, [1].concat(sparse ? [-1] : []));
        var updates = [].slice(arguments, 1);
        if (sparse) {
            updates.pop();
        }
        var out = {
            original: {
                title: (original.title || '') + '',
                creator: (original.creator || '') + '',
                created: (original.created || now()) + '',
                meta: original.meta || [],
                body: (original.body || '') + ''
            },
            updates: updates || []
        };
        each(original, function (value, key) {
            if (objectKeys(out.original).indexOf(key) === -1) {
                out.original.meta.push({
                    key: key,
                    value: value + ''
                });
            }
        });
        // TODO: does it make sense to set modified time for all updates if not set?
        // TODO: take all subsequent arguments as updates, or array of updates which will not be modified
        each(out.updates, function (update) {
            update.modified = update.modified || now();
        });
        if (sparse) {
            each(out.original, function (value, key) {
                if (key !== 'meta' && objectKeys(original).indexOf(key) === -1) {
                    delete out.original[key];
                }
            });
        }
        return out;
    }

    // return firstbits hash of input, optionally specify `size` which defaults to 32
    function hash(string, size) {
        return require('blueimp-md5').md5(string).slice(0, size || 32);
    }

    /****************
     * general utils *
     ****************/

    function copy(input) {
        return JSON.parse(JSON.stringify(input));
    }

    function type(me) {
        return Object.prototype.toString.call(me).split(/\W/)[2].toLowerCase();
    }

    function now() {
        // TODO: more general date converter method required
        return (new Date()).toISOString().replace('T', ' ').slice(0, 19);
    }

    // TODO: Returning non-false is the same as a continue statement in a for loop
    function each(obj, iteratee, context) {
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
    }

    function objectKeys(obj) {
        var keys = [];

        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }

        return keys;
    }

    function trim(string) {
        return (string + '').replace(/(^\s+|\s+$)/g, '');
    }

    function extend(original, options) {
        for (var prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                original[prop] = options[prop];
            }
        }
        return original;
    }

    /**************************************
     * hook module into AMD/require etc... *
     **************************************/

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