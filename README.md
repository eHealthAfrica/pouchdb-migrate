# pouchdb-migrate
PouchDB plugin for running migrations.

## Setup
```html
<script src="pouchdb.js"></script>
<script src="pouchdb.migrator.js"></script>
```

Or to use it in Node.js, just npm install it:

```
npm install pouchdb-migrate
```

And then attach it to the `PouchDB` object:

```js
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-migrate'));
```

## Usage
```js
var db = new PouchDB('mydb')
var migration = function(doc) {
  doc.foo = 'bar'
  return [doc]
}
db.migrate(migration)
  .then //... every doc has `foo` now
```

## Testing
Run the tests with
```sh
npm test
```
