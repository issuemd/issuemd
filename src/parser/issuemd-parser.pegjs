COLLECTION = issues:ISSUE* { return issues }

ISSUE = title:TITLE original:ISSUE_META body:BODY? updates:UPDATE* NEWLINE* {
  original.title = title
  original.body = body || ''
  return { original: original, updates: updates }
}

/* TITLE */

TITLE = '##' SPACE+ title:TO_EOL* { return title.join('') }

/* META - used in ISSUE and UPDATE */

ISSUE_META = created:META_CREATED creator:META_CREATOR meta:META_ITEM* {
  return {
    // reserve space for title, to retain order of attributes (mostly for testing purposes)
    title: null,
    // TODO: why do tests expect this order, but parser does not necessarily!!?
    creator: creator,
    created: created,
    meta: meta
  }
}

UPDATE_META = modified:META_MODIFIED modifier:META_MODIFIER meta:META_ITEM* {
  return {
    // TODO: improve ordering of elements
    meta: meta,
    modified: modified,
    modifier: modifier
  }
}

META_CREATED = META_START 'created' META_SEPARATOR value:META_VALUE { return value }
META_CREATOR = META_START 'creator' META_SEPARATOR value:META_VALUE { return value }
META_MODIFIED = META_START 'modified' META_SEPARATOR value:META_VALUE { return value }
META_MODIFIER = META_START 'modifier' META_SEPARATOR value:META_VALUE { return value }
META_ITEM = META_START label:META_LABEL META_SEPARATOR value:META_VALUE { return { key: label, value: value } }
META_START = NEWLINE '+' SPACE+
META_LABEL = ALPHAS
META_SEPARATOR = ':' WHITESPACE
META_VALUE = value:TO_EOL* { return value.join('') }

/* BODY - used in ISSUE and UPDATE */

BODY = DIVIDER body:TO_DELIMITER { return body }

/* UPDATES */

UPDATE = DIVIDER UPDATE_DELIMITER update:UPDATE_META body:BODY? {
  update.body = body || ''
  return update
}

UPDATE_DELIMITER = '---'

/* GENERAL TOKEN DEFINITIONS */

// could be delimited by another issue, but then parse errors get eaten by issue body
DELIMITER = NEWLINE EOF / DIVIDER (UPDATE_DELIMITER META_ITEM / TITLE META_ITEM)
TO_EOL = !NEWLINE char:. { return char }
TO_DELIMITER = content:(!DELIMITER char:. { return char })* { return content.join('') }
ALPHAS = chars:[a-zA-Z]+ { return chars.join('') } 
DIVIDER = NEWLINE NEWLINE

NEWLINE =  '\r\n' / '\r' / '\n'
SPACE = ' '
WHITESPACE = '\t' / SPACE
EOF = !.
