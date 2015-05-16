describe("issuemd load", function() {

  var issuemd_dist = require('../dist/issuemd.js');
  it("should load the library from dist", function() {
    expect(typeof issuemd_dist).toBe('function');
  });

  var issuemd_src = require('../src/issuemd.js');
  it("should load the library from src", function() {
    expect(typeof issuemd_src).toBe('function');
  });

});