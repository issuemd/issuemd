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
                issue[j].updates[i].body = marked(issue[j].updates[i].body);
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

        function repeat(char, qty){
            var out = '';
            for(var i=0;i<qty;i++){
                out += char;
            }
            return out;
        }

        function splitLines(input){
            var output = [];
            input.replace(new RegExp('(\n)|(.{0,'+((cols||80)-4)+'})(?:[ \n]|$)','g'),function(discard,n,o){ output.push(n?'':o); });
            // TODO: should not need to pop - but why is there always an empty string at the end..?
            output.pop();
            return output;
        }

        var template = [ // ┬
            "{{#data}}",

            "┌─{{#util.pad}}─{{/util.pad                                                   }}─┐",
            "{{#title}}",
            "│ {{#util.body}}{{{.}}}{{/util.body                                           }} │",
            "{{/title}}",
            "├─{{#util.padleft}}─{{/util.padleft}}─┬─{{#util.padright}}─{{/util.padright   }}─┤",
            "│ {{#util.key}}created{{/util.key  }} │ {{#util.val}}{{{created}}}{{/util.val }} │",
            "│ {{#util.key}}creator{{/util.key  }} │ {{#util.val}}{{{creator}}}{{/util.val }} │",
            "{{#meta}}",
            "│ {{#util.key}}{{{key}}}{{/util.key}} │ {{#util.val}}{{{val}}}{{/util.val     }} │",
            "{{/meta}}",
            "│ {{#util.pad}} {{/util.pad                                                   }} │",
            "{{#body}}",
            "│ {{#util.body}}{{{.}}}{{/util.body                                           }} │",
            "{{/body}}",
            "{{#comments}}",
            "│ {{#util.pad}} {{/util.pad                                                   }} │",
            "├─{{#util.padleft}}─{{/util.padleft}}─┬─{{#util.padright}}─{{/util.padright   }}─┤",
            "│ {{#util.key}}modified{{/util.key }} │ {{#util.val}}{{{modified}}}{{/util.val}} │",
            "│ {{#util.key}}modifier{{/util.key }} │ {{#util.val}}{{{modifier}}}{{/util.val}} │",
            "{{#body}}",
            "│ {{#util.pad}} {{/util.pad                                                   }} │",
            "│ {{#util.body}}{{{.}}}{{/util.body                                           }} │",
            "{{/body}}",
            "{{/comments}}",
            "└─{{#util.pad}}─{{/util.pad                                                   }}─┘",

            "{{/data}}"
        ].join("\n");

        var body = function(){ return function(str, render){
            var content = render(str);
            return content+repeat(' ',(cols||80)-4-content.length);
        };};

        var padleft = function(){ return function(str, render){
            return repeat(render(str), widest);
        };};

        var padright = function(){ return function(str, render){
            return repeat(render(str), (cols||80)-widest-7);
        };};

        var pad = function(){ return function(str, render){
            return repeat(render(str), (cols||80)-4);
        };};

        // TODO: better handling of the widest element
        var widest=0;
        var key = function(){ return function(str, render){
            var content = render(str);
            return content+repeat(' ',widest-content.length);
        };};
        var val = function(){ return function(str, render){
            return render(str)+repeat(' ',(cols||80)-7-widest-render(str).length);
        };};

        if (issueJSObject) {
            var out = [], issues = issuemd(issueJSObject);
            issues.each(function(issueJson){

                var issue = issuemd(issueJson), data = {meta:[],comments:[]};

                widest=0;
                issuemd.utils.each(issue.attr(), function(val, key){
                    if(key === 'title' || key === 'body'){
                        data[key] = splitLines(val);
                    } else if(key === 'created' || key == 'creator'){
                        data[key] = val;
                        if(key.length > widest){ widest = key.length; }
                    } else {
                        data.meta.push({key:key,val:val});
                        if(key.length > widest){ widest = key.length; }
                    }
                });

                issuemd.utils.each(issue.comments(), function(val){
                    val.body = splitLines(val.body);
                    data.comments.push(val);
                });

                out.push(mustache.render(template, {util:{body:body,key:key,val:val,pad:pad,padleft:padleft,padright:padright},data:data}));
            });

            return out.join('\n');
        }

    };

    return {
        md: json2md,
        html: json2html,
        string: json2string
    };

}();