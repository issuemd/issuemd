const type = (me) => {
  return Object.prototype.toString
    .call(me)
    .split(/\W/)[2]
    .toLowerCase()
}

module.exports = type
