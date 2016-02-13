var conf = {
	db : {
		path: __dirname + "/modules/db"
	},
	"google": {
		"DBFolder": "0B0-8vnNvFNZTV0o5NW9qelJxeVk"
	},
	"gdrive": {
		enabled: 1
	}
};

try {
	var lconf = require("./local-config");
	var _ = require("lodash");
	conf = _.merge(conf, lconf);
}
catch (err) {};

module.exports = conf;