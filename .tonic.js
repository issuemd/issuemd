var issuemd = require('issuemd');

var issues = issuemd([{
    creator: 'Some Guy',
    title: 'Sprocket problem',
    body: 'There is a problem in the sprocket decontrabulator'
}, {
    creator: 'Some Guy',
    title: 'Resticular interface issue',
    body: 'The resticular interface is contrictionally fragressalot'
}]);

issues.eq(1).update({
    modifier: 'Another Guy',
    type: 'comment',
    body: 'does not look so bad to me.'
});

console.log(issues.html());
