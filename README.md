squeal - Create your SQL like a boss.

## Synopsis ##

```js
var squeal = require('squeal')

// Returns an object which has various methods.
// Only requires 'pk' and 'name' to be provided.
var account = squeal({
  pk     : 'id',
  name   : 'account',
  ro     : [ 'id', 'inserted', 'updated' ],
  rw     : [ 'username', 'email', 'password' ],
})

// do a regular select (with no where clause)
var stmt = account.sel()
console.log('sql=' + stmt.sql)
// -> SELECT id, inserted, updated, username, email, password FROM account;

// select just 'id' and 'username' where 'email = "john@doe.org"'
var stmt = account.sel({
  where : {
    email : 'john@doe.org',
  },
})
console.log('sql=' + stmt.sql)
// -> SELECT id, username FROM account WHERE email = $1
console.log('sql=' + stmt.vals)
// -> 'john@doe.org'

```

## AUTHOR ##

Written by [Andrew Chilton](http://chilts.org/):

* [Blog](http://chilts.org/)
* [GitHub](https://github.com/chilts)
* [Twitter](https://twitter.com/andychilton)
* [Instagram](http://instagram.com/thechilts)

(Ends)
