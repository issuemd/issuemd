const objectKeys = (obj) => {
  const keys = []

  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      keys.push(i)
    }
  }

  return keys
}

module.exports = objectKeys
