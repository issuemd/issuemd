// module layout inspired by underscore
;(function(){

    var utils = require("./utils.js");

    var root = this;

    // main entry point for issuemd api
    // jquery like chained api inspired by: http://blog.buymeasoda.com/creating-a-jquery-like-chaining-api/
    // TODO: handle creation of `$i` shortcut better, perhaps adding `$i.noConflict()` function
    $i = issuemd = function(input) {
        return new Issuemd(input);
    };

    // get the core components in place
    issuemd.parser = require('../dist/parser.js');
    issuemd.formatter = require('./issuemd-formatter.js');
    issuemd.merge = require('./issuemd-merger.js');
    issuemd.utils = utils;

    // issuemd constructor function
    var Issuemd = function(input) {

        // if there is more than one argument, treat it as an array and re-wrap
        if(arguments.length > 1){
            return issuemd(arguments);
        }

        // if collection passed in, just return it without further ado
        if (input instanceof issuemd.fn.constructor) {
            return input;
        }

        // if there is no input, return a collection with no issues
        if(input == undefined){
            return this;
        }

        // if a number is passed, return collection of that many blank issues
        // useful for building issues using chained api
        if(typeof input === "number"){
            for(var i = input; i--;){
                this.push(utils.makeIssue());
            }
            return this;
        }

        // assume input is issue like, and try to return it as a collection
        try {
            var arr = issue_array_from_anything(input);
            // TODO: use merge here, instead of blindly pushing new issues
            for(var i=0; i<arr.length; i++){
                this.merge(arr[i]);
            }
        } catch(e) {
            console.log(e.message)
        }

        return this;

    };

    // API Methods
    // extendable by adding to `issuemd.fn` akin to jQuery plugins
    issuemd.fn = Issuemd.prototype = {

        // don't use default object constructor so we can identify collections later on
        constructor: Issuemd,

        // enable collections to behave like an Array
        length: 0,
        toArray: function() {
            return [].slice.call( this );
        },
        push: [].push,
        sort: [].sort,
        splice: [].splice,
        pop: [].pop,

        // serialize issue data object into issuemd style JSON
        toJSON: function(){
            var ret = [];
            for(var i=0; i<this.length; i++){
                ret.push(this[i]);
            }
            return ret;
        },

        // when coerced into string, return issue collection as md
        toString: function(cols){
            return issuemd.formatter.string(this.toArray(), cols);
        },

        // return MD render of all ussues
        // TODO: accept md and merge into collection - perhaps call from main entry point
        md: function(input) {
            if(typeof input === "string"){
                this.merge(input);
            } else {
                return issuemd.formatter.md(this.toArray());
            }
        },

        // return HTML render of all issues
        html: function() {
            return issuemd.formatter.html(this.toArray());
        },

        // return a deep copy of a collection - breaking references
        clone: function(){
            return issuemd(utils.copy(this.toArray()));
        },

        // return new collection with *reference* to issue at `index` of original collection
        eq: function(index){
            var copy = issuemd(1);
            copy[0] = this[index];
            return copy;
        },

        // loops over each issue - like underscore's each
        each: function(func){
            utils.each(this, func);
            return this;
        },

        // remove the issues specified by `input` (accepts array, or one or more arguments specified indices to be deleted)
        remove: function(input){

            // set indices to input if it is an array, or arguments array (by converting from arguments array like object)
            var indices = issuemd.utils.typeof(input) === "array" ? input : Array.prototype.slice.call(arguments);

            // get reference to current context (issue collection) for use in callback
            var that = this;

            // sort and reverse indices so that elements are removed from back, and don't change position of next one to remove
            indices.sort().reverse();

            issuemd.utils.each(indices, function(index){
                that.splice(index, 1);
            });

        },

        // modifies all issues with modified/modifier (defaults to now if null) and optional attrs object and/or comment string
        update: function(/* issue_update_object | modified, modifier[, (meta_array|meta_hash)][, body] */){
            var args;
            if (arguments.length === 1) {
                args = arguments[0];
            } else {
                args = {
                    modified: arguments[0],
                    modifier: arguments[1]
                };
                if(arguments.length === 3 && typeof arguments[2] === 'string') {
                    args.body = arguments[2];
                } else {
                    // if the `meta` argument is not an object assume it's an array akin to issue updates meta array
                    if (utils.typeof(arguments[2]) !== "object") {
                        args.meta = arguments[2];
                    } else {
                        // else assume it is a key/value pair hash, and map it to array akin to issue updates meta array
                        args.meta = issuemd.utils.mapToArray(arguments[2], function (val, key) {
                            return {key: key, val: val};
                        });
                    }
                    // and set the body
                    args.body = arguments[3];
                }
            }
            // TODO: should default falsy modified value to `now`
            this.each(function(issue){
                issue.updates.push(args);
            });
            return this;
        },

        // TODO: fix this - logic is all wrong - needs to accept any issue-ish things, and return existing issue with intput merged/concatentated into collection
        // TODO: should this function validate conflicts on original object?
        // merges one or more issues from issuePOJO or issueMD into issues
        merge: function(input){

            var arr = issue_array_from_anything(input);

            var hashes = this.attr("hash", true);

            var that = this;
            utils.each(arr, function(issue){
                var merged = false;
                for(var i = 0; i < issue.original.meta.length; i++){
                    var idx = utils.indexOf(hashes, issue.original.meta[i].val);
                    if(issue.original.meta[i].key === "hash" && idx != -1){
                        issuemd.merge(that[idx], issue);
                        merged = true;
                    }
                }
                if (!merged){
                    that.push(issue);
                }
            });

            return this;

        },

        // without args or with boolean, returns raw attr hash from first issue or array of hashes from all issues (includes title/created/creator)
        // with key specified, returns matching value from first issue
        // with key/val, or key/val hash specified, updates all issues with key/val attrs
        attr: function(key, val){
            // creates or overwrites existing meta item with new key/val
            var updateMeta = function(obj){
                this.each(function(issue){
                    for(key in obj){
                        var val = obj[key];
                        if(key === "title" || key === "created" || key === "creator" || key === "body"){
                            issue.original[key] = val;
                        } else {
                            var hit = false;
                            // check all original meta values
                            issuemd.utils.each(issue.original.meta, function(meta){
                                if(meta.key === key){
                                    meta.val = val;
                                    hit = true;
                                }
                            });
                            if(!hit){
                                issue.original.meta.push({ key: key, val: val });
                            }
                        }
                    }
                })
            };
            // if we have a key and val, update issue meta
            if(typeof key === "string" && typeof val === "string"){
                var obj = {};
                obj[key] = val;
                updateMeta.call(this, obj);
                return this;
            // if object passed in, update issue meta with object
            } else if(utils.isObject(key)){
                updateMeta.call(this, key);
                return this;
            // if a key string is passed in, get related value from first issue
            } else if(typeof key === "string"){
                if(val){
                    // return array of values for specified key from all issues
                    var arr = [];
                    utils.each(this.attr(val), function(issue){
                        arr.push(issue[key]);
                    });
                    return arr;
                } else {
                    // return value for specified key from first issue
                    return this.attr()[key];
                }
            } else if (arguments.length === 0 || typeof key === "boolean") {
                // returns hash of attrs of first issue or array of hashes for all issues if boolean is true
                var arr = [];
                var how_many = key ? this.length : 1;
                for(var i = 0; i < how_many; i++){
                    var out = {
                        title: this[i].original.title,
                        created: this[i].original.created,
                        creator: this[i].original.creator,
                        // TODO: should this return body?
                        body: this[i].original.body
                    };
                    utils.each(this[i].original.meta, function(meta){
                        out[meta.key] = meta.val;
                    });
                    utils.each(this[i].updates, function(update){
                        utils.each(update.meta, function(meta){
                            out[meta.key] = meta.val;
                        });
                    });
                    arr.push(out);
                }
                return key ? arr : arr[0];
            }
        },
        // TODO: see how much of this code can be merged with attr and proxied through there
        // same as `.attr` but only for meta (i.e. without title/created/creator/body)
        meta: function(key, val){
            if(utils.isObject(key) || (typeof key === "string" && typeof val === "string")){
                return this.attr(key, val);
            } else if(typeof key === "string"){
                // TODO: move get meta from `.attr` method to here, let `.attr` call this, and augment it
                return this.attr(key, val);
            } else if (arguments.length === 0 || typeof key === "boolean"){
                var arr = [];
                var how_many = key ? this.length : 1;
                for(var i = 0; i < how_many; i++){
                    var out = {};
                    utils.each(this[i].meta, function(meta){
                        out[meta.key] = meta.val;
                    });
                    arr.push(out);
                }
                return key ? arr : arr[0];
            }
        },
        comments: function(){
            if(this.length > 1){
                issuemd.utils.debug.warn('`issuemd.fn.comments` is meant to operate on single issue, but got more than one, so will ignore others after first.');
            }
            if(this[0]){
                var out = [];
                issuemd.utils.each(this[0].updates, function(update){
                    if(issuemd.utils.typeof(update.body) === 'string' && update.body.length){
                        out.push(utils.copy(update));
                    }
                });
                return out;
            }
        }
    };

    // helper function accepts any issue like things, and returns an array of issue data
    var issue_array_from_anything = function(input){
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
            return issuemd.parser.parse(input);
        }
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
