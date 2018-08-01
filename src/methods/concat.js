const concat = (collection, arr) => createCollection(collection.toArray().concat(arr.toArray()))

module.exports = concat
