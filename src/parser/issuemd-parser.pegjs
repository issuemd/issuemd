COLLECTION = issues:ISSUE* { return issues }

ISSUE = title:TITLE original:ISSUE_META body:BODY? updates:UPDATE* DIVIDER {
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
    created: created,
    creator: creator,
    meta: meta
  }
}

UPDATE_META = modified:META_MODIFIED modifier:META_MODIFIER type:META_TYPE meta:META_ITEM* {
  return {
    modified: modified,
    modifier: modifier,
    type: type,
    meta: meta
  }
}

META_CREATED = META_START 'created' META_SEPARATOR value:META_VALUE { return value }
META_CREATOR = META_START 'creator' META_SEPARATOR value:META_VALUE { return value }
META_MODIFIED = META_START 'modified' META_SEPARATOR value:META_VALUE { return value }
META_MODIFIER = META_START 'modifier' META_SEPARATOR value:META_VALUE { return value }
META_TYPE = META_START 'type' META_SEPARATOR value:META_VALUE { return value }
META_ITEM = META_START label:META_LABEL META_SEPARATOR value:META_VALUE { return { key: label, value: value } }
META_START = NEWLINE '+' SPACE+
META_LABEL = KEYWORD
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
DELIMITER = DIVIDER (EOF / UPDATE_DELIMITER META_ITEM / TITLE META_ITEM)
TO_EOL = !NEWLINE char:. { return char }
TO_DELIMITER = content:(!DELIMITER char:. { return char })* { return content.join('') }
KEYWORD = start:[a-zA-Z] rest:[a-zA-Z0-9_-]* { return start + rest.join('') }
DIVIDER = NEWLINE NEWLINE

NEWLINE =  '\r\n' / '\r' / '\n'
SPACE = ' '
WHITESPACE = '\t' / SPACE
EOF = !.
