// ----------------------------------------------------------------------------
//
// squeal.js - Create your SQL more easily.
//
// Copyright (c) 2013 Andrew Chilton. All Rights Reserved.
//
// License : MIT - http://chilts.mit-license.org/2013/
//
// ----------------------------------------------------------------------------

function Table(definition) {
    if ( !definition.pk ) {
        throw new Error("provide a pk for this table");
    }
    if ( !definition.name ) {
        throw new Error("provide a name for this table");
    }

    var self = this;

    // save some details
    self.name   = definition.name;
    self.pk     = definition.pk;
    if ( definition.schema ) {
        self.schema = definition.schema
    }
    if ( definition.prefix ) {
        self.prefix = definition.prefix;
    }
    self.ro = definition.ro || [ self.pk ];
    self.rw = definition.rw || [];

    // generate some things for use later
    self.cols = [];
    if ( self.ro.length ) {
        self.cols = self.cols.concat(self.ro);
    }
    if ( self.rw.length ) {
        self.cols = self.cols.concat(self.rw);
    }

    // remember these columns for easier lookup
    self.col = {};
    self.cols.forEach(function(col) {
        self.col[col] = true;
    });

    // generate some helper sql
    self.sql = {};
    self.sql.tablename = self.name;
    if ( self.schema ) {
        self.sql.tablename = self.schema + "." + self.name;
    }
    self.sql.fqn = self.sql.tablename;
    if ( self.prefix ) {
        self.sql.fqn += " " + self.prefix;
    }
}

Table.prototype.selAll = function(cols) {
    var self = this;
    cols = cols || self.cols;
    cols.sort();
    var sql = "SELECT " + self.colsToSel(cols) + " FROM " + self.sql.fqn;
    return {
        sql  : sql,
        vals : []
    };
};

Table.prototype.sel = function(opts) {
    var self = this;
    opts = opts || { cols : self.cols };

    if ( Array.isArray(opts) ) {
        opts = {
            cols : opts,
        };
    }

    // Want: opts.cols, opts.where, opts.orderBy, opts.limit, opts.offset
    opts.cols = opts.cols || self.cols;
    opts.cols.sort();

    // now make the sql
    var sql = "SELECT " + self.colsToSel(opts.cols) + " FROM " + self.sql.fqn;
    var vals = [];
    if ( opts.where ) {
        sql += " " + self.where(opts.where);
        vals = Object.keys(opts.where).sort().map(function(c) { return opts.where[c]; });
    }
    if ( opts.orderBy ) {
        sql += " " + self.orderBy(opts.orderBy);
    }
    if ( opts.limit ) {
        sql += " LIMIT " + opts.limit;
    }
    if ( opts.offset ) {
        sql += " OFFSET " + opts.offset;
    }
    return {
        sql  : sql,
        vals : vals,
    };
};

Table.prototype.ins = function(obj) {
    var self = this;

    // check input is an object
    if ( typeof obj !== 'object' ) {
        throw new Error('squeal.ins(): obj should be an object, it is a ' + typeof obj);
    }

    // check all the cols given are in the table
    var cols = Object.keys(obj).sort();
    cols.forEach(function(col) {
        if ( col in self.col ) {
            return;
        }
        throw new Error('Columns ' + col + ' does not exist in table ' + self.sql.tablename);
    });

    // sql
    var into = cols.join(", ");
    var placeholders = cols.map(function(field, i) { return '$' + (i+1); }).join(", ");

    // val
    var vals = cols.map(function(c) { return obj[c]; });

    return {
        sql  : "INSERT INTO " + self.sql.tablename + "(" + into + ") VALUES(" + placeholders + ") RETURNING " + self.colsToReturning(self.cols),
        vals : vals,
    };
};

