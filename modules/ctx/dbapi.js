var engine = require('tingodb')({nativeObjectID: true});
var Db = engine.Db,
	config = require("config");
    safe = require('safe');

var db = new Db(config.db.path, {nativeObjectID: true});

var DbApi = function() {};

DbApi.prototype.collection = function(collection, cb) {
    var collection = db.collection(collection);
    safe.back(cb, null, collection);
};

DbApi.prototype.TingoID = function(_id) {
    return engine.ObjectID(_id)
};

module.exports = DbApi;