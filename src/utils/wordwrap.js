const each = require('./each')

// more full featured implementation: https://gist.github.com/billymoon/91db9ccada62028b50c7
const wordwrap = (str, intWidth) => {
  const result = []

  each(str.split(/\r\n|\n|\r/), (line) => {
    line = line.replace(/^\s\b/, '')

    let endPosition
    let segment
    let out = ''

    while (line.length > intWidth) {
      segment = line.slice(0, intWidth + 1).match(/\S*(\s)?$/)

      if (segment[1]) {
        endPosition = intWidth
      } else if (segment.input.length - segment[0].length) {
        endPosition = segment.input.length - segment[0].length
      } else {
        endPosition = intWidth
      }

      out += line.slice(0, endPosition)

      line = line.slice(endPosition)

      if (!!line && line.length) {
        out += '\n'
      }
    }

    result.push(out + line)
  })

  return result.join('\n')
}

module.exports = wordwrap
