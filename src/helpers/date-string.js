const dateString = (inputDate) => inputDate.toISOString().replace(/Z$/, '+0000')

module.exports = dateString
