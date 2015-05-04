var MD5 = require('./md5')
var Promise = require('pouchdb/extras/promise')

var md5Promise = function(data) {
  return new Promise(function(resolve, reject) {
    MD5(data, function(error, result) {
      if (error) { return reject(error) }

      resolve(result)
    })
  })
}

module.exports = function(db, migration) {
  var doc = {
    last_seq: 0
  }

  return md5Promise(migration.toString())
    .then(function(md5sum) {
      doc._id = '_local/' + md5sum
    })
    .then(function() {
      return {
        get: function() {
          return db.get(doc._id)
            .then(function(response) {
              doc._rev = response._rev
              doc.last_seq = response.last_seq
            })
            .catch(function(error) {
              if (error.status !== 404) return Promise.reject()
            })
            .then(function() {
              return doc.last_seq
            })
        },
        set: function(seq) {
          doc.last_seq = seq

          return db.put(doc)
            .then(function(response) {
              doc._rev = response.rev
            })
        }
      }
    })
}
