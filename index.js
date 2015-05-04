var MD5 = require('./lib/md5')
var Promise = require('pouchdb/extras/promise')

exports.migrate = function(migration, callback) {
  var db = this

  if (!migration) {
    throw(new Error('no migration given'))
  }
  if (typeof migration !== 'function') {
    throw(new Error('migration must be a function'))
  }

  var promise = new Promise(function(resolve, reject) {
    MD5(migration.toString(), function(error, id) {
      if (error) { return reject(error) }

      var migrationId = '_local/' + id

      db.get(migrationId, function(error, migrationStatus) {
        if (error) {
          migrationStatus = {
            _id: migrationId,
            last_seq: 0
          }
        }

        var feed = db.changes({
          include_docs: true,
          since: migrationStatus.last_seq
        })
        
        feed.on('change', function(change) {
          var docs = migration(change.doc)
          
          if (!docs) { return }

          migrationStatus.last_seq = change.seq
          db.bulkDocs({ docs: docs }, function(error) {
            if (error) { return reject(error) }

            db.put(migrationStatus, function(error, response) {
              if (error) { return reject(error) }

              migrationStatus._rev = response.rev
            })
          })
        })
        
        feed.on('error', reject)
        feed.on('complete', resolve)
      })
    })
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
