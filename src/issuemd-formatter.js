'use strict';

module.exports = (function () {

    var fs = require('fs');

    var mustache = require('mustache'),
        marked = require('marked');

    var utils = require('./utils.js'),
        methods = require('./issuemd-methods.js');

    var issuemdFormatter = {
        render: {
            markdown: renderMarkdown,
            mustache: renderMustache
        },
        md: json2md,
        html: json2html,
        string: json2string,
        summary: json2summaryTable
    };

    return {

        // formatter methods
        toString: collectionToString,
        summary: collectionSummary,
        md: collectionMd,
        html: collectionHtml

    };

    function json2summaryTable(issueJSObject, cols, templateOverride, colorisationFunctions) {

        cols = cols || 80;

        var data = [];

        utils.each(methods.main(null, issueJSObject), function (issue) {

            var attr = methods.attr(methods.main(null, issue));

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
            util: getFormatterUtils(0, cols, colorisationFunctions),
            data: data
        });

    }

    function json2string(issueJSObject, cols, templateOverride, colorisationFunctions) {

        cols = cols || 80;

        var splitLines = function (input) {

            var output = [];

            var lines = utils.wordwrap(input, (cols - 4)).replace(/\n\n+/, '\n\n').split('\n');

            utils.each(lines, function (item) {

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
                issues = methods.main(null, issueJSObject);

            utils.each(issues, function (issueJson) {

                var issue = methods.main(null, issueJson),
                    data = {
                        meta: [],
                        comments: []
                    };

                var widest = 'signature'.length;

                utils.each(issue.attr(), function (value, key) {
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

                utils.each(issue.updates(), function (value) {

                    value.body = splitLines(value.body);
                    data.comments.push(value);

                });

                out.push(renderMustache(template, {
                    util: getFormatterUtils(widest, cols, colorisationFunctions),
                    data: data
                }));

            });

            return out.join('\n');
        }

    }

    function getFormatterUtils(widest, cols, colorisationFunctions) {

        cols = cols || 80;

        function renderEcho(val, render) {
            return render(val);
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
            curtailed: curtailed,
            bkey: function () {
                return colorisationFunctions && colorisationFunctions.bkey || renderEcho;
            },
            bsep: function () {
                return colorisationFunctions && colorisationFunctions.bsep || renderEcho;
            },
            htext: function () {
                return colorisationFunctions && colorisationFunctions.htext || renderEcho;
            },
            hsep: function () {
                return colorisationFunctions && colorisationFunctions.hsep || renderEcho;
            },
            btext: function () {
                return colorisationFunctions && colorisationFunctions.btext || renderEcho;
            }
        };

        function curtailed() {

            return function (str, render) {
                var content = render(str);
                return curtail(content + repeat(' ', cols - 4 - content.length), cols - 4);
            };

        }

        function body() {

            return function (str, render) {
                var content = render(str);
                return content + repeat(' ', cols - 4 - content.length);
            };

        }

        function padleft() {

            return function (str, render) {
                return repeat(render(str), widest);
            };

        }

        function padright() {

            return function (str, render) {
                return repeat(render(str), cols - widest - 7);
            };

        }

        function pad12() {

            return function (str, render) {
                return (render(str) + '            ').substr(0, 12);
            };

        }

        function key() {

            return function (str, render) {
                var content = render(str);
                return content + repeat(' ', widest - content.length);
            };

        }

        function value() {

            return function (str, render) {
                return render(str) + repeat(' ', cols - 7 - widest - render(str).length);
            };

        }

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

    }

    function renderMarkdown(input) {
        return marked(input);
    }

    function renderMustache(template, data) {
        return mustache.render(template, data);
    }

    function json2html(issueJSObject, options) {

        var issues = utils.copy(issueJSObject);

        utils.each(issues, function (issue) {

            issue.original.body = issue.original.body ? marked(issue.original.body) : '';

            utils.each(issue.updates, function (update) {
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

    /**********************
     * collection methods *
     **********************/

    // requiring formatter/utils

    function collectionToString(collection, cols, templateOverride, colorisationFunctions) {
        return issuemdFormatter.string(collection.toArray(), cols, templateOverride, colorisationFunctions);
    }

    // return string summary table of collection
    function collectionSummary(collection, cols, templateOverride, colorisationFunctions) {
        return issuemdFormatter.summary(collection.toArray(), cols, templateOverride, colorisationFunctions);
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

})();