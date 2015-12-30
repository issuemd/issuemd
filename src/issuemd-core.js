'use strict';

// module layout inspired by underscore
! function () {

    var formatter = getFormatter();
    var parser = require('./parser/issuemd-parser-builder.js');

    var root = this;

    issuemd.version = '__VERSION__';

    issuemd.fn = Issuemd.prototype = extend({

        // don't use default object constructor so we can identify collections later on
        constructor: Issuemd,

        // enable collections to behave like an Array
        // ... and override default string/json methods
        length: 0,
        push: [].push,
        sort: [].sort,
        splice: [].splice,
        pop: [].pop,
        concat: function (arr) {
            return createCollection(this.toArray().concat(arr.toArray()));
        },
        toArray: function () {
            return [].slice.call(this);
        },
        toJSON: function () {
            // same implementation as .toArray
            return [].slice.call(this);
        },
        toString: function (cols, templateOverride) {
            return formatter.string(this.toArray(), cols, templateOverride);
        },

        sortUpdates: require('./plugins/issuemd.sort-updates.js')

    }, getMethods());

    /****************
     * main objects *
     ****************/

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
            issues.push(createIssue(issue));
        }

    }

    function Issuemd() {}

    function Issue() {}

    /*************
     * factories *
     *************/

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

    /*******************
     * issuemd methods *
     *******************/

    function getMethods() {

        return {

            // accepts `input` object including modifier, modified
            update: function (input /*...*/ ) {

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
            },

            // return string summary table of collection
            summary: function (cols, templateOverride) {
                return formatter.summary(this.toArray(), cols, templateOverride);
            },

            hash: function ( /*all*/ ) {

                var all = arguments[arguments.length - 1];
                var arr = [];
                var howMany = typeof all === 'boolean' && all ? this.length : 1;
                var length = typeof arguments[1] === 'number' ? arguments[1] : undefined;

                for (var i = 0; i < howMany; i++) {
                    arr.push(hash(signature(this.eq(i)), length));
                }

                return typeof all === 'boolean' && all ? arr : arr[0];

            },

            merge: function (input) {

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

            },

            eq: function (index) {

                var newCollection = issuemd();
                newCollection.push(this[index]);
                return newCollection;

            },

            html: function (options) {
                return formatter.html(this.toArray(), options || {});
            },

            md: function (input /*, options*/ ) {

                var options = getLastArgument(arguments, 'object') || {};

                if (type(input) === 'string') {
                    return this.merge(input);
                } else if (!!options) {
                    return formatter.md(this.toArray(), options);
                }

            },

            // loops over each issue - like underscore's each
            each: function (func) {

                each(this, function (item) {
                    func(issuemd([item]));
                });

                return this;

            },

            attr: function (attrs) {

                if (!attrs) {

                    return issueJsonToLoose(this.toArray()[0]);

                } else if (type(attrs) === 'string') {

                    return this.attr()[attrs];

                } else {

                    each(this, function (issue) {

                        var issueJsonIn = looseJsonToIssueJson(attrs, true);
                        issueJsonIn.original.meta = issue.original.meta.concat(issueJsonIn.original.meta);
                        issueJsonIn.updates = issue.updates.concat(issueJsonIn.updates);
                        issue.original = extend(issue.original, issueJsonIn.original);

                    });

                    return this;

                }

            },

            add: function (issueJson) {
                this.push(createIssue(issueJson));
            },

            // remove the issues specified by `input` (accepts array, or one or more argument specified indices to be deleted)
            remove: function (input) {

                var collection = this;

                // set indices to input if it is an array, or arguments array (by converting from arguments array like object)
                input = type(input) === 'array' ? input : [].slice.call(arguments);

                // sort and reverse input so that elements are removed from back, and don't change position of next one to remove
                input.sort().reverse();

                each(input, function (index) {
                    collection.splice(index, 1);
                });

                return collection;

            },

            // return a deep copy of a collection - breaking references
            clone: function () {
                return issuemd(copy(this.toArray()));
            },

            // return signature of first issue in collection
            signature: function () {
                var creator = this.attr('creator');
                var created = this.attr('created');
                return creator && created ? composeSignature(creator, created) : null;
            },

            comments: function () {

                if (this[0]) {

                    var out = [];

                    each(this[0].updates, function (update) {

                        if (type(update.body) === 'string' && update.body.length) {
                            out.push(copy(update));
                        }

                    });

                    return out;

                }

            },

            filter: function (first, second) {
                return second ? filterByAttr(this, first, second) : filterByFunction(this, first);
            }

        };

    }

    /**************************
     * issuemd specific utils *
     **************************/

    function getFormatter() {

        var fs = require('fs');

        var mustache = require('mustache'),
            marked = require('marked');

        /* mustache helper functions */

        return {
            render: {
                markdown: renderMarkdown,
                mustache: renderMustache
            },
            md: json2md,
            html: json2html,
            string: json2string,
            summary: json2summaryTable
        };

        function json2summaryTable(issueJSObject, cols, templateOverride) {

            cols = cols || 80;

            var data = [];

            each(issuemd(issueJSObject), function (issue) {

                var attr = issuemd(issue).attr();

                data.push({
                    title: attr.title,
                    creator: attr.creator,
                    id: attr.id,
                    assignee: attr.assignee,
                    status: attr.status
                });

            });

            var template = templateOverride ? templateOverride : fs.readFileSync(__dirname + '/templates/summary-string.mustache', 'utf8');

            return renderMustache(template, {
                util: getFormatterUtils(0, cols),
                data: data
            });

        }

        function json2string(issueJSObject, cols, templateOverride) {

            cols = cols || 80;

            var splitLines = function (input) {

                var output = [];

                var lines = wordwrap(input, (cols - 4)).replace(/\n\n+/, '\n\n').split('\n');

                each(lines, function (item) {

                    if (item.length < (cols - 4)) {
                        output.push(item);
                    } else {
                        output = output.concat(item.match(new RegExp('.{1,' + (cols - 4) + '}', 'g')));
                    }

                });

                return output;

            };

            var template = templateOverride ? templateOverride : fs.readFileSync(__dirname + '/templates/issue-string.mustache', 'utf8');

            if (issueJSObject) {

                var out = [],
                    issues = issuemd(issueJSObject);

                each(issues, function (issueJson) {

                    var issue = issuemd(issueJson),
                        data = {
                            meta: [],
                            comments: []
                        };

                    var widest = 'signature'.length;

                    each(issue.attr(), function (value, key) {
                        if (key === 'title' || key === 'body') {

                            data[key] = splitLines(value);

                        } else if (key === 'created' || key === 'creator') {

                            data[key] = value;

                            if (key.length > widest) {
                                widest = key.length;
                            }

                        } else {

                            data.meta.push({
                                key: key,
                                value: value
                            });

                            if (key.length > widest) {
                                widest = key.length;
                            }
                        }

                    });

                    each(issue.comments(), function (value) {

                        value.body = splitLines(value.body);
                        data.comments.push(value);

                    });

                    out.push(renderMustache(template, {
                        util: getFormatterUtils(widest, cols),
                        data: data
                    }));

                });

                return out.join('\n');
            }

        }

        function getFormatterUtils(widest, cols) {

            cols = cols || 80;

            var curtailed = function () {

                return function (str, render) {
                    var content = render(str);
                    return curtail(content + repeat(' ', cols - 4 - content.length), cols - 4);
                };

            };

            var body = function () {

                return function (str, render) {
                    var content = render(str);
                    return content + repeat(' ', cols - 4 - content.length);
                };

            };

            var padleft = function () {

                return function (str, render) {
                    return repeat(render(str), widest);
                };

            };

            var padright = function () {

                return function (str, render) {
                    return repeat(render(str), cols - widest - 7);
                };

            };

            var pad12 = function () {

                return function (str, render) {
                    return (render(str) + '            ').substr(0, 12);
                };

            };

            var key = function () {

                return function (str, render) {
                    var content = render(str);
                    return content + repeat(' ', widest - content.length);
                };

            };
            var value = function () {

                return function (str, render) {
                    return render(str) + repeat(' ', cols - 7 - widest - render(str).length);
                };

            };

            function pad() {

                return function (str, render) {
                    return repeat(render(str), cols - 4);
                };

            }

            function pad6() {

                return function (str, render) {
                    return (render(str) + '      ').substr(0, 6);
                };

            }

            return {
                body: body,
                key: key,
                value: value,
                pad: pad,
                pad6: pad6,
                pad12: pad12,
                padleft: padleft,
                padright: padright,
                curtailed: curtailed
            };

        }

        function renderMarkdown(input) {
            return marked(input);
        }

        function renderMustache(template, data) {
            return mustache.render(template, data);
        }

        function json2html(issueJSObject, options) {

            var issues = copy(issueJSObject);

            each(issues, function (issue) {

                issue.original.body = issue.original.body ? marked(issue.original.body) : '';

                each(issue.updates, function (update) {
                    update.body = update.body ? marked(update.body) : '';
                });

            });

            var template = options.template || fs.readFileSync(__dirname + '/templates/issue-html.mustache', 'utf8');

            return renderMustache(template, issues);

        }

        function json2md(issueJSObject, options) {

            var template = options.template || fs.readFileSync(__dirname + '/templates/issue-md.mustache', 'utf8');

            return renderMustache(template, issueJSObject);

        }

        function repeat(char, qty) {

            var out = '';

            for (var i = 0; i < qty; i++) {
                out += char;
            }

            return out;

        }

        function curtail(input, width) {
            return input.length > width ? input.slice(0, width - 3) + '...' : input;
        }

    }

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

        var rightComments = copy(right.updates);

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
            // TODO: better error handling required here - perhaps like: http://stackoverflow.com/a/5188232/665261
            console.log('issues are not identical - head must not be modified, only updates added');
        }

        // TODO: better way to ensure updates on right side remain untouched
        right.updates = rightComments;

        left.updates = merged;

        return left;

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

    // TODO: think about how to treat meta vs attr from user's perspective
    function issueJsonToLoose(issue) {

        var out = (issue || {}).original || {};

        each(out.meta, function (meta) {
            out[meta.key] = meta.value;
        });

        delete out.meta;

        return out;

    }

    // accept original main properties mixed with arbitrary meta, and return issueJson structure
    // coerces all values to strings, adds default created/modified timestamps
    function looseJsonToIssueJson(original /*, updates..., sparse*/ ) {

        var sparse = type(arguments[arguments.length - 1]) === 'boolean' && arguments[arguments.length - 1];

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

    /*****************
     * general utils *
     *****************/

    // return last argument if it is of targetType, otherwise return null
    function getLastArgument(args, targetType) {
        var last = args[args.length - 1];
        return type(last) === targetType ? last : null;
    }

    function copy(input) {
        return JSON.parse(JSON.stringify(input));
    }

    function type(me) {
        return Object.prototype.toString.call(me).split(/\W/)[2].toLowerCase();
    }

    // TODO: more general date converter method required
    function now() {
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

    // initially from: http://phpjs.org/functions/wordwrap/
    // TODO: rewrite this function to be more easily understood/maintained
    function wordwrap(str, intWidth, strBreak, cut) {

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