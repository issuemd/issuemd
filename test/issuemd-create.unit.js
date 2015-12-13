// TODO: think about how to handle global `issuemd`
var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../dist/issuemd.js') : require('../src/issuemd-core.js');

var fixtures = require('./fixtures.js');

describe('issuemd create', function() {

  it('should create empty issues', function() {
    var timestring = '2015-06-27 19:42:56';
    expect(issuemd().attr({created:timestring})+'').toBe('');
    expect(issuemd({}).attr({created:timestring})+'').toBe(fixtures.empty_issue);
  });

});
