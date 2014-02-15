var test = require('tape');

var squeal = require('../squeal.js');

test('the most basic table', function(t) {
    var table = squeal({
        pk   : 'id',
        name : 'user',
        ro   : [ 'id' ],
    });

    var a;

    // sel
    var q1 = table.sel();
    t.equal(q1.sql, "SELECT id FROM user", 'sel() is ok');
    t.deepEqual(q1.vals, [], 'q1 vals is fine');

    var q2 = table.sel({ cols : ['id']});
    t.equal(q2.sql, "SELECT id FROM user", 'sel() is ok');
    t.deepEqual(q2.vals, [], 'q2 vals is fine');

    var whereId1 = table.sel({ where : { id : 4 } });
    t.equal(whereId1.sql, "SELECT id FROM user WHERE id = $1", 'sel() is ok');
    t.deepEqual(whereId1.vals, [ 4 ], 'Values1 is fine');

    var whereId2 = table.sel({ where : { id : 4 }, cols : [ 'id' ]});
    t.equal(whereId2.sql, "SELECT id FROM user WHERE id = $1", 'sel() with cols is ok');
    t.deepEqual(whereId2.vals, [ 4 ], 'Values2 is fine');

    // ins
    var ins = table.ins({ id : 5 });
    t.equal(ins.sql, "INSERT INTO user(id) VALUES($1) RETURNING id", 'ins() is ok');
    t.deepEqual(ins.vals, [ 5 ], 'ins.vals is fine');

    t.end();
});

test('the most basic table with a different pk', function(t) {
    var table = squeal({
        name : 'user',
        pk   : 'username',
        ro   : [ 'username' ],
    });

    var a;

    // sel
    a = table.sel();
    t.equal(a.sql, "SELECT username FROM user", 'sel() is ok');

    a = table.sel(['username']);
    t.equal(a.sql, "SELECT username FROM user", 'sel() is ok');

    a = table.sel({ where : { username : 'chilts' }});
    t.equal(a.sql, "SELECT username FROM user WHERE username = $1", 'sel() is ok');
    t.deepEqual(a.vals, [ 'chilts' ], '.sel() vals is ok');

    a = table.sel({ where : { username : 'chilts' }, cols : [ 'username' ]});
    t.equal(a.sql, "SELECT username FROM user WHERE username = $1", 'sel() with cols is ok');
    t.deepEqual(a.vals, [ 'chilts' ], '.sel() with cols vals is ok');

    // ins
    a = table.ins({ username : 'chilts' });
    t.equal(a.sql, "INSERT INTO user(username) VALUES($1) RETURNING username", 'ins() is ok');
    t.deepEqual(a.vals, [ 'chilts' ], '.ins() vals is ok');

    // del
    a = table.delAll();
    t.equal(a.sql, 'DELETE FROM user', 'delAll() is ok');

    a = table.delPk(5);
    t.equal(a.sql, 'DELETE FROM user WHERE username = $1', 'delPk() is ok');
    t.deepEqual(a.vals, [ 5 ], 'delPk() vals is ok')

    a = table.delWhere({ id : 10 });
    t.equal(a.sql, 'DELETE FROM user WHERE id = $1', 'delWhere() is ok');
    t.deepEqual(a.vals, [ 10 ], '.delWhere() vals is ok');

    t.end();
});

test('the most basic table with a prefix', function(t) {
    var table = squeal({
        pk     : 'id',
        name   : 'blah',
        prefix : 'b',
        ro   : [ 'id' ],
    });

    var a;

    // sel
    a = table.sel();
    t.equal(a.sql, "SELECT b.id AS b_id FROM blah b", 'sel() is ok');
    t.deepEqual(a.vals, [], '.sel() vals is ok');

    a = table.sel(['id']);
    t.equal(a.sql, "SELECT b.id AS b_id FROM blah b", 'sel() with cols is ok');
    t.deepEqual(a.vals, [], '.sel with cols vals is ok');

    a = table.sel({ where : { id : 4 }});
    t.equal(a.sql, "SELECT b.id AS b_id FROM blah b WHERE b.id = $1", 'sel() is ok');
    t.deepEqual(a.vals, [ 4 ], '.sel() vals is ok');

    a = table.sel({ where : { id : 4 }, cols : [ 'id' ]});
    t.equal(a.sql, "SELECT b.id AS b_id FROM blah b WHERE b.id = $1", 'sel() with cols is ok');
    t.deepEqual(a.vals, [ 4 ], ' vals is ok');

    // ins
    a = table.ins({ id : 4 });
    t.equal(a.sql, "INSERT INTO blah(id) VALUES($1) RETURNING id AS b_id", 'ins() is ok');
    t.deepEqual(a.vals, [ 4 ], '.ins() vals is ok');

    // del
    a = table.delAll();
    t.equal(a.sql, 'DELETE FROM blah b', 'delAll() is ok');
    t.deepEqual(a.vals, [], '.delAll() vals is ok');

    a = table.delPk(10);
    t.equal(a.sql, 'DELETE FROM blah b WHERE b.id = $1', 'delPk() is ok');
    t.deepEqual(a.vals, [ 10 ], 'delPk() vals is ok')

    a = table.delWhere({ id : 10 });
    t.equal(a.sql, 'DELETE FROM blah b WHERE b.id = $1', 'delWhere() is ok');
    t.deepEqual(a.vals, [ 10 ], '.delWhere() vals is ok');

    t.end();
});

