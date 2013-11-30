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

    // save some details
    this.name   = definition.name;
    this.pk     = definition.pk;
    if ( definition.schema ) {
        this.schema = definition.schema
    }
    if ( definition.prefix ) {
        this.prefix = definition.prefix;
    }
    this.ro = definition.ro || [ this.pk ];
    this.rw = definition.rw || [];

    // generate some things for use later
    this.cols = [];
    if ( this.ro.length ) {
        this.cols = this.cols.concat(this.ro);
    }
    if ( this.rw.length ) {
        this.cols = this.cols.concat(this.rw);
    }

    // generate some helper sql
    this.sql = {};
    this.sql.tablename = this.name;
    if ( this.schema ) {
        this.sql.tablename = this.schema + "." + this.name;
    }
    this.sql.fqn = this.sql.tablename;
    if ( this.prefix ) {
        this.sql.fqn += " " + this.prefix;
    }
}

Table.prototype.selAll = function(cols) {
    var self = this;
    cols = cols || this.cols;
    cols.sort();
    var sql = "SELECT " + self.colsToSel(cols) + " FROM " + this.sql.fqn;
    return {
        sql : sql,
        val : []
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
    opts.cols = opts.cols || this.cols;
    opts.cols.sort();

    // now make the sql
    var sql = "SELECT " + self.colsToSel(opts.cols) + " FROM " + this.sql.fqn;
    var val = [];
    if ( opts.where ) {
        sql += " " + this.where(opts.where);
        val = Object.keys(opts.where).sort().map(function(c) { return opts.where[c]; });
    }
    if ( opts.orderBy ) {
        sql += " " + this.orderBy(opts.orderBy);
    }
    if ( opts.limit ) {
        sql += " LIMIT " + opts.limit;
    }
    if ( opts.offset ) {
        sql += " OFFSET " + opts.offset;
    }
    return {
        sql : sql,
        val : val,
    };
};

Table.prototype.ins = function(obj) {
    var self = this;

    // sql
    var cols = Object.keys(obj).sort();
    var into = cols.join(", ");
    var placeholders = cols.map(function(field, i) { return '$' + (i+1); }).join(", ");

    // val
    var val = cols.map(function(c) { return obj[c]; });

    return {
        sql : "INSERT INTO " + this.sql.tablename + "(" + into + ") VALUES(" + placeholders + ") RETURNING " + this.colsToReturning(this.cols),
        val : val,
    };
};

Table.prototype.updAll = function(obj) {
    var self = this;

    var i = 0;

    // sql
    var cols = Object.keys(obj).sort();
    var sets = cols.map(function(c) {
        i++;
        return (self.prefix ? self.prefix + '.' : '') + c + ' = $' + i;
    }).join(', ');

    // val
    var val = cols.map(function(c) { return obj[c]; });

    return {
        sql : "UPDATE " + this.sql.fqn + " SET " + sets,
        val : val
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
    var val = cols.map(function(c) { return obj[c]; });
    val.push(pkVal);

    return {
        sql : "UPDATE " + this.sql.fqn + " SET " + sets + " " + this.where(this.pk, i),
        val : val
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

    // val
    var val = cols.map(function(c) { return obj[c]; });
    Object.keys(where).sort().forEach(function(c) {
        val.push(where[c]);
    });

    return {
        sql : "UPDATE " + this.sql.fqn + " SET " + sets + " " + this.where(where, i),
        val : val,
    };
};

Table.prototype.delAll = function() {
    var self = this;
    return {
        sql : "DELETE FROM " + this.sql.fqn,
        val : [],
    };
};

Table.prototype.delPk = function(val) {
    var self = this;
    return {
        sql : "DELETE FROM " + this.sql.fqn + " " + this.where(this.pk),
        val : [ val ],
    };
};

Table.prototype.delWhere = function(where) {
    var self = this;

    // sql
    var sql = "DELETE FROM " + this.sql.fqn + " " + this.where(where);

    // val
    var val = [];
    Object.keys(where).sort().forEach(function(c) {
        val.push(where[c]);
    });

    return {
        sql : sql,
        val : val,
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
