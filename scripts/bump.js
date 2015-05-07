#!/usr/bin/env node

var fs = require('fs');

// TODO: ascend directory tree until find package.json or bower.json
// TODO: only require one or other of package/bower config files
var package = JSON.parse(fs.readFileSync('package.json'));
var bower = JSON.parse(fs.readFileSync('bower.json'));
var version = package.version.split(/\D/).map(function(number){ return number*1; });

switch(process.argv[2]){
	case 'major': version[0]++; version[1] = version[2] = 0; break;
	case 'minor': version[1]++; version[2] = 0; break;
	default: version[2]++; break;
}

package.version = version.join('.');
bower.version = version.join('.');

fs.writeFileSync('package.json', JSON.stringify(package, null, 2));
fs.writeFileSync('bower.json', JSON.stringify(bower, null, 2));

console.log('bumped to version: '+version.join('.'));