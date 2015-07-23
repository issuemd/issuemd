var issuemd = process.env.ENVIRONMENT === 'dist' ? require('../dist/issuemd.js') : require('../src/issuemd-core.js');

var Chance = require('chance');
var chance = new Chance(1234567890);
//new Date((new Date()*1)+chance.weighted([1,10,100,10000],[10,5,3,1])*Math.random()*1000*60*60)

// function randissue(){
//   return issuemd(1).attr({title:chance.sentence(),creator:chance.name(),body:chance.paragraph()})
// }

var projects = [], project_weighting = [];
var project_lookup = {};
for(var i=10;i--;){
  var project = {
    name: chance.sentence({words: chance.integer({min:2,max:4})}).replace('.','')
  };
  project_weighting.push(i);
  project_lookup[project.name] = [];
  projects.push(project);
}


var people = [];
for(var i=100;i--;){
  var person = {
    username: '@'+chance.word({syllables: chance.integer({min:2,max:5})}),
    name: chance.name(),
    email: chance.email(),
    projects: [chance.weighted(projects,project_weighting).name]
  };
  for(var j=chance.integer({min:0,max:3});j--;){
    person.projects.push(chance.weighted(projects,project_weighting).name);
  }
  for(var j=0;j<person.projects.length;j++){
    project_lookup[person.projects[j]].push(person.username);
  }
  people.push(person);
}

var issues = [];
for(var i=1000;i--;){
  var creator = chance.pick(people);
  var project = chance.pick(creator.projects);
  var bodyarr = [];
  var offset = 0;
  function getOffset(){
    offset += chance.integer({min:1,max:1000})*1000*60*60;
    if(chance.bool({likelihood: 10})){
      offset += chance.integer({min:5000,max:50000})*1000*60*60;
    }
    return offset;
  }
  for(var j=chance.integer({min:1,max:4});j--;){
    bodyarr.push(chance.paragraph());
  }
  var issue = {
    original: {
      title: chance.sentence({words: chance.integer({min:3,max:12})}).replace('.',''),
      creator: creator.username + ', ' + creator.name + ', ' + creator.email,
      created: chance.date({year:chance.integer({min:2010,max:2015})}).toISOString().substr(0,16).replace('T',' '),
      body: bodyarr.join('\n\n')
    },
    updates: []
  };
  for(var j=chance.weighted([0,1,2,3,4,5,6,7,8,9],[10,9,8,7,6,5,4,3,2,1]);j--;){
    var meta = {
      modified: new Date((new Date(issue.original.created)*1)+getOffset()).toISOString().substr(0,16).replace('T',' '),
      modifier: chance.pick(project_lookup[project])
    }
    if(chance.bool({likelihood: 30})) {
      meta.body = chance.paragraph()
    } else if(chance.bool({likelihood: 30})) {
      meta.body = chance.paragraph();
      meta.meta = [{key:chance.word(),val:chance.word()}];
    } else {
      meta.meta = [{key:chance.word(),val:chance.word()}];
    }
    issue.updates.push(meta)
  }
  issues.push(issue);
}

// console.log('')
// console.log(randissue())
// console.log(people)
// console.log(projects)
console.log(issuemd(issues).md())
// console.log('')
