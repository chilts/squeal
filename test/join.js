var test = require('tape');

var squeal = require('../squeal.js');

test('join account with blog', function(t) {
    var account = squeal({
        pk   : 'id',
        name : 'account',
        prefix : 'ac',
        ro   : [ 'id' ],
        rw   : [ 'username' ],
    });

    var blog = squeal({
        pk   : 'id',
        name : 'blog',
        prefix : 'bl',
        ro   : [ 'id' ],
        rw   : [ 'account_id', 'username' ],
        fk   : {
            'account' : {
                type  : 'many-to-one', // lots of blogs per account
                fkCol : 'account_id', // for this table ('blog')
                table : account, // the other table
                pkCol : 'id', // the column in the other table ('account')
            },
        },
    });

    var sql1 = blog.sqlJoin('account');
    t.equal(sql1, 'JOIN account ac ON (bl.account_id = ac.id)');

    var sql2 = blog.leftSqlJoin('account');
    t.equal(sql2, 'LEFT JOIN account ac ON (bl.account_id = ac.id)');

    t.end();
});
