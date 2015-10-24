var Db = require('tingodb')().Db,
    safe = require('safe');

var db = new Db(__dirname + '/../db', {});

var DbApi = function() {};

DbApi.prototype.collection = function(collection, cb) {
    var collection = db.collection(collection);
    safe.back(cb, null, collection);
};

module.exports = DbApi;