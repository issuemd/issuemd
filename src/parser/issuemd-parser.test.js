/* global describe, it */

const assert = require('assert');

const issuemd = require('../issuemd');
const fixtures = require('../../test/fixtures');

describe('issuemd parser', () => {
  it('should parse simple markdown issue', () => {
    const issue = issuemd(fixtures.simpleIssue);

    assert.equal(issue.length, 1);
    assert.equal(JSON.stringify(issue[0]), fixtures.simpleIssueJson);
  });

  it('should parse markdown issue with meta', () => {
    const issue = issuemd(fixtures.simpleIssueWithMeta);

    assert.equal(issue.length, 1);
    assert.equal(JSON.stringify(issue[0]), fixtures.simpleIssueWithMetaJson);
  });

  it('should reproduce markdown after parsing', () => {
    const issue = issuemd(fixtures.simpleIssueWithMeta);

    assert.equal(issue.md(), fixtures.simpleIssueWithMeta);
  });

  it('should reproduce markdown after parsing malformed input', () => {
    const issue = issuemd(fixtures.simpleIssueWithMetaMalformed);

    assert.equal(issue.md(), fixtures.simpleIssueWithMeta);
  });

  it('should parse markdown issue with comments', () => {
    const issue = issuemd(fixtures.issueWithComments);

    assert.equal(issue.length, 1);
    assert.equal(JSON.stringify(issue[0]), fixtures.issueWithCommentsJson);
  });
});
