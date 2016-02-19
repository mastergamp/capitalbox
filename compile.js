var api = require("api");
var safe = require("safe");
var exec = require( 'child_process' ).exec;
var fs = require("fs");
var minifyjs = require("minify");
var cfg = require("config");
var pathNode = require("path");
var colors = require("colors");

var minify = function(cb) {
	var files = [];
	
	function regexp(path) {
		var regstr;
		
		try {
			regstr = cfg.STATIC.split("\\").join("\\\\");
		} catch(err) {}
		
		return path.replace(new RegExp(regstr, 'g'), cfg.STATIC_MIN)
	}
	
	function readDir(path, cb) {
		fs.readdir(path, safe.sure(cb, function(readdir) {
			safe.each(readdir, function(file, cb) {
				var infile = pathNode.join(path, file);
				fs.lstat(infile, safe.sure(cb, function(lstat) {
					safe.run(function(cb) {
						if (lstat.isFile()) {
							files.push(infile);
							return cb();
						}
						else if (lstat.isDirectory()) {
							return fs.mkdir(regexp(infile), safe.sure(cb, function() {
								readDir(infile, cb);
							}));
						}
						else
							cb();
					}, cb)
				}))
			}, cb)
		}));
	}

	readDir(cfg.STATIC, safe.sure(cb, function() {
		safe.each(files, function(file, cb) {
			minifyjs(file, function(err, buff) {
				var thisminpath = regexp(file);

				safe.run(function(cb) {
					if (!err)
						return cb(null, buff);

					fs.readFile(file, cb);
				}, safe.sure(cb, function(buff) {
					fs.writeFile(thisminpath, buff, cb);
				}));
			});
		}, cb)
	}));
};

console.time("Compile Success ".green);
safe.run(function(cb) {
	exec( 'rm -rf ' + cfg.STATIC_MIN, safe.sure(cb, function (stdout, stderr){
		fs.mkdir(cfg.STATIC_MIN, safe.sure(cb, function() {
			minify(cb);
		}));
	}));
}, function(err) {
	if (err)
		return console.error(err);

	console.timeEnd("Compile Success ".green);
});

