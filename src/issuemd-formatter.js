module.exports = function () {

    var mustache = require('../vendor/mustache'),
        hogan = require('../vendor/hogan'),
        // TODO: switch to https://github.com/timmyomahony/pagedown/ to permit escaping like stack overflow
        marked = require('../vendor/marked'),
        utils = require('./utils.js');

    var render_markdown = function(input){
        return marked(input);
    };

    var render_mustache = function(template, data){
        console.log(data)
        // console.log('>>>>>>>')
        // console.log(hogan.compile(template).render(data))
        // console.log(template,data)
        // console.log('>>>>>>>')
        // return hogan.compile(template).render(data);
        if(utils.typeof(data)){
          return hogan.compile('{{#arr}}'+template+'{{/arr}}').render({arr:data});
        } else {
          return hogan.compile(template).render(data);
        }
    };

    var json2html = function (issueJSObject, template_override) {

        issueJSObject = utils.arrayWrap(issueJSObject);

        var issue = utils.copy(issueJSObject);

        for(var j = issue.length; j--;){
            issue[j].original.body = marked(issue[j].original.body);
            for(i = issue[j].updates.length;i--;){
                issue[j].updates[i].body = marked(issue[j].updates[i].body);
            }
        }

        var template = template_override ? template_override : [
            "{{#.}}",
            "<div class='issue'>{{#original}}",
            "<div class='original'>",
            "  <div class='head'>",
            "    <h2>{{{title}}}</h2>",
            "    <ul class='original-attr'>",
            "      <li><b>creator:</b> {{{creator}}}</li>",
            "      <li><b>created:</b> {{created}}</li>",
            "{{#meta}}      <li><b>{{key}}:</b> {{{val}}}</li>",
            "{{/meta}}    </ul>",
            "  </div>",
            "  <div class='body'>",
            "    {{{body}}}  </div>",
            "</div>",
            "{{/original}}{{#updates}}",
            "<div class='updates'>",
            "  <hr class='update-divider'>",
            "  <div class='update'>",
            "  <ul class='update-attr'>",
            "    <li><b>modified:</b> {{modified}}</li>",
            "    <li><b>modifier:</b> {{{modifier}}}</li>",
            "{{#meta}}    <li><b>{{key}}:</b> {{{val}}}</li>{{/meta}}  </ul>",
            "  <div class='update-body'>",
            "    {{{body}}}  </div>",
            "  </div>",
            "{{/updates}}</div>",
            "</div>",
            "{{/.}}"
        ].join("\n");

        // TODO: read templates from files, not strings
        return render_mustache(template, issue);

    };

    var json2md = function (issueJSObject, template_override) {
        if (issueJSObject) {

            // use triple `{`s for title/value/body to retain special characters
            // why do I need two newlines inserted before the `---` when there is one already trailing the `body`?
            var template = template_override ? template_override : [
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
            return render_mustache(template, issueJSObject).trim();
        }
    };

    function repeat(char, qty){
        var out = '';
        for(var i=0;i<qty;i++){
            out += char;
        }
        return out;
    }

    function curtail(input, width){
        return input.length > width ? input.slice(0, width-3) + '...' : input;
    }

    // TODO: better handling of the widest element
    var widest=0;
    var cols=80;
    var curtailed = function(){ return function(str, render){
        var content = render(str);
        return curtail(content+repeat(' ',(cols||80)-4-content.length), (cols||80)-4);
    };};

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

    var pad6 = function(){ return function(str, render){
        return (render(str)+'      ').substr(0,6);
    };};

    var pad12 = function(){ return function(str, render){
        return (render(str)+'            ').substr(0,12);
    };};

    var key = function(){ return function(str, render){
        var content = render(str);
        return content+repeat(' ',widest-content.length);
    };};
    var val = function(){ return function(str, render){
        return render(str)+repeat(' ',(cols||80)-7-widest-render(str).length);
    };};

    var json2summaryTable = function (issueJSObject, cols_in, template_override) {

        cols = cols_in || cols;

        var data = [];
        issuemd(issueJSObject).each(function(issue){
            var attr = issuemd(issue).attr();
            data.push({
                title: attr.title,
                creator: attr.creator,
                id: attr.id,
                assignee: attr.assignee,
                status: attr.status
            });
        });

        var template = template_override ? template_override : [
            '+-{{#util.pad}}-{{/util.pad}}-+',
            '| {{#util.curtailed}}ID     Assignee     Status       Title{{/util.curtailed}} |',
            '+-{{#util.pad}}-{{/util.pad}}-+',
            '{{#data}}',
            '| {{#util.curtailed}}{{#util.pad6}}{{{id}}}{{/util.pad6}} {{#util.pad12}}{{{assignee}}}{{/util.pad12}} {{#util.pad12}}{{{status}}}{{/util.pad12}} {{{title}}}{{/util.curtailed}} |',
            '{{/data}}',
            '+-{{#util.pad}}-{{/util.pad}}-+',
        ].join('\n');

        return render_mustache(template, {util:{body:body,key:key,val:val,pad:pad,pad6:pad6,pad12:pad12,padleft:padleft,padright:padright,curtailed:curtailed},data:data});

    };

    var json2string = function (issueJSObject, cols_in, template_override) {

        cols = cols_in || cols;

        function splitLines(input){
            var output = [];
            var lines = utils.wordwrap(input, ((cols||80)-4)).replace(/\n\n+/,'\n\n').split('\n');
            utils.each(lines, function(item, key){
                if(item.length < ((cols||80)-4)){
                    output.push(item);
                } else {
                    output = output.concat(item.match(new RegExp('.{1,'+((cols||80)-4)+'}','g')));
                }
            });
            return output;
        }

        var template = template_override ? template_override : [
            "{{#data}}",

            "+-{{#util.pad}}-{{/util.pad                                                   }}-+",
            "{{#title}}",
            "| {{#util.body}}{{{.}}}{{/util.body                                           }} |",
            "{{/title}}",
            "+-{{#util.padleft}}-{{/util.padleft}}-+-{{#util.padright}}-{{/util.padright   }}-+",
            "| {{#util.key}}created{{/util.key  }} | {{#util.val}}{{{created}}}{{/util.val }} |",
            "| {{#util.key}}creator{{/util.key  }} | {{#util.val}}{{{creator}}}{{/util.val }} |",
            "{{#meta}}",
            "| {{#util.key}}{{{key}}}{{/util.key}} | {{#util.val}}{{{val}}}{{/util.val     }} |",
            "{{/meta}}",
            "| {{#util.pad}} {{/util.pad                                                   }} |",
            "{{#body}}",
            "| {{#util.body}}{{{.}}}{{/util.body                                           }} |",
            "{{/body}}",
            "{{#comments}}",
            "| {{#util.pad}} {{/util.pad                                                   }} |",
            "+-{{#util.padleft}}-{{/util.padleft}}-+-{{#util.padright}}-{{/util.padright   }}-+",
            "| {{#util.key}}modified{{/util.key }} | {{#util.val}}{{{modified}}}{{/util.val}} |",
            "| {{#util.key}}modifier{{/util.key }} | {{#util.val}}{{{modifier}}}{{/util.val}} |",
            "{{#body}}",
            "| {{#util.pad}} {{/util.pad                                                   }} |",
            "| {{#util.body}}{{{.}}}{{/util.body                                           }} |",
            "{{/body}}",
            "{{/comments}}",
            "+-{{#util.pad}}-{{/util.pad                                                   }}-+",

            "{{/data}}"
        ].join("\n");

        if (issueJSObject) {
            var out = [], issues = issuemd(issueJSObject);
            issues.each(function(issueJson){

                var issue = issuemd(issueJson), data = {meta:[],comments:[]};

                widest=0;
                utils.each(issue.attr(), function(val, key){
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

                utils.each(issue.comments(), function(val){
                    val.body = splitLines(val.body);
                    data.comments.push(val);
                });

                out.push(render_mustache(template, {util:{body:body,key:key,val:val,pad:pad,padleft:padleft,padright:padright},data:data}));
            });

            return out.join('\n');
        }

    };

    return {
        render: {
          markdown: render_markdown,
          mustache: render_mustache
        },
        md: json2md,
        html: json2html,
        string: json2string,
        summary: json2summaryTable
    };

}();
