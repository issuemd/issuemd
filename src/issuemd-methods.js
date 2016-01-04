'use strict';

module.exports = function (issuemd) {

    // issuemd utils and helpers
    var utils = require('./utils.js');
    var helpers = require('./issuemd-helpers.js')(utils);

    // issuemd modules
    var issuemdParser = require('./parser/issuemd-parser-builder.js');
    var issuemdMerger = require('./issuemd-merger.js')(utils);
    var issuemdFormatter = require('./issuemd-formatter.js')(utils, issuemd);

    Issuemd.prototype = {

        // don't use default object constructor so we can identify collections later on
        constructor: Issuemd,

        // enable collections to behave like an Array
        length: 0,
        push: [].push,
        sort: [].sort,
        splice: [].splice,
        pop: [].pop,
        concat: contextToArg(collectionConcat),
        toArray: contextToArg(collectionToArray),
        // ... and override native default methods
        toJSON: contextToArg(collectionToJSON),
        // toString: defined below...

        // main antry point for library `issuemd.fn.main()` aliased to `issuemd()`
        main: collectionMain,
        // merge methods
        merge: contextToArg(collectionMerge),
        // formatter methods
        toString: contextToArg(collectionToString),
        summary: contextToArg(collectionSummary),
        md: contextToArg(collectionMd),
        html: contextToArg(collectionHtml),
        // helper methods
        attr: contextToArg(collectionAttr),
        signature: contextToArg(collectionSignature),
        filter: contextToArg(collectionFilter),
        hash: contextToArg(collectionHash),
        update: contextToArg(collectionUpdate),
        // util methods
        comments: contextToArg(collectionComments),
        clone: contextToArg(collectionClone),
        remove: contextToArg(collectionRemove),
        each: contextToArg(collectionEach),
        eq: contextToArg(collectionEq),
        add: contextToArg(collectionAdd),

        // add isolated plugins
        sortUpdates: require('./plugins/issuemd.sort-updates.js')

    };

    return Issuemd.prototype;

    function Issuemd() {}

    function Issue() {}

    /***********************
     * supporting funtions *
     ***********************/

    // context proxy
    function contextToArg(func) {
        return function () {
            return func.apply(null, [this].concat([].slice.call(arguments, 0)));
        };
    }

    function createIssue(issueJson) {

        var instance = utils.extend(new Issue(), issueJson);
        return instance;

    }

    function createCollection(issues) {

        var instance = new Issuemd();

        for (var i = 0, len = issues.length; i < len; i++) {
            instance.push(issues[i]);
        }

        return instance;

    }

    /**********************
     * collection methods *
     **********************/

    // methods to use as native overrides
    // ... also `function collectionToString` defined further down

    function collectionConcat(collection, arr) {
        return createCollection(collection.toArray().concat(arr.toArray()));
    }

    function collectionToArray(collection) {
        return [].slice.call(collection);
    }

    function collectionToJSON(collection) {
        // same implementation as .toArray
        return [].slice.call(collection);
    }

    // requiring parser/helpers/utils

    function collectionMain(arr) {

        // if collection passed in, just return it without further ado
        if (arr instanceof Issuemd.prototype.constructor) {
            return arr;
        }

        // we don't care if you supply array of arguments, or multiple arguments
        // just coerce into array...
        if (utils.type(arr) !== 'array') {
            arr = [].slice.call(arguments, null);
        }

        var issues = [];

        for (var i = 0, len = (arr || []).length; i < len; i++) {

            if (utils.type(arr[i]) === 'string') {
                var parsed = issuemdParser.parse(arr[i]);
                utils.each(parsed, parsedHandler);
            } else if (arr[i].original) {
                issues.push(createIssue(arr[i]));
            } else {
                issues.push(createIssue(helpers.looseJsonToIssueJson(arr[i])));
            }

        }

        return createCollection(issues);

        function parsedHandler(issue) {
            issues.push(createIssue(issue));
        }

    }

    // requiring merger/helpers/utils

    function collectionMerge(collection, input) {

        var hashes = collection.hash(true);

        utils.each(input, function (issue) {

            var idx;
            var merged = false;
            var issueHash = helpers.hash(helpers.composeSignature(issue.original.creator, issue.original.created));

            if ((idx = hashes.indexOf(issueHash)) !== -1) {
                issuemdMerger(collection[idx], issue);
                merged = true;
            }

            if (!merged) {
                collection.push(issue);
            }

        });

        return collection;

    }

    // requiring formatter/utils

    function collectionToString(collection, cols, templateOverride) {
        return issuemdFormatter.string(collection.toArray(), cols, templateOverride);
    }

    // return string summary table of collection
    function collectionSummary(collection, cols, templateOverride) {
        return issuemdFormatter.summary(collection.toArray(), cols, templateOverride);
    }

    function collectionMd(collection, input /*, options*/ ) {

        var options = utils.getLastArgument(arguments, 'object') || {};

        if (utils.type(input) === 'string') {
            return collection.merge(input);
        } else if (!!options) {
            return issuemdFormatter.md(collection.toArray(), options);
        }

    }

    function collectionHtml(collection, options) {
        return issuemdFormatter.html(collection.toArray(), options || {});
    }

    // requiring helpers/utils

    function collectionAttr(collection, attrs) {

        if (!attrs) {

            return helpers.issueJsonToLoose(collection.toArray()[0]);

        } else if (utils.type(attrs) === 'string') {

            return collection.attr()[attrs];

        } else {

            utils.each(collection, function (issue) {

                var issueJsonIn = helpers.looseJsonToIssueJson(attrs, true);
                issueJsonIn.original.meta = issue.original.meta.concat(issueJsonIn.original.meta);
                issueJsonIn.updates = issue.updates.concat(issueJsonIn.updates);
                issue.original = utils.extend(issue.original, issueJsonIn.original);

            });

            return collection;

        }
    }

    // return signature of first issue in collection
    function collectionSignature(collection) {
        var creator = collection.attr('creator');
        var created = collection.attr('created');
        return creator && created ? helpers.composeSignature(creator, created) : null;
    }

    function collectionFilter(collection, first, second) {

        return second ? filterByAttr(collection, first, second) : filterByFunction(collection, first);

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

            var values = utils.type(valueIn) === 'array' ? valueIn : [valueIn];

            return filterByFunction(collection, function (issue) {

                var attrValue = issue.attr(key),
                    match = false;

                utils.each(values, function (value) {

                    if (!match && (utils.type(value) === 'regexp' && value.test(attrValue)) || attrValue === value) {
                        match = true;
                        return match;
                    }

                });

                return match;

            });

        }

    }

    function collectionHash(collection /*, all*/ ) {

        var all = arguments[arguments.length - 1];
        var arr = [];
        var howMany = typeof all === 'boolean' && all ? collection.length : 1;
        var length = typeof arguments[1] === 'number' ? arguments[1] : undefined;

        for (var i = 0; i < howMany; i++) {
            arr.push(helpers.hash(helpers.composeSignature(collection.attr('creator'), collection.attr('created')), length));
        }

        return typeof all === 'boolean' && all ? arr : arr[0];

    }

    // accepts `input` object including modifier, modified
    function collectionUpdate(collection, input /*...*/ ) {

        if (utils.type(input) !== 'array') {
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

            build.modified = build.modified || helpers.now();

            updates.push(build);

        });

        utils.each(collection, function (issue) {
            issue.updates = issue.updates || [];
            // must retain original reference to array, not copy, hence...
            [].push.apply(issue.updates, updates);
        });

        return collection;
    }

    // requiring utils

    function collectionComments(collection) {

        if (collection[0]) {

            var out = [];

            utils.each(collection[0].updates, function (update) {

                if (utils.type(update.body) === 'string' && update.body.length) {
                    out.push(utils.copy(update));
                }

            });

            return out;

        }

    }

    // return a deep copy of a collection - breaking references
    function collectionClone(collection) {
        return issuemd(utils.copy(collection.toArray()));
    }

    // remove the issues specified by `input` (accepts array, or one or more argument specified indices to be deleted)
    function collectionRemove(collection, input) {

        // set indices to input if it is an array, or arguments array (by converting from arguments array like object)
        input = utils.type(input) === 'array' ? input : [].slice.call(arguments, 1);

        // sort and reverse input so that elements are removed from back, and don't change position of next one to remove
        input.sort().reverse();

        utils.each(input, function (index) {
            collection.splice(index, 1);
        });

        return collection;

    }

    // loops over each issue - like underscore's each
    function collectionEach(collection, func) {

        utils.each(collection, function (item) {
            return func(issuemd([item]));
        });

        return collection;

    }

    function collectionEq(collection, index) {

        var newCollection = issuemd();
        newCollection.push(utils.copy(collection[index]));
        return newCollection;

    }

    function collectionAdd(collection, issueJson) {
        collection.push(createIssue(issueJson));
    }

};