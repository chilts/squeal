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
        this.sql.tablename = this.schema + '.' + this.name;
    }
    if ( this.prefix ) {
        this.sql.tablename += ' ' + this.prefix;
    }
}

Table.prototype.colsToSel = function(cols) {
    var self = this;
    return cols.map(function(c) {
        return self.prefix ? self.prefix + '.' + c + ' AS ' + self.prefix + '_' + c : c;
    }).join(', ');
}

Table.prototype.selAll = function() {
    var self = this;
    var sql = "SELECT " + self.colsToSel(this.cols) + " FROM " + this.sql.tablename;
    return sql;
};

module.exports = function(definition) {
    return new Table(definition);
}
