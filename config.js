const path = require("path");
var conf = {
	db : {
		path: __dirname + "/modules/db"
	},
	"google": {
		"DBFolder": "0B0-8vnNvFNZTZ1p6ek9kX2RYSjg"
	},
	"gdrive": {
		enabled: 1
	},
	STATIC: path.join(__dirname, "modules/static"),
	STATIC_MIN:  path.join(__dirname, "modules/static_min")
};

try {
	const lconf = require("./local-config");
	const _ = require("lodash");
	conf = _.merge(conf, lconf);
}
catch (err) {};

module.exports = conf;
