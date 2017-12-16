var Promise = require('pouchdb-promise')
var checkpointer = require('./lib/checkpointer')
var migrate = require('./lib/migrate')

exports.migrate = function(migration, options, callback) {
  var db = this

  if (!migration) {
    throw(new Error('no migration given'))
  }
  if (typeof migration !== 'function') {
    throw(new Error('migration must be a function'))
  }

  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  if (typeof options === 'undefined') {
    options = {}
  }

  var promise = checkpointer(db, migration)
    .then(function(cp) {
      return migrate(db, cp, migration, options)
    })

  if (typeof callback === 'function') {
    return promise
      .then(function(result) {
        callback(null, result)
      })
      .catch(function(error) {
        callback(error)
        return Promise.reject(error)
      })
  }

  return promise
}

if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(exports)
}
