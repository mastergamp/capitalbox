var cfg = require("config");
var fs = require("fs");
var safe = require("safe");
var util = require("google-drive-util");
var oauth = util.readTokenSync();
var google = require('googleapis');
var drive2 = google.drive({ version: 'v2', auth: oauth });
var path = require("path");
var _ = require("lodash");
var cacheFileLists = [];

var queue = safe.queue(safe.trap(function(data, cb) {
	var fn = function () {
		data.worker(cb);
	};
	fn.apply(this,arguments);
}), 1);

var eventWriteStream = function (token, dbname) {
	if (!cfg.gdrive.enabled)
		return ;
	
	queue.push({
		worker:function (cb) {
			getDriveFileLists(token, function(cb) {
				return function(item) {
					if (item.title != dbname)
						return cb();

					var path_ = path.join(cfg.db.path, dbname);
					fs.readFile(path_, safe.sure(cb, function(file) {
						drive2.files.update({
							fileId: item.id,
							media: {
								mimeType: "text/plain",
								body: file
							}
						}, cb)
					}));
				}
			}, function(err) {
				cb();
				
				if (err)
					return console.error(err);
	
				console.log("Success upload file: ".blue + dbname.yellow);
			});
		}
	});
};

var callback = function(token, dbname, cb) {
	return safe.sure(cb, function(result) {
		eventWriteStream(token, dbname);
		cb(null, result);
	})
};

var getDriveFileLists = function(token, fn, cb) {
	safe.run(function(cb) {
		if (cacheFileLists.length)
			return cb(null, cacheFileLists);

		drive2.children.list({folderId: cfg.google.DBFolder}, cb);
	}, safe.sure(cb, function(dataDrive) {
		safe.each(dataDrive.items, function (item, cb) {
			drive2.files.get({fileId: item.id, fields: "title,id"}, safe.sure(cb, fn(cb)));
		}, cb);
	}));
};

var syncDB = function(token) {
	if (!cfg.gdrive.enabled)
		return ;
		
	safe.auto({
		readdir: function (cb) {
			fs.readdir(cfg.db.path, function (err, dataCurr) {
				cb(null, dataCurr || [])
			});
		},
		mkdir: function (cb) {
			fs.mkdir(cfg.db.path, function () {
				cb(null);
			});
		},
		driveDownload: ["readdir", function (cb, result) {
			getDriveFileLists(token, function(cb) {
				return function(item) {
					if (_.contains(result.readdir, item.title))
						return safe.back(cb);

					var dest = fs.createWriteStream(cfg.db.path + "/" + item.title);
					drive2.files.get({fileId: item.id, alt: "media"})
						.on('end', function () {
							console.info("Complete downloading collection: ".blue + item.title.yellow);
						})
						.on('error', function (err) {
							console.error(err)
						})
						.pipe(dest);

					safe.back(cb);
				}
			}, cb);
		}]
	}, function(err) {
		if (err)
			console.error(err)
	});
};

var updateDB = function(token, dbname) {
	eventWriteStream(token, dbname);
};

setInterval(syncDB, 1000 * 60 * 10);

module.exports.eventWriteStream = eventWriteStream;
module.exports.updateDB = updateDB;
module.exports.syncDB = syncDB;
module.exports.callback = callback;
