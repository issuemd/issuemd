var fixtures = require('./fixtures.js');

describe("issuemd parser", function() {

  var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../dist/issuemd.js') : require('../src/issuemd-core.js');

  it('should parse simple markdown issue', function(){

    var issue = issuemd(fixtures.simple_issue);

    expect(issue.length).toBe(1);
    expect(JSON.stringify(issue[0])).toBe(fixtures.simple_issue_json);

  });

  it('should parse markdown issue with meta', function(){

    var issue = issuemd(fixtures.simple_issue_with_meta);

    expect(issue.length).toBe(1);
    expect(JSON.stringify(issue[0])).toBe(fixtures.simple_issue_with_meta_json);

  });

  it('should reproduce markdown after parsing', function(){

    var issue = issuemd(fixtures.simple_issue_with_meta);
    expect(issue.md()).toBe(fixtures.simple_issue_with_meta);

  });

  it('should reproduce markdown after parsing malformed input', function(){

    var issue = issuemd(fixtures.simple_issue_with_meta_malformed);
    expect(issue.md()).toBe(fixtures.simple_issue_with_meta);

  });

  it('should parse markdown issue with comments', function(){

    var issue = issuemd(fixtures.issue_with_comments);

    expect(issue.length).toBe(1);
    expect(JSON.stringify(issue[0])).toBe(fixtures.issue_with_comments_json);

  });

});