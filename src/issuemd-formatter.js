'use strict';

module.exports = function (issuemd) {

    var mustache = require('mustache'),
        // TODO: switch to https://github.com/timmyomahony/pagedown/ to permit escaping like stack overflow
        marked = require('marked'),
        utils = require('./utils.js');

    var renderMarkdown = function (input) {
        return marked(input);
    };

    var renderMustache = function (template, data) {
        return mustache.render(template, data);
    };

    var json2html = function (issueJSObject, templateOverride) {

        var i;

        issueJSObject = utils.arrayWrap(issueJSObject);

        var issue = utils.copy(issueJSObject);

        for (var j = issue.length; j--;) {
            if (issue[j].original.body) {
                issue[j].original.body = marked(issue[j].original.body);
            } else {
                issue[j].original.body = '';
            }
            for (i = issue[j].updates.length; i--;) {
                if (issue[j].updates[i].body) {
                    issue[j].updates[i].body = marked(issue[j].updates[i].body);
                } else {
                    issue[j].updates[i].body = '';
                }
            }
        }

        var template = templateOverride ? templateOverride : [
            '{{#.}}',
            '<div class="issue">{{#original}}',
            '<div class="original">',
            '  <div class="head">',
            '    <h2>{{{title}}}</h2>',
            '    <ul class="original-attr">',
            '      <li><b>creator:</b> {{{creator}}}</li>',
            '      <li><b>created:</b> {{created}}</li>',
            '{{#meta}}      <li><b>{{key}}:</b> {{{value}}}</li>',
            '{{/meta}}    </ul>',
            '  </div>',
            '  <div class="body">',
            '    {{{body}}}  </div>',
            '</div>',
            '{{/original}}{{#updates}}',
            '<div class="updates">',
            '  <hr class="update-divider">',
            '  <div class="update">',
            '  <ul class="update-attr">',
            '    <li><b>type:</b> {{type}}</li>',
            '    <li><b>modified:</b> {{modified}}</li>',
            '    <li><b>modifier:</b> {{{modifier}}}</li>',
            '{{#meta}}    <li><b>{{key}}:</b> {{{value}}}</li>{{/meta}}  </ul>',
            '  <div class="update-body">',
            '    {{{body}}}  </div>',
            '  </div>',
            '{{/updates}}</div>',
            '</div>',
            '{{/.}}'
        ].join('\n');

        // TODO: read templates from files, not strings
        return renderMustache(template, issue);

    };

    var json2md = function (issueJSObject, templateOverride) {
        if (issueJSObject) {

            // use triple `{`s for title/value/body to retain special characters
            // why do I need two newlines inserted before the `---` when there is one already trailing the `body`?
            var template = templateOverride ? templateOverride : [
                '{{#.}}{{#original}}',
                '## {{{title}}}',
                '+ created: {{created}}',
                '+ creator: {{{creator}}}',
                '{{#meta}}',
                '+ {{key}}: {{{value}}}',
                '{{/meta}}',
                '',
                '{{{body}}}',
                '{{/original}}{{#updates}}',
                '',
                '---',
                '+ type: {{type}}',
                '+ modified: {{modified}}',
                '+ modifier: {{{modifier}}}',
                '{{#meta}}',
                '+ {{key}}: {{{value}}}',
                '{{/meta}}',
                '{{#body}}',
                '',
                '{{{.}}}',
                '{{/body}}',
                '{{/updates}}',
                '',
                '{{/.}}'
            ].join('\n');

            // TODO: figure out better way to handle trailing newlines after last issue
            return renderMustache(template, issueJSObject).trim();
        }
    };

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

    // TODO: better handling of the widest element
    var widest = 0;
    var cols = 80;
    var curtailed = function () {
        return function (str, render) {
            var content = render(str);
            return curtail(content + repeat(' ', (cols || 80) - 4 - content.length), (cols || 80) - 4);
        };
    };

    var body = function () {
        return function (str, render) {
            var content = render(str);
            return content + repeat(' ', (cols || 80) - 4 - content.length);
        };
    };

    var padleft = function () {
        return function (str, render) {
            return repeat(render(str), widest);
        };
    };

    var padright = function () {
        return function (str, render) {
            return repeat(render(str), (cols || 80) - widest - 7);
        };
    };

    var pad = function () {
        return function (str, render) {
            return repeat(render(str), (cols || 80) - 4);
        };
    };

    var pad6 = function () {
        return function (str, render) {
            return (render(str) + '      ').substr(0, 6);
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
            return render(str) + repeat(' ', (cols || 80) - 7 - widest - render(str).length);
        };
    };

    var json2summaryTable = function (issueJSObject, colsIn, templateOverride) {

        cols = colsIn || cols;

        var data = [];
        utils.each(issuemd(issueJSObject), function (issue) {
            var attr = issuemd(issue).attr();
            data.push({
                title: attr.title,
                creator: attr.creator,
                id: attr.id,
                assignee: attr.assignee,
                status: attr.status
            });
        });

        var template = templateOverride ? templateOverride : [
            '+-{{#util.pad}}-{{/util.pad                                                                            }}-+',
            '| {{#util.curtailed}}ID     Assignee     Status       Title{{/util.curtailed                           }} |',
            '+-{{#util.pad}}-{{/util.pad                                                                            }}-+',
            '{{#data}}',
            '| {{#util.curtailed}}{{#util.pad6}}{{{id}}}{{/util.pad6}} {{#util.pad12}}{{{assignee}}}{{/util.pad12}}' +
            ' {{#util.pad12}}{{{status}}}{{/util.pad12}} {{{title}}}{{/util.curtailed                           }} |',
            '{{/data}}',
            '+-{{#util.pad}}-{{/util.pad                                                                            }}-+',
        ].join('\n');

        return renderMustache(template, {
            util: {
                body: body,
                key: key,
                value: value,
                pad: pad,
                pad6: pad6,
                pad12: pad12,
                padleft: padleft,
                padright: padright,
                curtailed: curtailed
            },
            data: data
        });

    };

    var json2string = function (issueJSObject, colsIn, templateOverride) {

        cols = colsIn || cols;

        function splitLines(input) {
            var output = [];
            var lines = utils.wordwrap(input, ((cols || 80) - 4)).replace(/\n\n+/, '\n\n').split('\n');
            utils.each(lines, function (item) {
                if (item.length < ((cols || 80) - 4)) {
                    output.push(item);
                } else {
                    output = output.concat(item.match(new RegExp('.{1,' + ((cols || 80) - 4) + '}', 'g')));
                }
            });
            return output;
        }

        var template = templateOverride ? templateOverride : [
            '{{#data}}',
            '+-{{#util.pad}}-{{/util.pad                                                       }}-+',
            '{{#title}}',
            '| {{#util.body}}{{{.}}}{{/util.body                                               }} |',
            '{{/title}}',
            '+-{{#util.padleft}}-{{/util.padleft}}-+-{{#util.padright}}-{{/util.padright       }}-+',
            '| {{#util.key}}created{{/util.key  }} | {{#util.value}}{{{created}}}{{/util.value }} |',
            '| {{#util.key}}creator{{/util.key  }} | {{#util.value}}{{{creator}}}{{/util.value }} |',
            '{{#meta}}',
            '| {{#util.key}}{{{key}}}{{/util.key}} | {{#util.value}}{{{value}}}{{/util.value   }} |',
            '{{/meta}}',
            '| {{#util.pad}} {{/util.pad                                                       }} |',
            '{{#body}}',
            '| {{#util.body}}{{{.}}}{{/util.body                                               }} |',
            '{{/body}}',
            '{{#comments}}',
            '| {{#util.pad}} {{/util.pad                                                       }} |',
            '+-{{#util.padleft}}-{{/util.padleft}}-+-{{#util.padright}}-{{/util.padright       }}-+',
            '| {{#util.key}}type{{/util.key     }} | {{#util.value}}{{{type}}}{{/util.value    }} |',
            '| {{#util.key}}modified{{/util.key }} | {{#util.value}}{{{modified}}}{{/util.value}} |',
            '| {{#util.key}}modifier{{/util.key }} | {{#util.value}}{{{modifier}}}{{/util.value}} |',
            '| {{#util.pad}} {{/util.pad                                                       }} |',
            '{{#body}}',
            '| {{#util.body}}{{{.}}}{{/util.body                                               }} |',
            '{{/body}}',
            '{{/comments}}',
            '+-{{#util.pad}}-{{/util.pad                                                       }}-+',
            '{{/data}}'
        ].join('\n');

        if (issueJSObject) {
            var out = [],
                issues = issuemd(issueJSObject);
            utils.each(issues, function (issueJson) {

                var issue = issuemd(issueJson),
                    data = {
                        meta: [],
                        comments: []
                    };

                // TODO: better handling of ensuring minimum size of composite fields are met
                widest = 'signature'.length;
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

                utils.each(issue.comments(), function (value) {
                    value.body = splitLines(value.body);
                    data.comments.push(value);
                });

                out.push(renderMustache(template, {
                    util: {
                        body: body,
                        key: key,
                        value: value,
                        pad: pad,
                        padleft: padleft,
                        padright: padright
                    },
                    data: data
                }));

            });

            return out.join('\n');
        }

    };

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

};