Table.prototype.updAll = function(obj) {
    var self = this;

    // check all the cols given are in the table
    var cols = Object.keys(obj).sort();
    cols.forEach(function(col) {
        if ( col in self.col ) {
            return;
        }
        throw new Error('Columns ' + col + ' does not exist in table ' + self.sql.tablename);
    });

    var i = 0;

    // sql
    var cols = Object.keys(obj).sort();
    var sets = cols.map(function(c) {
        i++;
        return (self.prefix ? self.prefix + '.' : '') + c + ' = $' + i;
    }).join(', ');

    // vals
    var vals = cols.map(function(c) { return obj[c]; });

    return {
        sql  : "UPDATE " + self.sql.fqn + " SET " + sets,
        vals : vals,
    };
};

Table.prototype.updPk = function(obj, pkVal) {
    var self = this;

    var i = 0;

    // sql
    var cols = Object.keys(obj).sort();
    var sets = cols.map(function(c) {
        i++;
        return (self.prefix ? self.prefix + '.' : '') + c + ' = $' + i;
    }).join(', ');

    // val
    var vals = cols.map(function(c) { return obj[c]; });
    vals.push(pkVal);

    return {
        sql  : "UPDATE " + self.sql.fqn + " SET " + sets + " " + self.where(self.pk, i),
        vals : vals,
    };
};

Table.prototype.updWhere = function(obj, where) {
    var self = this;

    var i = 0;

    // sql
    var cols = Object.keys(obj).sort();
    var sets = cols.map(function(c) {
        i++;
        return (self.prefix ? self.prefix + '.' : '') + c + ' = $' + i;
    }).join(', ');

    // vals
    var vals = cols.map(function(c) { return obj[c]; });
    Object.keys(where).sort().forEach(function(c) {
        vals.push(where[c]);
    });

    return {
        sql  : "UPDATE " + self.sql.fqn + " SET " + sets + " " + self.where(where, i),
        vals : vals,
    };
};

Table.prototype.delAll = function() {
    var self = this;
    return {
        sql  : "DELETE FROM " + self.sql.fqn,
        vals : [],
    };
};

Table.prototype.delPk = function(val) {
    var self = this;
    return {
        sql  : "DELETE FROM " + self.sql.fqn + " " + self.where(self.pk),
        vals : [ val ],
    };
};

Table.prototype.delWhere = function(where) {
    var self = this;

    // sql
    var sql = "DELETE FROM " + self.sql.fqn + " " + self.where(where);

    // vals
    var vals = [];
    Object.keys(where).sort().forEach(function(c) {
        vals.push(where[c]);
    });

    return {
        sql  : sql,
        vals : vals,
    };
};

// ----------------------------------------------------------------------------
// sql helpers

Table.prototype.colsToSel = function(cols) {
    var self = this;
    return cols.map(function(c) {
        return self.prefix ? self.prefix + '.' + c + ' AS ' + self.prefix + '_' + c : c;
    }).join(', ');
}

Table.prototype.colsToReturning = function(cols) {
    var self = this;
    return cols.map(function(c) {
        return self.prefix ? c + ' AS ' + self.prefix + '_' + c : c;
    }).join(', ');
}

Table.prototype.where = function(where, currentIndex) {
    var self = this;

    var i = currentIndex || 0;

    if ( typeof where == 'object' ) {
        var whereClause = Object.keys(where).sort().map(function(c) {
            i++;
            return self.prefix ? self.prefix + '.' + c + ' = $' + i : c + ' = $' + i;
        }).join(' AND ');
        return 'WHERE ' + whereClause;
    }

    if ( typeof where === 'string' ) {
        i++;
        return 'WHERE ' + (self.prefix ? self.prefix + '.' : '') + where + ' = $' + i;
    }

    throw new Error("provide an object or a column name for the where clause");
}

Table.prototype.orderBy = function(orderBy) {
    var self = this;
    // orderBy should be an array
    return orderBy.map(function(col) {
        return self.prefix ? self.prefix + '.' + col : col;
    }).join(', ');
}

// ----------------------------------------------------------------------------

module.exports = function(definition) {
    return new Table(definition);
}

// ----------------------------------------------------------------------------
