var test = require('tape');

var squeal = require('../squeal.js');

test('the most basic table', function(t) {
    var table = squeal({
        pk   : 'id',
        name : 'user',
        ro   : [ 'id' ],
    });

    // sel
    t.equal(table.sel(), "SELECT id FROM user", 'sel() is ok');
    t.equal(table.sel(['id']), "SELECT id FROM user", 'sel() is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT id FROM user WHERE id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'id' ]), "SELECT id FROM user WHERE id = ?", 'selWhere() with cols is ok');

    // ins
    t.equal(table.ins({ id : 4 }), "INSERT INTO user(id) VALUES(?)", 'ins() is ok');

    t.end();
});

test('the most basic table with a different pk', function(t) {
    var table = squeal({
        name : 'user',
        pk   : 'username',
        ro   : [ 'username' ],
    });

    // sel
    t.equal(table.sel(), "SELECT username FROM user", 'sel() is ok');
    t.equal(table.sel(['username']), "SELECT username FROM user", 'sel() is ok');
    t.equal(table.selWhere({ username : 'chilts' }), "SELECT username FROM user WHERE username = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ username : 'chilts' }, [ 'username' ]), "SELECT username FROM user WHERE username = ?", 'selWhere() with cols is ok');

    // ins
    t.equal(table.ins({ username : 'chilts' }), "INSERT INTO user(username) VALUES(?)", 'ins() is ok');

    t.end();
});

test('the most basic table with a prefix', function(t) {
    var table = squeal({
        pk     : 'id',
        name   : 'blah',
        prefix : 'b',
        ro   : [ 'id' ],
    });

    // sel
    t.equal(table.sel(), "SELECT b.id AS b_id FROM blah b", 'sel() is ok');
    t.equal(table.sel(['id']), "SELECT b.id AS b_id FROM blah b", 'sel() with cols is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT b.id AS b_id FROM blah b WHERE b.id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'id' ]), "SELECT b.id AS b_id FROM blah b WHERE b.id = ?", 'selWhere() with cols is ok');

    // ins
    t.equal(table.ins({ id : 4 }), "INSERT INTO blah(id) VALUES(?)", 'ins() is ok');

    t.end();
});

test('the most basic table with some cols', function(t) {
    var table = squeal({
        pk   : 'id',
        name : 'user',
        rw   : [ 'username', 'email', 'password' ],
    });

    // sel
    t.equal(table.sel(), "SELECT email, id, password, username FROM user", 'sel() is ok');
    t.equal(table.sel(['username', 'email']), "SELECT email, username FROM user", 'sel() is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT email, id, password, username FROM user WHERE id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'username', 'email' ]), "SELECT email, username FROM user WHERE id = ?", 'selWhere() with cols is ok');

    // ins
    t.equal(table.ins({ username : 'chilts', email : 'me@example.com' }), "INSERT INTO user(email, username) VALUES(?, ?)", 'ins() is ok');

    t.end();
});

test('the most basic table with a schema', function(t) {
    var table = squeal({
        pk     : 'id',
        name   : 'user',
        ro     : [ 'id', 'inserted', 'updated' ],
        schema : 'account'
    });

    // sel
    t.equal(table.sel(), "SELECT id, inserted, updated FROM account.user", 'sel() is ok');
    t.equal(table.sel(['id']), "SELECT id FROM account.user", 'sel() with cols is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT id, inserted, updated FROM account.user WHERE id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'id' ]), "SELECT id FROM account.user WHERE id = ?", 'selWhere() with cols is ok');

    // ins
    t.equal(table.ins({ id : 4 }), "INSERT INTO user(id) VALUES(?)", 'ins() is ok');

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

    // sel
    t.equal(table.sel(), "SELECT u.id AS u_id, u.inserted AS u_inserted FROM account.user u", 'sel() is ok');
    t.equal(table.sel(['id']), "SELECT u.id AS u_id FROM account.user u", 'sel() with cols is ok');
    t.equal(table.selWhere({ id : 4 }), "SELECT u.id AS u_id, u.inserted AS u_inserted FROM account.user u WHERE u.id = ?", 'selWhere() is ok');
    t.equal(table.selWhere({ id : 4 }, [ 'id' ]), "SELECT u.id AS u_id FROM account.user u WHERE u.id = ?", 'selWhere() with cols is ok');

    // ins
    t.equal(table.ins({ id : 4 }), "INSERT INTO user(id) VALUES(?)", 'ins() is ok');

    t.end();
});

