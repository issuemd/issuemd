// TODO: use key/value not key/val
// TODO: lint with semistandard js
// TODO: classes for collection, issue, update
// TODO: created/modified -> timestamp - creator/modifier -> author (or think of better names)

// module layout inspired by underscore
;(function(){

    var parser = require('./issuemd-parser.js');
    var formatter = require('./issuemd-formatter.js');
    var merger = require('./issuemd-merger.js');
    var utils = require("./utils.js");

    // serialize issue data object into issuemd style JSON
    function toJSON (collection) {
        var ret = [];
        for(var i=0; i<collection.length; i++){
            ret.push(collection[i]);
        }
        return ret;
    }

    // when coerced into string, return issue collection as md
    function toString (collection, cols, template_override) {
        return formatter.string(collection.toArray(), cols, template_override);
    }

    // return string summary table of collection
    function summary(collection, cols, template_override) {
        return formatter.summary(collection.toArray(), cols, template_override);
    }

    // return MD render of all ussues
    // TODO: accept md and merge into collection - perhaps call from main entry point
    function md(collection, input, template_override) {
        if(typeof input === "string"){
            return collection.merge(input);
            // merger(collection[0], issue_array_from_anything(input)[0]);
        } else {
            return formatter.md(collection.toArray(), template_override);
        }
    }

    // return HTML render of all issues
    function html(collection, template_override) {
        return formatter.html(collection.toArray(), template_override);
    }

    // return a deep copy of a collection - breaking references
    function clone(collection){
        return issuemd(utils.copy(collection.toArray()));
    }

    // return new collection with *reference* to issue at `index` of original collection
    function eq(collection, index){
        var new_collection = issuemd({});
        new_collection[0] = collection[index];
        return new_collection;
    }

    function makeIssues(collection, input){
        for(var i = input; i--;){
            collection.push(utils.makeIssue());
        }
        return collection;
    }

    // loops over each issue - like underscore's each
    function each(collection, func){
        utils.each(collection, function(item){ func(issuemd([item])); });
        return collection;
    }

    // remove the issues specified by `input` (accepts array, or one or more arguments specified indices to be deleted)
    function remove(collection, input){

        // set indices to input if it is an array, or arguments array (by converting from arguments array like object)
        var indices = utils.typeof(input) === "array" ? input : [].slice.call(arguments);

        // sort and reverse indices so that elements are removed from back, and don't change position of next one to remove
        indices.sort().reverse();

        utils.each(indices, function(index){
            collection.splice(index, 1);
        });

    }

    // accepts `input` object including modifier, modified
    function update(collection, input/*...*/){

        if(utils.typeof(input) !== "array"){
            input = [].slice.call(arguments, 1);
        }
        var updates = [];
        utils.each(input, function(update){
            var build = {meta:[]};
            utils.each(update, function(val, key){
                if(key === 'type' || key === 'modified' || key === 'modifier' || key === 'body') {
                    build[key] = val;
                } else {
                    build.meta.push({ key:key, val:val });
                }
            });
            build.modified = build.modified || utils.now();
            updates.push(build);
        });

        utils.each(collection, function(issue){
            issue.updates = issue.updates || [];
            issue.updates = issue.updates.concat(updates);
        });

        return collection;
    }

    // creates or overwrites existing meta item with new key/val
    function updateMeta (collection, obj){

        utils.each(collection, function(issue){
            var hit;
            function hitness(meta) {
                if(meta.key === key){
                    meta.val = val;
                    hit = true;
                }
            }
            for(var key in obj){
                var val = obj[key];
                hit = false;
                if(key === "title" || key === "created" || key === "creator" || key === "body"){
                    issue.original[key] = val;
                } else {
                    // check all original meta values
                    utils.each(issue.original.meta, hitness);
                    if(!hit){
                        issue.original.meta.push({ key: key, val: val });
                    }
                }
            }
        });
    }

    // without args or with boolean, returns raw attr hash from first issue or array of hashes from all issues (includes title/created/creator)
    // with key specified, returns matching value from first issue
    // with key/val, or key/val hash specified, updates all issues with key/val attrs
    function attr(collection, key, val){
        // debugger
        // if we have a key and val, update issue meta
        if(typeof key === "string" && typeof val === "string"){
            var obj = {};
            obj[key] = val;
            updateMeta(collection, obj);
            return collection;
        // if object passed in, update issue meta with object
        } else if(utils.isObject(key)){
            updateMeta(collection, key);
            return collection;
        // if a key string is passed in, get related value from first issue
        } else if(typeof key === "string"){
            if(val){
                // return array of values for specified key from all issues
                var arr = [];
                utils.each(collection.attr(val), function(issue){
                    arr.push(issue[key]);
                });
                return arr;
            } else {
                // return value for specified key from first issue
                // TODO: should this be more like attr(collection) ..?
                return collection.attr()[key];
            }
        } else if ((typeof key === 'undefined' && typeof val === 'undefined') || typeof key === "boolean") {
            // returns hash of attrs of first issue or array of hashes for all issues if boolean is true
            var arr = [];
            var how_many = key ? collection.length : 1;
            for(var i = 0; i < how_many; i++){
                var out = {
                    title: collection[i].original.title,
                    created: collection[i].original.created,
                    creator: collection[i].original.creator,
                    // TODO: should we return body here?
                    body: collection[i].original.body
                };
                utils.each(collection[i].original.meta, function(meta){
                    out[meta.key] = meta.val;
                });
                utils.each(collection[i].updates, function(update){
                    utils.each(update.meta, function(meta){
                        out[meta.key] = meta.val;
                    });
                });
                arr.push(out);
            }
            return key ? arr : arr[0];
        }
    }

    function signature(collection) {
        return compose_signature(collection.attr('creator'), collection.attr('created'));
    }

    function hash(collection /*, all*/) {
        var all = arguments[arguments.length-1];
        var arr = [];
        var how_many = typeof all === 'boolean' && all ? collection.length : 1;
        for(var i = 0; i < how_many; i++){
            arr.push(utils.hash(signature(collection.eq(i))));
        }
        return typeof all === 'boolean' && all ? arr : arr[0];
    }

    // TODO: see how much of this code can be merged with attr and proxied through there
    // same as `.attr` but only for meta (i.e. without title/created/creator/body)
    function meta(collection, key, val){
        if(utils.isObject(key) || (typeof key === "string" && typeof val === "string")){
            return attr(collection, key, val);
        } else if(typeof key === "string"){
            // TODO: move get meta from `.attr` method to here, let `.attr` call this, and augment it
            return attr(collection, key, val);
        } else if (arguments.length === 0 || typeof key === "boolean"){
            var arr = [];
            var how_many = key ? collection.length : 1;
            for(var i = 0; i < how_many; i++){
                var out = {};
                utils.each(collection[i].meta, function(meta){
                    out[meta.key] = meta.val;
                });
                arr.push(out);
            }
            return key ? arr : arr[0];
        }
    }

    function comments(collection){
        if(collection.length > 1){
            utils.debug.warn('`issuemd.fn.comments` is meant to operate on single issue, but got more than one, so will ignore others after first.');
        }
        if(collection[0]){
            var out = [];
            utils.each(collection[0].updates, function(update){
                if(utils.typeof(update.body) === 'string' && update.body.length){
                    out.push(utils.copy(update));
                }
            });
            return out;
        }
    }

    function filterByFunction(collection, filter_function){
        var out = issuemd();
        collection.each(function(item, index){
            if(filter_function(item, index)){
                out.merge(item);
            }
        });
        return out;
    }

    function filterByAttr(collection, key, val_in){
        var vals = issuemd.utils.typeof(val_in) === 'array' ? val_in : [val_in];
        return filterByFunction(collection, function(issue){
            var attr_val = issue.attr(key), match = false;
            issuemd.utils.each(vals, function(val){
                // TODO: evaluate value equality test - should we continue to use `toString`?
                if(!match && (issuemd.utils.typeof(val) === 'regexp' && val.test(attr_val)) || attr_val === val.toString()){
                    match = true;
                    return match;                        
                }
            });
            return match;
        });
    }

    function filter(collection, first, second){
        return second ? filterByAttr(collection, first, second): filterByFunction(collection, first);
    }

    /* helper functions for Issuemd class */

    // TODO: create validate function to remove duplicates, warn, error out, clean etc... and call from here after merge
    // merges one or more issues from issuePOJO or issueMD into issues
    function localmerge(collection, input){

        var arr = issue_array_from_anything(input);

        // TODO: validate against hash attribute
        var hashes = collection.hash(true);

        utils.each(arr, function(issue){
            var idx;
            var merged = false;
            // TODO: is it really ok for the hash to be derived from the signature alone!!?
            var issue_hash = utils.hash(compose_signature(issue.original.creator, issue.original.created))
            if((idx = utils.indexOf(hashes, issue_hash)) != -1){
                merger(collection[idx], issue);
                merged = true;
            }
            if (!merged){
                collection.push(issue);
            }
        });

        return collection;

    }

    // helper function accepts any issue like things, and returns an array of issue data
    function issue_array_from_anything(input){
        if (input instanceof issuemd.fn.constructor) {
            return input.toArray();
        } else if (utils.typeof(input) === "array") {
            var arr = [];
            for(var i=0; i<input.length; i++) {
                var item = input[i];
                if(item instanceof issuemd.fn.constructor){
                    item = item.toArray();
                }
                arr = arr.concat(issue_array_from_anything(item));
            }
            return arr;
        } else if (utils.typeof(input) === "object") {
            return [utils.makeIssue(input.original, input.updates)];
        } else if (utils.typeof(input) === "string") {
            return parser.parse(input);
        }
    }

    // helper function ensures consistant signature creation
    function compose_signature(creator, created) {
        return utils.trim(creator) + ' @ ' + utils.trim(created);
    }

    var root = this;

    function applyToConstructor(constructor, argArray) {
        var args = [null].concat(argArray);
        var factoryFunction = constructor.bind.apply(constructor, args);
        return new factoryFunction();
    }

    // main entry point for issuemd api
    // jquery like chained api inspired by: http://blog.buymeasoda.com/creating-a-jquery-like-chaining-api/
    // TODO: handle creation of `$i` shortcut better, perhaps adding `$i.noConflict()` function
    $i = issuemd = function() {

        // http://stackoverflow.com/a/14378462/665261
        function factoryBuilder(constructor) {
            var instance = Object.create(constructor.prototype);
            var result = constructor.apply(instance, Array.prototype.slice.call(arguments, 1));
            return (result !== null && typeof result === 'object') ? result : instance;
        }

        var issuemdFactory = factoryBuilder.bind(null, Issuemd);
        return issuemdFactory.apply(null, arguments);

    };

    // TODO: read in config to set this and other things like it
    issuemd.version = '0.1.0';

    // get the core components in place
    issuemd.parser = parser;
    issuemd.merge = merger;
    issuemd.utils = utils;
    issuemd.formatter = formatter;

    // issuemd constructor function
    var Issuemd = function(input, arg2) {

        // if there is no input, return a collection with no issues
        if(input == undefined){
            makeIssues(this, 0);
            return this;
        }

        // if collection passed in, just return it without further ado
        if (input instanceof issuemd.fn.constructor) {
            return input;
        }

        if(utils.typeof(input) === "object"){
            var build = { original: { meta:[] }, updates: [] };
            utils.each(input, function(val, key){
                if(key === 'title' || key === 'created' || key === 'creator' || key === 'body') {
                    build.original[key] = val;
                } else {
                    build.original.meta.push({ key:key, val:val });
                }
            });
            if(utils.typeof(arg2) === "array" || (utils.typeof(arg2) === "object" && (arg2 = [].slice.call(arguments, 1)))) {
                var updates = [];
                utils.each(arg2, function(update){
                    var build = {meta:[]};
                    utils.each(update, function(val, key){
                        if(key === 'type' || key === 'modified' || key === 'modifier' || key === 'body') {
                            build[key] = val;
                        } else {
                            build.meta.push({ key:key, val:val });
                        }
                    });
                    updates.push(build);
                });
                build.updates = updates;
            }
            input = build;
        }

        // assume input is issue like, and try to return it as a collection
        var arr = issue_array_from_anything(input);
        for(var i=0; i<arr.length; i++){
            localmerge(this, arr[i]);
        }

        return this;

    };

    function passThis(fn){
        return function(){
            [].unshift.call(arguments, this);
            return fn.apply(this, arguments);            
        };
    };

    // API Methods
    // extendable by adding to `issuemd.fn` akin to jQuery plugins
    issuemd.fn = Issuemd.prototype = {

        // don't use default object constructor so we can identify collections later on
        constructor: Issuemd,

        // enable collections to behave like an Array
        length: 0,
        toArray: function() { return [].slice.call( this ); },
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
        filter: passThis(filter)
    };

    // hook module into AMD/require etc... or create as global variable

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) { 
            exports = module.exports = issuemd;
        }
        exports.issuemd = issuemd;
    } else {
        root.issuemd = issuemd;
    }

    if (typeof define === 'function' && define.amd) {
        define('issuemd', [], function() {
            return issuemd;
        });
    }

}.call(this));

!function(){

    issuemd.fn.sortUpdates = function(){
        this.each(function(issue){

            issue[0].updates.sort(function (a, b) {
                return (new Date(a.modified)) - (new Date(b.modified));
            });

        });
        return this;
    }

}();