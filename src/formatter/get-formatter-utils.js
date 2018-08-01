const curtail = (input, width) => {
  return input.length > width ? input.slice(0, width - 3) + '...' : input
}

const repeat = (char, qty) => {
  let out = ''

  for (let i = 0; i < qty; i++) {
    out += char
  }

  return out
}

const getFormatterUtils = (widest, cols, colorisationFunctions) => {
  cols = cols || 80

  const renderEcho = (val, render) => render(val)

  const curtailed = () => (str, render) => {
    let content = render(str)
    return curtail(content + repeat(' ', cols - 4 - content.length), cols - 4)
  }

  const body = () => (str, render) => {
    let content = render(str)
    return content + repeat(' ', cols - 4 - content.length)
  }

  const key = () => (str, render) => {
    let content = render(str)
    return content + repeat(' ', widest - content.length)
  }

  const padleft = () => (str, render) => repeat(render(str), widest)

  const padright = () => (str, render) => repeat(render(str), cols - widest - 7)

  const pad12 = () => (str, render) => (render(str) + '            ').substr(0, 12)

  const value = () => (str, render) => render(str) + repeat(' ', cols - 7 - widest - render(str).length)

  const pad = () => (str, render) => repeat(render(str), cols - 4)

  const pad6 = () => (str, render) => (render(str) + '      ').substr(0, 6)

  const bkey = () => (colorisationFunctions && colorisationFunctions.bkey) || renderEcho

  const bsep = () => (colorisationFunctions && colorisationFunctions.bsep) || renderEcho

  const htext = () => (colorisationFunctions && colorisationFunctions.htext) || renderEcho

  const hsep = () => (colorisationFunctions && colorisationFunctions.hsep) || renderEcho

  const btext = () => (colorisationFunctions && colorisationFunctions.btext) || renderEcho

  return {
    body,
    key,
    value,
    pad,
    pad6,
    pad12,
    padleft,
    padright,
    curtailed,
    bkey,
    bsep,
    htext,
    hsep,
    btext
  }
}

module.exports = getFormatterUtils
