module.exports = function () {

    var mustache = require('mustache'),
        // TODO: switch to https://github.com/timmyomahony/pagedown/ to permit escaping like stack overflow
        marked = require('marked'),
        utils = require('./utils.js');

    var json2html = function (issueJSObject) {

        issueJSObject = utils.arrayWrap(issueJSObject);

        var issue = utils.copy(issueJSObject);

        for(var j = issue.length; j--;){
            issue[j].original.body = marked(issue[j].original.body);
            for(i = issue[j].updates.length;i--;){
                issue[j].updates[i].body = marked(issue[j].updates[i].body)
            }            
        }

        // TODO: read templates from files, not strings
        return mustache.render([
                "{{#.}}{{#original}}",
                "<div class='issue'>",
                "  <h2>{{{title}}}</h2>",
                "  <ul class='original-attr'>",
                "    <li><b>creator:</b> {{{creator}}}</li>",
                "    <li><b>created:</b> {{created}}</li>",
                "{{#meta}}    <li><b>{{key}}:</b> {{{val}}}</li>",
                "{{/meta}}  </ul>",
                "  <div class='original-body'>",
                "    {{{body}}}  </div>",
                "{{/original}}{{#updates}}",
                "  <hr>",
                "  <ul>",
                "    <li><b>modified:</b> {{modified}}</li>",
                "    <li><b>modifier:</b> {{{modifier}}}</li>",
                "{{#meta}}    <li><b>{{key}}:</b> {{{val}}}</li>{{/meta}}  </ul>",
                "  <div class='update-body'>",
                "    {{{body}}}  </div>{{/updates}}",
                "</div>",
                "{{/.}}"
            ].join("\n"), issue);

    };

    var json2md = function (issueJSObject) {
        if (issueJSObject) {

            // use triple `{`s for title/value/body to retain special characters
            // why do I need two newlines inserted before the `---` when there is one already trailing the `body`?
            var template = [
                "{{#.}}{{#original}}",
                "## {{{title}}}",
                "+ created: {{created}}",
                "+ creator: {{{creator}}}",
                "{{#meta}}",
                "+ {{key}}: {{{val}}}",
                "{{/meta}}",
                "",
                "{{{body}}}",
                "{{/original}}{{#updates}}",
                "",
                "---",
                "+ modified: {{modified}}",
                "+ modifier: {{{modifier}}}",
                "{{#meta}}",
                "+ {{key}}: {{{val}}}",
                "{{/meta}}",
                "{{#body}}",
                "",
                "{{{.}}}",
                "{{/body}}",
                "{{/updates}}",
                "",
                "{{/.}}"
            ].join("\n");

            // TODO: figure out better way to handle trailing newlines after last issue
            return mustache.render(template, issueJSObject).trim();
        }

    };

    return {
        md: json2md,
        html: json2html
    }

}();