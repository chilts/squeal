var test = require('tape');

var squeal = require('../squeal.js');

test('the most basic table', function(t) {
    var table = squeal({
        pk   : 'id',
        name : 'user',
        ro   : [ 'id' ],
    });

    t.equal(table.selAll(), "SELECT id FROM user", 'selAll() is ok');
    t.equal(table.selAll(['id']), "SELECT id FROM user", 'selAll() is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT id FROM user WHERE id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'id' ]), "SELECT id FROM user WHERE id = ?", 'selWhere() with cols is ok');
    t.end();
});

test('the most basic table with a different pk', function(t) {
    var table = squeal({
        name : 'user',
        pk   : 'username',
        ro   : [ 'username' ],
    });

    t.equal(table.selAll(), "SELECT username FROM user", 'selAll() is ok');
    t.equal(table.selAll(['username']), "SELECT username FROM user", 'selAll() is ok');
    t.equal(table.selWhere({ username : 'chilts' }), "SELECT username FROM user WHERE username = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ username : 'chilts' }, [ 'username' ]), "SELECT username FROM user WHERE username = ?", 'selWhere() with cols is ok');
    t.end();
});

test('the most basic table with a prefix', function(t) {
    var table = squeal({
        pk     : 'id',
        name   : 'blah',
        prefix : 'b',
        ro   : [ 'id' ],
    });

    t.equal(table.selAll(), "SELECT b.id AS b_id FROM blah b", 'selAll() is ok');
    t.equal(table.selAll(['id']), "SELECT b.id AS b_id FROM blah b", 'selAll() with cols is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT b.id AS b_id FROM blah b WHERE b.id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'id' ]), "SELECT b.id AS b_id FROM blah b WHERE b.id = ?", 'selWhere() with cols is ok');
    t.end();
});

test('the most basic table with some cols', function(t) {
    var table = squeal({
        pk   : 'id',
        name : 'user',
        rw   : [ 'username', 'email', 'password' ],
    });

    t.equal(table.selAll(), "SELECT email, id, password, username FROM user", 'selAll() is ok');
    t.equal(table.selAll(['username', 'email']), "SELECT email, username FROM user", 'selAll() is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT email, id, password, username FROM user WHERE id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'username', 'email' ]), "SELECT email, username FROM user WHERE id = ?", 'selWhere() with cols is ok');
    t.end();
});

test('the most basic table with a schema', function(t) {
    var table = squeal({
        pk     : 'id',
        name   : 'user',
        ro     : [ 'id', 'inserted', 'updated' ],
        schema : 'account'
    });

    t.equal(table.selAll(), "SELECT id, inserted, updated FROM account.user", 'selAll() is ok');
    t.equal(table.selAll(['id']), "SELECT id FROM account.user", 'selAll() with cols is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT id, inserted, updated FROM account.user WHERE id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'id' ]), "SELECT id FROM account.user WHERE id = ?", 'selWhere() with cols is ok');
    t.end();
});

test('the most basic table with a prefix and a schema', function(t) {
    var table = squeal({
        pk     : 'id',
        name   : 'user',
        prefix : 'u',
        ro     : [ 'id', 'inserted' ],
        schema : 'account'
    });

    t.equal(table.selAll(), "SELECT u.id AS u_id, u.inserted AS u_inserted FROM account.user u", 'selAll() is ok');
    t.equal(table.selAll(['id']), "SELECT u.id AS u_id FROM account.user u", 'selAll() with cols is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT u.id AS u_id, u.inserted AS u_inserted FROM account.user u WHERE u.id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'id' ]), "SELECT u.id AS u_id FROM account.user u WHERE u.id = ?", 'selWhere() with cols is ok');
    t.end();
});

