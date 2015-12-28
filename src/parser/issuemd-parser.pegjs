// declare variables used to store parts as they are built up
// TODO: figure out how to avoid using variables
{ var update, issue; }

// main object to return
// 1. issue list is 1 or more issues
issues = issues:issue+ { return issues }

// issue variable should be parsed by now, so return it
// 1. one issue issue title
// 2. one or more header meta information
// 3. issue body
// 4. issue updates
issue = title issue_meta+ issue_body update* nl* { return issue }

// reset the issue object and attach title to it
// 1. exact two '#' characters
// 2. one or more white spaces
// 3. at least one any character until the end of the line
title = '##' whitespace+ title:all_chars {
  issue = issue = {
    original: {
        title: '',
        creator: '',
        created: '',
        meta: [],
        body: ''
    },
    updates: []
  };

  issue.original.title = title
}

// attach meta to issue object
issue_meta = meta:meta {
  if(meta.key.match(/^creat(or|ed)$/)){
    issue.original[meta.key] = meta.value;
  } else {
    issue.original.meta.push(meta);
  }
}

// attach body to issue object, and reset update variable
issue_body = body:body {
  issue.original.body = body.join('');
  update = { meta: [] };
}

// update finished, attach to issue object and reset update variable
// 1. update start
// 2. zero or more update meta data
// 3. update body
update = update_delimiter update_meta* update_body {
  issue.updates.push(update);
  update = { meta: [] };
}

// attach meta to update
update_meta = meta:meta {
  if(meta.key.match(/^modifie[rd]|type$/)){
    update[meta.key] = meta.value;
  } else {
    update.meta.push(meta);
  }
}

// attach update body to update
// TODO: find alternative to `trim` in parser logic (appears to be required for last update only)
update_body = body:anything* { update.body = body.join('').trim() }

// 1. exact 3 '-' characters
update_delimiter = nl nl '---'

//
// re-usable chunks
//

// used by issue and update
// 1. 0 or more characters until the next update or new issue
body = nl nl body:anything+ { return body }
//1. 0 or more white spaces
//2. exact one single '+'
//3. at least one space after '+'
//4. meta keyword
//5. exact one single ':'
//6. 0 or more single spaces
//7. at least one character after single space
//8. 0 or more characters until the end of the line
meta = nl '+' whitespace+ key:safe_chars ':' whitespace* value:all_chars { return {key:key, value:value} }

// section delimiters (updates/issues)
// 1. exact 3 '-' characters
// 2. new line character
delimiter = update_delimiter nl / nl+ '## ' all_chars meta

// anything except delimiters
anything = !delimiter char:. { return char }

// anything except newline
all_chars = chars:(!nl char:. { return char })+ { return chars.join('') }

// newline character
nl =  '\r\n' / '\r' / '\n'

// characters considered safe (for use in meta keys for example)
// 1. at least one keyword characters, without spaces
safe_chars = chars:[a-zA-Z_-]+ { return chars.join('') }

whitespace = '\t' / ' ' / nl