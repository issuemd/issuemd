'use strict';

module.exports = (function () {

    var fs = require('fs');
    var PEG = require('pegjs');

    return PEG.buildParser(fs.readFileSync(__dirname + '/issuemd-parser.pegjs', 'utf8'));

}());