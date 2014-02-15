var test = require('tape');

var squeal = require('../squeal.js');

var table = squeal({
    name : 'user',
    pk   : 'uid',
    ro   : [ 'uid' ],
    rw   : [ 'username' ],
});

test('non-id primary key', function(t) {
    // ins
    var ins = table.ins({ uid : 'xyz', username : 'coder' });
    t.equal(ins.sql, "INSERT INTO user(uid, username) VALUES($1, $2) RETURNING uid, username", 'ins() is ok');
    t.deepEqual(ins.vals, [ 'xyz', 'coder' ], 'ins.vals is fine');

    t.end();
});

test('unknown field for ins', function(t) {
    // ins
    try {
        var ins = table.ins({ uid : 'xyz', username : 'coder', logins : 1 });
        t.fail('table.ins() should throw an error with an invalid field name');
    }
    catch (e) {
        t.pass('table.ins() threw an error');
    }

    t.end();
});

test('unknown field for upd', function(t) {
    // ins
    try {
        var ins = table.updAll({ uid : 'xyz', username : 'coder', logins : 1 });
        t.fail('table.ins() should throw an error with an invalid field name');
    }
    catch (e) {
        t.pass('table.ins() threw an error');
    }

    t.end();
});
