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

    var json2string = function (issueJSObject, cols) {

        // repeat helper function
        function r(char, qty){
            var out = '';
            for(var i=0;i<qty;i++){
                out += char;
            }
            return out;
        }

        function splitLines(input){
            var output = [];
            input.replace(new RegExp('(\n)|(.{0,'+(w-4)+'})(?:[ \n]|$)','g'),function(discard, n,o){ output.push(n?"":o); });
            return output;
        }

        if (issueJSObject) {

            var w = cols || 80, widest;

            // uses width and widest
            function metaLine(left, key, middle, val, right, pad){
                return left+key+r(pad||' ',widest-key.length)+middle+val+r(pad||' ',w-(left+middle+right).length-widest-val.length)+right;
            }

            // uses width and widest
            function bodyLine(left, content, right, pad){
                return left+content+r(pad||' ',w-(left+right).length-content.length)+right;
            }

            var templates = [];

            issuemd(issueJSObject).each(function(issue){

                widest = 0;

                issuemd.utils.each(issuemd(issue).attr(), function(val, key){
                    widest = widest > key.length ? widest : key.length;
                });
                
                // TODO: check if this only works because body is shorter than modifier etc...
                issuemd.utils.each(issueJSObject[0].updates, function(update){
                    issuemd.utils.each(update, function(val, key){
                        widest = widest > key.length ? widest : key.length;
                    });
                });
                
                var table = [
                    bodyLine('┌─', '', '─┐', '─'),
                    bodyLine('│ ', issue.original.title, ' │'),
                    metaLine('├─', '', '─┬─', '', '─┤', '─'),
                    metaLine('│ ', 'created', ' │ ', issue.original.created, ' │'),
                    metaLine('│ ', 'creator', ' │ ', issue.original.creator, ' │')
                ];

                issuemd.utils.each(issue.original.meta, function(item){
                    table.push(metaLine('│ ', item.key, ' │ ', item.val, ' │'));
                });

                table.push(bodyLine('│ ', '', ' │'));

                var lines = splitLines(issue.original.body);
                issuemd.utils.each(lines, function(line){
                    table.push(bodyLine('│ ', line, ' │'));
                });

                issuemd.utils.each(issue.updates, function(update){
                    table.push(metaLine('├─', '', '─┬─', '', '─┤', '─')),
                    table.push(metaLine('│ ', 'modifier', ' │ ', update.modifier, ' │')),
                    table.push(metaLine('│ ', 'modified', ' │ ', update.modified, ' │')),
                    issuemd.utils.each(update.meta, function(item){
                        table.push(metaLine('│ ', item.key, ' │ ', item.val, ' │'));
                    });
                    if(update.body){
                        table.push(bodyLine('│ ', '', ' │'));
                        var lines = splitLines(update.body);
                        issuemd.utils.each(lines, function(line){
                            table.push(bodyLine('│ ', line, ' │'));
                        });                        
                    }

                });
                
                table.push(bodyLine('└─', '', '─┘', '─'));

                templates.push(table.join('\n'));

            });

            // TODO: figure out better way to handle trailing newlines after last issue
            return templates.join('\n');
        }

    };

    return {
        md: json2md,
        html: json2html,
        string: json2string
    }

}();