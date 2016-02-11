var cfg = require("config");
var fs = require("fs");
var safe = require("safe");
var util = require("google-drive-util");
var request = require("request");
var oauth = util.readTokenSync();
var google = require('googleapis');
var drive = google.drive({ version: 'v2', auth: oauth });
var colors = require("colors");

module.exports.syncDB = function(token, cb) {
	fs.readdir(cfg.db.path, function(err, data) {
		if (!err && data.length)
			return cb();

		fs.mkdir(cfg.db.path, safe.sure(cb, function() {
			drive.children.list({folderId: cfg.google.DBFolder}, safe.sure(cb, function(data) {
				safe.each(data.items, function(item, cb) {
					drive.files.get({fileId: item.id}, safe.sure(cb, function(item) {
						var dest = fs.createWriteStream(cfg.db.path +"/"+ item.title);
						drive.files.get({fileId: item.id, alt: "media"})
							.on('end', function() {
								console.info("Complete dowloading collection: ".blue+item.title.yellow);
							})
							.on('error', function(err) {
								console.error(err)
							})
							.pipe(dest);

						safe.back(cb);
					}))
				}, cb);
			}));
		}));
	});
};