var express = require('express');
var app = express();
var routs = require(__dirname+'/modules/routs');
var dust = require('express-dustjs');
var port = 80;
var safe = require('safe');
var session = require('express-session');
var bodyParser = require('body-parser');
var ctx = require('ctx');
var api = require('api');
var mollify = require("mollify");
var staticPath = __dirname + '/modules/static/';
var compression = require('compression');
var _ = require("lodash");
var path = require("path");
var gm = require('gm').subClass({imageMagick: true});

app.engine('dust', dust.engine({
    useHelpers: true
}));

dust._.optimizers.format = function (ctx, node) {
    return node
};

app.use(mollify({
    dir: staticPath
}));

app.set('view engine', 'dust');
app.set('views', __dirname + '/modules/static/views');
app.set('view options', {
    layout: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(staticPath));

app.use(session({
    secret: 'tripl tropl',
    resave: false,
    saveUninitialized: true
}));

app.get('/', function(req, res, next) {
	res.render('layout', {token: req.session.apiToken || 'fakeUser'});
});

app.post('/:token/login/api', function(req, res, next) {
	next(403);
});

app.post('/:token/logout/api', function(req, res, next) {
	api.core.logoutProcess(req.session.apiToken, safe.sure(next, function() {
		delete req.session.apiToken;
		next(403);
	}))
});

app.post('/jsonrpc', function(req, res, cb) {
	if (!req.xhr)
		return safe.back(cb, new Error(400, 'Invalid request data'));

	var m = req.body;

	safe.run(function(cb) {
		if (m.params[1])
			_.get(api, m.method)(m.params[0], m.params[1], cb);
		else
			_.get(api, m.method)(m.params[0], cb);
	}, function(err, data) {
		var rpc = {"jsonrpc":"2.0"};
		if (err) {
			if (!err.custom) {
				console.error(err.stack);
				err.code = 500;
				err.statusText = "Internal Server Error";
			}
			rpc.error = err;
		}
		else {
			if (m.method == 'core.loggedinProcess')
				req.session.apiToken = data._s_token;

			rpc.result = data;
		}
		res.json(rpc);
	});
});

app.checkAccess = function() {
	return function(req, res, next) {
		if (req.session.apiToken != req.params.token)
			return safe.back(next, 403);
			
		api.core.checkAccess(req.session.apiToken, safe.sure(next, function() {
			next();
		}))
	}
};

routs(app);

app.use(function(err, req, res, next) {
	if(err == 403)
		return res.send({title: 'Login', tpls: [api.core.tpl('login')]});

	if (!err.custom) {
		console.error(err.stack);
		return res.sendStatus(500);
	}
	
	next();
});

app.get('/image/:name', function(req, res, next) {
	var image = path.join(__dirname,  '/modules/static/img/',  req.params.name);
	var query = req.query;
	var resX = query.resx || 320;
	var resY = query.resy || 240;
	var cursor = gm(image).resize(resX, resY);

	if (query.blur)
		cursor.blur(query.blur, query.blur/2);

	cursor.toBuffer('JPEG',safe.sure(next, function(buffer) {
		res.send(buffer);
	}))
});

console.log('Run server on port: '+port);
app.listen(port);