test('the most basic table with some cols', function(t) {
    var table = squeal({
        pk   : 'id',
        name : 'user',
        rw   : [ 'username', 'email', 'password' ],
    });

    var a;

    // sel
    a = table.sel();
    t.equal(a.sql, "SELECT email, id, password, username FROM user", 'sel() is ok');
    t.deepEqual(a.vals, [], '.sel() vals is ok');

    a = table.sel(['username', 'email']);
    t.equal(a.sql, "SELECT email, username FROM user", 'sel() with cols is ok');
    t.deepEqual(a.vals, [], '.sel() with cols vals is ok');

    a = table.sel({ where : { id : 4 }});
    t.equal(a.sql, "SELECT email, id, password, username FROM user WHERE id = $1", 'sel() with where is ok');
    t.deepEqual(a.vals, [ 4 ], '.sel() with where vals is ok');

    a = table.sel({ where : { id : 4 }, cols : [ 'username', 'email' ]});
    t.equal(a.sql, "SELECT email, username FROM user WHERE id = $1", 'sel() with cols and where is ok');
    t.deepEqual(a.vals, [ 4 ], '.sel() with cols and where vals is ok');

    // ins
    a = table.ins({ username : 'chilts', email : 'me@example.com' });
    t.equal(a.sql, "INSERT INTO user(email, username) VALUES($1, $2) RETURNING email, id, password, username", 'ins() is ok');
    t.deepEqual(a.vals, [ 'me@example.com', 'chilts' ], '.ins() vals is ok');

    // upd
    a = table.updAll({ username : 'chilts', email : 'me@example.com', password : 'deadbeef' });
    t.equal(a.sql, "UPDATE user SET email = $1, password = $2, username = $3", 'updAll() is ok');
    t.deepEqual(a.vals, [ 'me@example.com', 'deadbeef', 'chilts' ], '.updAll() vals is ok');

    a = table.updPk({ username : 'chilts', email : 'me@example.com', password : 'deadbeef' }, 120);
    t.equal(a.sql, "UPDATE user SET email = $1, password = $2, username = $3 WHERE id = $4", '.updPk() is ok');
    t.deepEqual(a.vals, [ 'me@example.com', 'deadbeef', 'chilts', 120 ], '.updPk() vals is ok');

    a = table.updWhere({ username : 'chilts', email : 'me@example.com', password : 'deadbeef' }, { id : 7 });
    t.equal(a.sql, "UPDATE user SET email = $1, password = $2, username = $3 WHERE id = $4", 'updWhere() is ok');
    t.deepEqual(a.vals, [ 'me@example.com', 'deadbeef', 'chilts', 7 ], '.updWhere() vals is ok');

    a = table.updWhere({ inserted : '2012-12-31' }, { username : 'chilts', email : 'me@example.com' });
    t.equal(a.sql, "UPDATE user SET inserted = $1 WHERE email = $2 AND username = $3", 'updWhere() with where is ok');
    t.deepEqual(a.vals, [ '2012-12-31', 'me@example.com', 'chilts' ], '.updWhere() vals is ok');

    // del
    a = table.delAll();
    t.equal(a.sql, 'DELETE FROM user', 'delAll() is ok');

    a = table.delPk(12);
    t.equal(a.sql, 'DELETE FROM user WHERE id = $1', 'delPk() is ok');
    t.deepEqual(a.vals, [ 12 ], 'delPk() vals is ok')

    a = table.delWhere({ username : 10 });
    t.equal(a.sql, 'DELETE FROM user WHERE username = $1', 'delWhere() is ok');
    t.deepEqual(a.vals, [ 10 ], '.delWhere() vals is ok');

    a = table.delWhere({ username : 10, email : 'sdf' });
    t.equal(a.sql, 'DELETE FROM user WHERE email = $1 AND username = $2', 'delWhere() is ok');
    t.deepEqual(a.vals, [ 'sdf', 10 ], '.delWhere() vals is ok');

    t.end();
});

