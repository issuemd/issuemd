'use strict';

module.exports = (function() {
  var fs = require('fs');
  var PEG = require('pegjs');

  // TODO: if webpack build, drop the filename concat used by browserify
  return PEG.buildParser(fs.readFileSync(__dirname + '/issuemd-parser.pegjs', 'utf8')); // eslint-disable-line no-path-concat
})();
