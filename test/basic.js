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
    t.equal(table.sel({ where : { id : 4 } }), "SELECT id FROM user WHERE id = ?", 'sel() is ok');
    t.equal(table.sel({ where : { id : 4 }, cols : [ 'id' ]}), "SELECT id FROM user WHERE id = ?", 'sel() with cols is ok');

    // ins
    t.equal(table.ins({ id : 4 }), "INSERT INTO user(id) VALUES(?) RETURNING id", 'ins() is ok');

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
    t.equal(table.sel({ where : { username : 'chilts' }}), "SELECT username FROM user WHERE username = ?", 'sel() is ok');
    t.equal(table.sel({ where : { username : 'chilts' }, cols : [ 'username' ]}), "SELECT username FROM user WHERE username = ?", 'sel() with cols is ok');

    // ins
    t.equal(table.ins({ username : 'chilts' }), "INSERT INTO user(username) VALUES(?) RETURNING username", 'ins() is ok');

    // del
    t.equal(table.delAll(), 'DELETE FROM user', 'delAll() is ok');
    t.equal(table.delPk(), 'DELETE FROM user WHERE username = ?', 'delPk() is ok');
    t.equal(table.delWhere({ id : 10 }), 'DELETE FROM user WHERE id = ?', 'delWhere() is ok');

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
    t.equal(table.sel({ where : { id : 4 }}), "SELECT b.id AS b_id FROM blah b WHERE b.id = ?", 'sel() is ok');
    t.equal(table.sel({ where : { id : 4 }, cols : [ 'id' ]}), "SELECT b.id AS b_id FROM blah b WHERE b.id = ?", 'sel() with cols is ok');

    // ins
    t.equal(table.ins({ id : 4 }), "INSERT INTO blah(id) VALUES(?) RETURNING id AS b_id", 'ins() is ok');

    // del
    t.equal(table.delAll(), 'DELETE FROM blah b', 'delAll() is ok');
    t.equal(table.delPk(), 'DELETE FROM blah b WHERE b.id = ?', 'delPk() is ok');
    t.equal(table.delWhere({ id : 10 }), 'DELETE FROM blah b WHERE b.id = ?', 'delWhere() is ok');

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
    t.equal(table.sel({ where : { id : 4 }}), "SELECT email, id, password, username FROM user WHERE id = ?", 'sel() is ok');
    t.equal(table.sel({ where : { id : 4 }, cols : [ 'username', 'email' ]}), "SELECT email, username FROM user WHERE id = ?", 'sel() with cols is ok');

    // ins
    t.equal(table.ins({ username : 'chilts', email : 'me@example.com' }), "INSERT INTO user(email, username) VALUES(?, ?) RETURNING email, id, password, username", 'ins() is ok');

    // upd
    t.equal(table.updAll({ username : 'chilts', email : 'me@example.com', password : 5 }), "UPDATE user SET email = ?, password = ?, username = ?", 'updAll() is ok');
    t.equal(table.updPk({ username : 'chilts', email : 'me@example.com', password : 5 }), "UPDATE user SET email = ?, password = ?, username = ? WHERE id = ?", 'updPk() is ok');
    t.equal(table.updWhere({ username : 'chilts', email : 'me@example.com', password : 5 }, { id : 7 }), "UPDATE user SET email = ?, password = ?, username = ? WHERE id = ?", 'upd() is ok');
    t.equal(table.updWhere({ inserted : 1 }, { username : 'chilts', email : 'me@example.com' }), "UPDATE user SET inserted = ? WHERE email = ? AND username = ?", 'upd() with where is ok');

    // del
    t.equal(table.delAll(), 'DELETE FROM user', 'delAll() is ok');
    t.equal(table.delPk(), 'DELETE FROM user WHERE id = ?', 'delPk() is ok');
    t.equal(table.delWhere({ username : 10 }), 'DELETE FROM user WHERE username = ?', 'delWhere() is ok');
    t.equal(table.delWhere({ username : 10, email : 'sdf' }), 'DELETE FROM user WHERE email = ? AND username = ?', 'delWhere() is ok');

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
    t.equal(table.sel({ where : { id : 4 }}), "SELECT id, inserted, updated FROM account.user WHERE id = ?", 'sel() is ok');
    t.equal(table.sel({ where : { id : 4 }, cols : [ 'id' ]}), "SELECT id FROM account.user WHERE id = ?", 'sel() with cols is ok');

    // ins
    t.equal(table.ins({ id : 4 }), "INSERT INTO account.user(id) VALUES(?) RETURNING id, inserted, updated", 'ins() is ok');

    // upd
    t.equal(table.updAll({ inserted : 4, updated : 5 }), "UPDATE account.user SET inserted = ?, updated = ?", 'updAll() is ok');
    t.equal(table.updPk({ inserted : 4, updated : 5 }), "UPDATE account.user SET inserted = ?, updated = ? WHERE id = ?", 'upd() is ok');
    t.equal(table.updWhere({ inserted : 1, updated : 1 }, { id : 4 }), "UPDATE account.user SET inserted = ?, updated = ? WHERE id = ?", 'upd() with where is ok');

    // del
    t.equal(table.delAll(), 'DELETE FROM account.user', 'delAll() is ok');
    t.equal(table.delPk(), 'DELETE FROM account.user WHERE id = ?', 'delPk() is ok');
    t.equal(table.delWhere({ id : 10 }), 'DELETE FROM account.user WHERE id = ?', 'delWhere() is ok');

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
    t.equal(table.sel({ where : { id : 4 }}), "SELECT u.id AS u_id, u.inserted AS u_inserted FROM account.user u WHERE u.id = ?", 'sel() is ok');
    t.equal(table.sel({ where : { id : 4 }, cols : [ 'id' ]}), "SELECT u.id AS u_id FROM account.user u WHERE u.id = ?", 'sel() with cols is ok');

    // ins
    t.equal(table.ins({ id : 4 }), "INSERT INTO account.user(id) VALUES(?) RETURNING id AS u_id, inserted AS u_inserted", 'ins() is ok');

    // upd
    t.equal(table.updAll({ inserted : 4 }), "UPDATE account.user u SET u.inserted = ?", 'updAll() is ok');
    t.equal(table.updPk({ inserted : 4 }), "UPDATE account.user u SET u.inserted = ? WHERE u.id = ?", 'upd() is ok');
    t.equal(table.updWhere({ inserted : new Date() }, { id : 4 }), "UPDATE account.user u SET u.inserted = ? WHERE u.id = ?", 'upd() with where is ok');

    // del
    t.equal(table.delAll(), 'DELETE FROM account.user u', 'delAll() is ok');
    t.equal(table.delPk(), 'DELETE FROM account.user u WHERE u.id = ?', 'delPk() is ok');
    t.equal(table.delWhere({ id : 10 }), 'DELETE FROM account.user u WHERE u.id = ?', 'delWhere() is ok');

    t.end();
});

