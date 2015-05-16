// TODO: think about how to handle global `issuemd`
var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../dist/issuemd.js') : require('../src/issuemd.js');

describe("issuemd create", function() {

  var empty_issue = [
  '+------------------------------------------------------------------------------+',
  '|                                                                              |',
  '+---------+--------------------------------------------------------------------+',
  '| created | {{created_at_time}}                                                |',
  '| creator |                                                                    |',
  '|                                                                              |',
  '|                                                                              |',
  '+------------------------------------------------------------------------------+',
  ''
  ].join('\n');

  it("should create empty issues", function() {
    var now = (new Date()).toISOString().substr(0,19).replace('T',' ');
    var empty_issue_now = empty_issue.replace('{{created_at_time}}', now);
    expect(issuemd(1).attr({created:now})+'').toBe(empty_issue_now);
    expect(issuemd(3).attr({created:now})+'').toBe(empty_issue_now+'\n'+empty_issue_now+'\n'+empty_issue_now);
  });

});