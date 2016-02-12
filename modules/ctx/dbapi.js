var engine = require('tingodb')({nativeObjectID: true});
var Db = engine.Db,
	config = require("config");
    safe = require('safe');

var db = new Db(config.db.path, {nativeObjectID: true});

module.exports.collection = function(collection, cb) {
    safe.back(cb, null,  db.collection(collection));
};

module.exports.TingoID = function(_id) {
    return engine.ObjectID(_id)
};