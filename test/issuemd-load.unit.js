describe("issuemd load", function() {

  var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../dist/issuemd.js') : require('../src/issuemd.js');

  it("should load the library", function() {
    expect(typeof issuemd).toBe('function');
  });

});