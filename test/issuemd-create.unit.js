// TODO: think about how to handle global `issuemd`
var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../dist/issuemd.js') : require('../src/issuemd-core.js');

var fixtures = require('./fixtures.js');

describe('issuemd create', function() {

  it('should create empty issues', function() {
    var timestring = '2015-06-27 19:42:56';
    expect(issuemd(1).attr({created:timestring})+'').toBe(fixtures.empty_issue);
    expect(issuemd(3).attr({created:timestring})+'').toBe(fixtures.empty_issue+'\n'+fixtures.empty_issue+'\n'+fixtures.empty_issue);
  });

});
