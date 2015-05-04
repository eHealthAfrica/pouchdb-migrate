var test = require('tape')
var PouchDB = require('pouchdb')
var memdown = require('memdown')

PouchDB.plugin(require('./'))


test('basic migration', function(t) {
  var db = new PouchDB('test', { db: memdown })
  var doc = { _id: 'mydoc' }
  var migration = function(doc) {
    doc.foo = 'bar'
    return [doc]
  }

  db
    .put(doc)
    .then(function() {
      return db.migrate(migration)
    })
    .then(function() {
      return db.get(doc._id)
    })
    .then(function(doc) {
      t.equal(doc.foo, 'bar', 'doc has foo')
    })
    .then(t.end)
})
