'use strict';

module.exports = (function () {

    return {
        getLastArgument: utilsGetLastArgument,
        copy: utilsCopy,
        type: utilsType,
        each: utilsEach,
        objectKeys: utilsObjectKeys,
        trim: utilsTrim,
        extend: utilsExtend,
        wordwrap: utilsWordwrap,
        map: utilsMap,
        reduce: utilsReduce
    };

    // return last argument if it is of targetType, otherwise return null
    function utilsGetLastArgument(args, targetType, defaultValue) {
        var last = args[args.length - 1];
        return utilsType(last) === targetType ? last : defaultValue || null;
    }

    function utilsCopy(input) {
        return JSON.parse(JSON.stringify(input));
    }

    function utilsType(me) {
        return Object.prototype.toString.call(me).split(/\W/)[2].toLowerCase();
    }

    function utilsEach(obj, iteratee, context) {

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

                if (iteratee(obj[i], i, obj) === false) {
                    break;
                }

            }

        } else {

            var keys = utilsObjectKeys(obj);

            for (i = 0, length = keys.length; i < length; i++) {

                if (iteratee(obj[keys[i]], keys[i], obj) === false) {
                    break;
                }

            }

        }

        return obj;

    }

    function utilsObjectKeys(obj) {

        var keys = [];

        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }

        return keys;
    }

    function utilsTrim(string) {

        return (string + '').replace(/(^\s+|\s+$)/g, '');

    }

    function utilsExtend(original, options) {

        for (var prop in options) {

            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                original[prop] = options[prop];
            }

        }

        return original;

    }

    // more full featured implementation: https://gist.github.com/billymoon/91db9ccada62028b50c7
    function utilsWordwrap(str, intWidth) {

        var result = [];

        utilsEach(str.split(/\r\n|\n|\r/), function (line) {

            line = line.replace(/^\s\b/, '');

            var endPosition, segment,
                out = '';

            while (line.length > intWidth) {

                segment = line.slice(0, intWidth + 1).match(/\S*(\s)?$/);

                if (!!segment[1]) {
                    endPosition = intWidth;
                } else if (segment.input.length - segment[0].length) {
                    endPosition = segment.input.length - segment[0].length;
                } else {
                    endPosition = intWidth;
                }

                out += line.slice(0, endPosition);

                line = line.slice(endPosition);

                if (!!line && line.length) {
                    out += '\n';
                }

            }

            result.push(out + line);

        });

        return result.join('\n');

    }

    // adapted from:
    //     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Map#Polyfill
    // ... and ...
    //     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill
    /* beautify preserve:start */
    function utilsMap(a,b,c){var d,e,f;if(null==a)throw new TypeError(" this is null or not defined");var g=Object(a),h=g.length>>>0;if("function"!=typeof b)throw new TypeError(b+" is not a function");for(arguments.length>1&&(d=c),e=new Array(h),f=0;h>f;){var i,j;f in g&&(i=g[f],j=b.call(d,i,f,g),e[f]=j),f++}return e} // jshint ignore:line
    function utilsReduce(a,b){if(null==a)throw new TypeError("Array.prototype.reduce called on null or undefined");if("function"!=typeof b)throw new TypeError(b+" is not a function");var f,c=Object(a),d=c.length>>>0,e=0;if(3==arguments.length)f=arguments[2];else{for(;d>e&&!(e in c);)e++;if(e>=d)throw new TypeError("Reduce of empty array with no initial value");f=c[e++]}for(;d>e;e++)e in c&&(f=b(f,c[e],e,c));return f} // jshint ignore:line
    /* beautify preserve:end */

}());