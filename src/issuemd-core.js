'use strict';

// module layout inspired by underscore
! function () {

    var formatter = issuemd.formatter = require('./issuemd-formatter.js')(issuemd);
    var parser = issuemd.parser = require('../issuemd-parser.min.js');
    var merger = issuemd.merger = require('./issuemd-merger.js');
    var utils = issuemd.utils = require('./utils.js');

    var root = this;

    issuemd.version = '0.1.0';

    // API Methods
    // extendable by adding to `issuemd.fn` akin to jQuery plugins
    issuemd.fn = Issuemd.prototype = {

        // don't use default object constructor so we can identify collections later on
        constructor: Issuemd,

        // enable collections to behave like an Array
        length: 0,
        toArray: function () {
            return [].slice.call(this);
        },
        push: [].push,
        sort: [].sort,
        splice: [].splice,
        pop: [].pop,

        // expose useful functions publicly
        toJSON: passThis(toJSON),
        toString: passThis(toString),
        md: passThis(md),
        html: passThis(html),
        summary: passThis(summary),
        clone: passThis(clone),
        eq: passThis(eq),
        each: passThis(each),
        remove: passThis(remove),
        update: passThis(update),
        merge: passThis(localmerge),
        attr: passThis(attr),
        signature: passThis(signature),
        hash: passThis(hash),
        meta: passThis(meta),
        comments: passThis(comments),
        filter: passThis(filter),

        /* * * * * *
         * Mixins  *
         * * * * * */

        sortUpdates: require('./plugins/issuemd.sort-updates.js')

    };

    // hook module into AMD/require etc...

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

    /* * * * * * *
     * Functions *
     * * * * * * */

    // main entry point for issuemd api
    // jquery like chained api inspired by: http://blog.buymeasoda.com/creating-a-jquery-like-chaining-api/
    function issuemd() {

        // http://stackoverflow.com/a/14378462/665261
        function factoryBuilder(constructor) {
            var instance = Object.create(constructor.prototype);
            var result = constructor.apply(instance, Array.prototype.slice.call(arguments, 1));
            return (result !== null && typeof result === 'object') ? result : instance;
        }

        var issuemdFactory = factoryBuilder.bind(null, Issuemd);
        return issuemdFactory.apply(null, arguments);

    }

    // issuemd constructor function
    function Issuemd(input, arg2) {

        // if there is no input, return a collection with no issues
        if (input === null || input === undefined) {
            makeIssues(this, 0);
            return this;
        }

        // if collection passed in, just return it without further ado
        if (input instanceof issuemd.fn.constructor) {
            return input;
        }

        if (utils.typeof(input) === 'object') {
            var build = {
                original: {
                    meta: []
                },
                updates: []
            };
            utils.each(input, function (value, key) {
                if (key === 'title' || key === 'created' || key === 'creator' || key === 'body') {
                    build.original[key] = value;
                } else {
                    build.original.meta.push({
                        key: key,
                        value: value
                    });
                }
            });
            if (utils.typeof(arg2) === 'array' || (utils.typeof(arg2) === 'object' && (arg2 = [].slice.call(arguments, 1)))) {
                var updates = [];
                utils.each(arg2, function (update) {
                    var build = {
                        meta: []
                    };
                    utils.each(update, function (value, key) {
                        if (key === 'type' || key === 'modified' || key === 'modifier' || key === 'body') {
                            build[key] = value;
                        } else {
                            build.meta.push({
                                key: key,
                                value: value
                            });
                        }
                    });
                    updates.push(build);
                });
                build.updates = updates;
            }
            input = build;
        }

        // assume input is issue like, and try to return it as a collection
        var arr = issueArrayFromAnything(input);
        for (var i = 0; i < arr.length; i++) {
            localmerge(this, arr[i]);
        }

        return this;

    }

    // serialize issue data object into issuemd style JSON
    function toJSON(collection) {
        var ret = [];
        for (var i = 0; i < collection.length; i++) {
            ret.push(collection[i]);
        }
        return ret;
    }

    // when coerced into string, return issue collection as md
    function toString(collection, cols, templateOverride) {
        return formatter.string(collection.toArray(), cols, templateOverride);
    }

    // return string summary table of collection
    function summary(collection, cols, templateOverride) {
        return formatter.summary(collection.toArray(), cols, templateOverride);
    }

    // return MD render of all ussues
    function md(collection, input, templateOverride) {
        if (typeof input === 'string') {
            return collection.merge(input);
            // merger(collection[0], issueArrayFromAnything(input)[0]);
        } else {
            return formatter.md(collection.toArray(), templateOverride);
        }
    }

    // return HTML render of all issues
    function html(collection, templateOverride) {
        return formatter.html(collection.toArray(), templateOverride);
    }

    // return a deep copy of a collection - breaking references
    function clone(collection) {
        return issuemd(utils.copy(collection.toArray()));
    }

    // return new collection with *reference* to issue at `index` of original collection
    function eq(collection, index) {
        var newCollection = issuemd({});
        newCollection[0] = collection[index];
        return newCollection;
    }

    function makeIssues(collection, input) {
        for (var i = input; i--;) {
            collection.push(utils.makeIssue());
        }
        return collection;
    }

    // loops over each issue - like underscore's each
    function each(collection, func) {
        utils.each(collection, function (item) {
            func(issuemd([item]));
        });
        return collection;
    }

    // remove the issues specified by `input` (accepts array, or one or more arguments specified indices to be deleted)
    function remove(collection, input) {

        // set indices to input if it is an array, or arguments array (by converting from arguments array like object)
        var indices = utils.typeof(input) === 'array' ? input : [].slice.call(arguments);

        // sort and reverse indices so that elements are removed from back, and don't change position of next one to remove
        indices.sort().reverse();

        utils.each(indices, function (index) {
            collection.splice(index, 1);
        });

    }

    // accepts `input` object including modifier, modified
    function update(collection, input /*...*/ ) {

        if (utils.typeof(input) !== 'array') {
            input = [].slice.call(arguments, 1);
        }
        var updates = [];
        utils.each(input, function (update) {
            var build = {
                meta: []
            };
            utils.each(update, function (value, key) {
                if (key === 'type' || key === 'modified' || key === 'modifier' || key === 'body') {
                    build[key] = value;
                } else {
                    build.meta.push({
                        key: key,
                        value: value
                    });
                }
            });
            build.modified = build.modified || utils.now();
            updates.push(build);
        });

        utils.each(collection, function (issue) {
            issue.updates = issue.updates || [];
            // must retain original reference to array, not copy, hence...
            [].push.apply(issue.updates, updates);
        });

        return collection;
    }

    // creates or overwrites existing meta item with new key/value
    function updateMeta(collection, obj) {

        utils.each(collection, function (issue) {
            var hit;

            function hitness(meta) {
                if (meta.key === key) {
                    meta.value = value;
                    hit = true;
                }
            }
            for (var key in obj) {
                var value = obj[key];
                hit = false;
                if (key === 'title' || key === 'created' || key === 'creator' || key === 'body') {
                    issue.original[key] = value;
                } else {
                    // check all original meta values
                    utils.each(issue.original.meta, hitness);
                    if (!hit) {
                        issue.original.meta.push({
                            key: key,
                            value: value
                        });
                    }
                }
            }
        });
    }

    // without args or with boolean, returns raw attr hash from first issue or array of hashes from all issues (includes title/created/creator)
    // with key specified, returns matching value from first issue
    // with key/value, or key/value hash specified, updates all issues with key/value attrs
    function attr(collection, key, value) {

        var howMany;
        var arr = [];

        // if we have a key and value, update issue meta
        if (typeof key === 'string' && typeof value === 'string') {
            var obj = {};
            obj[key] = value;
            updateMeta(collection, obj);
            return collection;
            // if object passed in, update issue meta with object
        } else if (utils.isObject(key)) {
            updateMeta(collection, key);
            return collection;
            // if a key string is passed in, get related value from first issue
        } else if (typeof key === 'string') {
            if (value) {
                // return array of values for specified key from all issues
                utils.each(collection.attr(value), function (issue) {
                    arr.push(issue[key]);
                });
                return arr;
            } else {
                // return value for specified key from first issue
                return attr(collection)[key];
            }
        } else if ((typeof key === 'undefined' && typeof value === 'undefined') || typeof key === 'boolean') {
            // returns hash of attrs of first issue or array of hashes for all issues if boolean is true
            howMany = key ? collection.length : 1;
            var metaHandler = function (meta) {
                out[meta.key] = meta.value;
            };
            var updateHandler = function (update) {
                utils.each(update.meta, function (meta) {
                    out[meta.key] = meta.value;
                });
            };
            for (var i = 0; i < howMany; i++) {
                var out = {
                    title: collection[i].original.title,
                    created: collection[i].original.created,
                    creator: collection[i].original.creator,
                    body: collection[i].original.body
                };
                utils.each(collection[i].original.meta, metaHandler);
                utils.each(collection[i].updates, updateHandler);
                arr.push(out);
            }
            return key ? arr : arr[0];

        }
    }

    function signature(collection) {
        return composeSignature(collection.attr('creator'), collection.attr('created'));
    }

    function hash(collection /*, all*/ ) {
        var all = arguments[arguments.length - 1];
        var arr = [];
        var howMany = typeof all === 'boolean' && all ? collection.length : 1;
        for (var i = 0; i < howMany; i++) {
            arr.push(utils.hash(signature(collection.eq(i))));
        }
        return typeof all === 'boolean' && all ? arr : arr[0];
    }

    // same as `.attr` but only for meta (i.e. without title/created/creator/body)
    function meta(collection, key, value) {
        if (utils.isObject(key) || (typeof key === 'string' && typeof value === 'string')) {
            return attr(collection, key, value);
        } else if (typeof key === 'string') {
            return attr(collection, key, value);
        } else if (arguments.length === 0 || typeof key === 'boolean') {
            var arr = [];
            var howMany = key ? collection.length : 1;
            var metaHandler = function (meta) {
                out[meta.key] = meta.value;
            };
            for (var i = 0; i < howMany; i++) {
                var out = {};
                utils.each(collection[i].meta, metaHandler);
                arr.push(out);
            }
            return key ? arr : arr[0];
        }
    }

    function comments(collection) {
        if (collection.length > 1) {
            utils.debug.warn('`issuemd.fn.comments` is meant to operate on single issue, but got more than one, so will ignore others after first.');
        }
        if (collection[0]) {
            var out = [];
            utils.each(collection[0].updates, function (update) {
                if (utils.typeof(update.body) === 'string' && update.body.length) {
                    out.push(utils.copy(update));
                }
            });
            return out;
        }
    }

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
        var values = issuemd.utils.typeof(valueIn) === 'array' ? valueIn : [valueIn];
        return filterByFunction(collection, function (issue) {
            var attrValue = issue.attr(key),
                match = false;
            issuemd.utils.each(values, function (value) {
                if (!match && (issuemd.utils.typeof(value) === 'regexp' && value.test(attrValue)) || attrValue === value) {
                    match = true;
                    return match;
                }
            });
            return match;
        });
    }

    function filter(collection, first, second) {
        return second ? filterByAttr(collection, first, second) : filterByFunction(collection, first);
    }

    /* helper functions for Issuemd class */

    // merges one or more issues from issuePOJO or issueMD into issues
    function localmerge(collection, input) {

        var arr = issueArrayFromAnything(input);

        var hashes = collection.hash(true);

        utils.each(arr, function (issue) {
            var idx;
            var merged = false;
            var issueHash = utils.hash(composeSignature(issue.original.creator, issue.original.created));
            if ((idx = utils.indexOf(hashes, issueHash)) !== -1) {
                merger(collection[idx], issue);
                merged = true;
            }
            if (!merged) {
                collection.push(issue);
            }
        });

        return collection;

    }

    // helper function accepts any issue like things, and returns an array of issue data
    function issueArrayFromAnything(input) {
        if (input instanceof issuemd.fn.constructor) {
            return input.toArray();
        } else if (utils.typeof(input) === 'array') {
            var arr = [];
            for (var i = 0; i < input.length; i++) {
                var item = input[i];
                if (item instanceof issuemd.fn.constructor) {
                    item = item.toArray();
                }
                arr = arr.concat(issueArrayFromAnything(item));
            }
            return arr;
        } else if (utils.typeof(input) === 'object') {
            return [utils.makeIssue(input.original, input.updates)];
        } else if (utils.typeof(input) === 'string') {
            return parser.parse(input);
        }
    }

    // helper function ensures consistant signature creation
    function composeSignature(creator, created) {
        return utils.trim(creator) + ' @ ' + utils.trim(created);
    }

    function passThis(fn) {
        return function () {
            [].unshift.call(arguments, this);
            return fn.apply(this, arguments);
        };
    }

}();