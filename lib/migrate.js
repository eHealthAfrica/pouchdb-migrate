var Promise = require('pouchdb/extras/promise')
var extend = require('pouchdb-extend')
var async = require('async')

module.exports = function migrate(db, checkpointer, migration, options) {
  return checkpointer.get()
    .then(function(since) {
      return new Promise(function(resolve, reject) {
        var docs = []
  
        var queue = async.queue(function(result, next) {
          if (!result) {
            return checkpointer
              .set(change.seq)
              .then(next.bind({}, null))
              .catch(next)
          }
            
          db
            .bulkDocs({ docs: result })
            .then(function(response) {
              return checkpointer.set(change.seq)
            })
            .then(next.bind({}, null))
            .catch(next)
        }, 1)

        
        var feed = db.changes(extend({}, options, {
          include_docs: true,
          since: since
        }))
        
        feed.on('change', function(change) {
          var result = migration(change.doc)

          if (!options.live) {
            docs = result ? docs.concat(result) : docs
            return
          }
          
          queue.push(result)
        })
        
        feed.on('complete', function(info) {
          if (options.live) { return resolve(info) }

          db
            .bulkDocs({ docs: docs })
            .then(function(response) {
              return checkpointer.set(info.last_seq)
            })
            .then(function() {
              return db.info()
            })
            .then(function(dbinfo) {
              if (dbinfo.update_seq > info.last_seq) {
                return migrate(db, checkpointer, migration, options)
              }
              return info
            })
            .then(resolve)
        })

        feed.on('error', reject)
      })
    })
}