test('the most basic table with a schema', function(t) {
    var table = squeal({
        pk     : 'id',
        name   : 'user',
        ro     : [ 'id', 'inserted', 'updated' ],
        schema : 'account'
    });

    var a;

    // sel
    a = table.sel();
    t.equal(a.sql, "SELECT id, inserted, updated FROM account.user", 'sel() is ok');
    t.deepEqual(a.vals, [], '.sel() vals is ok');

    a = table.sel(['id']);
    t.equal(a.sql, "SELECT id FROM account.user", 'sel() with cols is ok');
    t.deepEqual(a.vals, [], '.sel() with cols vals is ok');

    a = table.sel({ where : { id : 4 }});
    t.equal(a.sql, "SELECT id, inserted, updated FROM account.user WHERE id = $1", 'sel() with where is ok');
    t.deepEqual(a.vals, [ 4 ], '.sel() with where vals is ok');

    a = table.sel({ where : { id : 4 }, cols : [ 'id' ]});
    t.equal(a.sql, "SELECT id FROM account.user WHERE id = $1", 'sel() with cols and where is ok');
    t.deepEqual(a.vals, [ 4 ], '.sel() cols and where vals is ok');

    // ins
    a = table.ins({ id : 4 });
    t.equal(a.sql, "INSERT INTO account.user(id) VALUES($1) RETURNING id, inserted, updated", 'ins() is ok');
    t.deepEqual(a.vals, [ 4 ], '.delWhere() vals is ok');

    // upd
    a = table.updAll({ inserted : 4, updated : 5 });
    t.equal(a.sql, "UPDATE account.user SET inserted = $1, updated = $2", 'updAll() is ok');
    t.deepEqual(a.vals, [ 4, 5 ], '.delWhere() vals is ok');

    a = table.updPk({ inserted : 4, updated : 5 }, 17);
    t.equal(a.sql, "UPDATE account.user SET inserted = $1, updated = $2 WHERE id = $3", 'updPk() is ok');
    t.deepEqual(a.vals, [ 4, 5, 17 ], '.delWhere() vals is ok');

    a = table.updWhere({ inserted : 1, updated : 2 }, { id : 4 });
    t.equal(a.sql, "UPDATE account.user SET inserted = $1, updated = $2 WHERE id = $3", 'updWhere() with where is ok');
    t.deepEqual(a.vals, [ 1, 2, 4 ], '.delWhere() vals is ok');

    // del
    a = table.delAll();
    t.equal(a.sql, 'DELETE FROM account.user', 'delAll() is ok');
    t.deepEqual(a.vals, [], '.delWhere() vals is ok');

    a = table.delPk(827);
    t.equal(a.sql, 'DELETE FROM account.user WHERE id = $1', 'delPk() is ok');
    t.deepEqual(a.vals, [ 827 ], 'delPk() vals is ok')

    a = table.delWhere({ id : 10 });
    t.equal(a.sql, 'DELETE FROM account.user WHERE id = $1', 'delWhere() is ok');
    t.deepEqual(a.vals, [ 10 ], '.delWhere() vals is ok');

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

    var a;

    // sel
    a = table.sel();
    t.equal(a.sql, "SELECT u.id AS u_id, u.inserted AS u_inserted FROM account.user u", 'sel() is ok');
    t.deepEqual(a.vals, [], '.sel() vals is ok');

    a = table.sel(['id']);
    t.equal(a.sql, "SELECT u.id AS u_id FROM account.user u", 'sel() with cols is ok');
    t.deepEqual(a.vals, [], '.sel() with cols vals is ok');

    a = table.sel({ where : { id : 4 }});
    t.equal(a.sql, "SELECT u.id AS u_id, u.inserted AS u_inserted FROM account.user u WHERE u.id = $1", 'sel() with where is ok');
    t.deepEqual(a.vals, [ 4 ], '.sel() with where vals is ok');

    a = table.sel({ where : { id : 4 }, cols : [ 'id' ]});
    t.equal(a.sql, "SELECT u.id AS u_id FROM account.user u WHERE u.id = $1", 'sel() with where and cols is ok');
    t.deepEqual(a.vals, [ 4 ], '.sel() with where and cols vals is ok');

    // ins
    a = table.ins({ id : 4 });
    t.equal(a.sql, "INSERT INTO account.user(id) VALUES($1) RETURNING id AS u_id, inserted AS u_inserted", 'ins() is ok');
    t.deepEqual(a.vals, [ 4 ], '.ins() vals is ok');

    // upd
    a = table.updAll({ inserted : 4 });
    t.equal(a.sql, "UPDATE account.user u SET u.inserted = $1", 'updAll() is ok');
    t.deepEqual(a.vals, [ 4 ], '.updAll() vals is ok');

    a = table.updPk({ inserted : 4 }, 121);
    t.equal(a.sql, "UPDATE account.user u SET u.inserted = $1 WHERE u.id = $2", 'updPk() is ok');
    t.deepEqual(a.vals, [ 4, 121 ], '.updPk() vals is ok');

    a = table.updWhere({ inserted : 23 }, { id : 37 });
    t.equal(a.sql, "UPDATE account.user u SET u.inserted = $1 WHERE u.id = $2", 'updWhere() with where is ok');
    t.deepEqual(a.vals, [ 23, 37 ], '.updWhere() vals is ok');

    // del
    a = table.delAll();
    t.equal(a.sql, 'DELETE FROM account.user u', 'delAll() is ok');
    t.deepEqual(a.vals, [], '.delAll() vals is ok');

    a = table.delPk(761);
    t.equal(a.sql, 'DELETE FROM account.user u WHERE u.id = $1', 'delPk() is ok');
    t.deepEqual(a.vals, [ 761 ], 'delPk() vals is ok')

    a = table.delWhere({ id : 10 });
    t.equal(a.sql, 'DELETE FROM account.user u WHERE u.id = $1', 'delWhere() is ok');
    t.deepEqual(a.vals, [ 10 ], '.delWhere() vals is ok');

    t.end();
});
