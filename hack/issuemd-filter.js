/**
 * issuemd.fn.filter
 * 
 * var issues = issuemd("## just an issue\n+ created: 2015-05-04 14:45:15\n+ creator: Billy\n\nreally, this is just an issue\n\n---\n+ modified: 2015-05-04 14:45:15\n+ modifier: Billy\n\nwow - that is awesome\n\n## just another issue\n+ created: 2015-05-04 14:45:15\n+ creator: Billy\n\nreally, this is just another issue\n\n## totally different issue\n+ created: 2015-05-04 14:45:15\n+ creator: Luka\n\nreally, this is a totally different issue");
 * issues.filter('title', 'just an issue');
 * issues.filter('title', /an.+issue/);
 * issues.filter('title', ['just another issue','just an issue']);
 * issues.filter('title', [/an.+issue/,'totally different issue']);
 * issues.filter(function(issue){ return issue.attr('creator') === 'Luka' });
*/
!function(){

    'use strict';

    function filterByFunction(filter){
        var out = issuemd();
        this.each(function(item){
            if(filter(issuemd(item))){
                out.merge(item);
            }
        });
        return out;
    }

    function filterByAttr(key, val_in){
        var vals = issuemd.utils.typeof(val_in) === 'array' ? val_in : [val_in];
        return filterByFunction.call(this, function(issue){
            var attr_val = issue.attr(key), match = false;
            issuemd.utils.each(vals, function(val){
                if(!match && (issuemd.utils.typeof(val) === 'regexp' && val.test(attr_val)) || attr_val === val){
                    match = true;
                    return match;                        
                }
            });
            return match;
        });
    };

    issuemd.fn.filter = function(first, second){
        /* explanation is here */
        return second ? filterByAttr.call(this, first, second): filterByFunction.call(this, first);
    };

}();