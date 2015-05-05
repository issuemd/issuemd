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

            var w = cols || 80;
            var templates = [];

            issuemd(issueJSObject).each(function(issue){

                var widest = 0;

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
                    '┌' + r('─',w-2) + '┐',
                    '│ '+issue.original.title+r(' ',w-4-issue.original.title.length)+' │',
                    '├'+r('─',widest+2)+'┬'+r('─',w-5-widest)+'┤',
                    '│ created'+r(' ',widest-7)+' │ '+issue.original.created+r(' ',w-7-widest-issue.original.created.length)+' │',
                    '│ creator'+r(' ',widest-7)+' │ '+issue.original.creator+r(' ',w-7-widest-issue.original.creator.length)+' │'
                ];

                issuemd.utils.each(issue.original.meta, function(item){
                    table.push('│ '+item.key+r(' ',widest-item.key.length)+' │ '+item.val+r(' ',w-7-item.val.length-widest)+' │');
                });
                
                table.push('│ ' + r(' ',w-4) + ' │');
                var lines = splitLines(issue.original.body);
                issuemd.utils.each(lines, function(line){
                    table.push('│ ' + line + r(' ',w-4-line.length) + ' │');                
                });

                issuemd.utils.each(issue.updates, function(update){
                    table.push('├'+r('─',widest+2)+'┬'+r('─',w-5-widest)+'┤');
                    table.push('│ modifier'+r(' ',widest-8)+' │ '+update.modifier+r(' ',w-7-update.modifier.length-widest)+' │');
                    table.push('│ modified'+r(' ',widest-8)+' │ '+update.modified+r(' ',w-7-update.modified.length-widest)+' │');
                    issuemd.utils.each(update.meta, function(item){
                        table.push('│ '+item.key+r(' ',widest-item.key.length)+' │ '+item.val+r(' ',w-7-item.val.length-widest)+' │');
                    });
                    if(update.body){
                        table.push('│ ' + r(' ',w-4) + ' │');
                        var lines = splitLines(update.body);
                        issuemd.utils.each(lines, function(line){
                            table.push('│ ' + line + r(' ',w-4-line.length) + ' │');                
                        });                        
                    }

                });
                
                table.push('└' + r('─',w-2) + '┘');

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