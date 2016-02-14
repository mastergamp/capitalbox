/**
 * Created by ivan on 16.10.15.
 */
"use strict";

var _ = require("lodash");
var safe = require("safe");
var ctx = require('ctx');
var Error = require('./errorapi.js');
var moment = require('moment');
var TingoID = ctx.TingoID;
var crypto = require("crypto");
var util = require("util");
var gdrive = require("gdrive_tingodb");
var USERS = "users";

var fields = {
	_s_login : 1,
	_s_password : 1
};


var tpl = function(name) {
	return util.format('dst!views/%s.dust', name);
};

module.exports.tpl = tpl;

var logoutProcess = function(token, cb) {
	ctx.collection(USERS, safe.sure(cb, function(users_coll) {
		users_coll.update({_s_token: token}, {$unset: {_s_token: 1}}, gdrive.callback(token, USERS, cb));
	}));
};

module.exports.logoutProcess = logoutProcess;

var loggedinProcess = function(token, query, cb) {
	safe.parallel([
		function(cb) {
			ctx.collection(USERS, cb);
		},
		function(cb) {
			getUser(token, query, cb);
		}
	], safe.sure_spread(cb, function(users_coll, user) {
		if (!user)
			return cb(new Error("Password or login is incorrect"));

		user._s_token = crypto.createHash("md5").update(user._s_login).update(moment().toDate().valueOf().toString()).digest("hex");
		users_coll.update({_id: user._id}, {$set: {_s_token: user._s_token}}, safe.sure(cb, function() {
			gdrive.updateDB(token, USERS);
			cb(null, user);
		}))
	}));
};

module.exports.loggedinProcess = loggedinProcess;

var getUser = function(token, query, cb) {
	ctx.collection(USERS, safe.sure(cb, function(users) {
		if (query._s_password)
			query._s_password = crypto.createHash("md5").update(query._s_password).digest("hex");

		users.findOne(query, cb);
	}));
};

module.exports.getUser = getUser;

var _getUser = function(token, cb) {
	getUser(token, {_s_token: token}, safe.sure(cb, function(user) {
		if (!user)
			return cb(403);

		cb(null, user);
	}))
};

module.exports._getUser = _getUser;

var prefixify = function(data) {
	if (_.isPlainObject(data)) {
		_.each(data, function(v, k) {
			var prefix = k.slice(0, 3);

			if (prefix.length < 3 || prefix == '_t_')
				delete data[k];
			else if (prefix == '_dt') {
				try {
					data[k] = moment(data[k]).toISOString();
				}
				catch(err) {
					delete data[k];
				}
			}
			else if (prefix == '_id') {
				try {
					data[k] = TingoID(data[k]);
				}
				catch(err) {
					delete data[k];
				}
			}
			else if (prefix == '_s_') {
				try {
					data[k] = data[k].toString();
				}
				catch(err) {
					delete data[k];
				}
			}
			else if (prefix == '_i_') {
				try {
					data[k] = Number(data[k]);
				}
				catch(err) {
					delete data[k];
				}
			}
			else if (prefix == '_f_') {
				try {
					data[k] = Number.parseFloat(data[k]);
				}
				catch(err) {
					delete data[k];
				}
			}
		});

		return data;
	}
	else
		return "";
};

module.exports.prefixify = prefixify;
		
var addUser = function(token, data, cb) {
	var m = null;
	
	data = prefixify(data);
	
	_.each(fields, function(v, k) {
	  if (!data[k]) {
		m = 'Invalid Insert Data';
		return false
	  }
	});
	
	if (m)
	  return safe.back(cb, new Error(m));
	
	ctx.collection(USERS, safe.sure(cb, function(users) {
		users.findOne({_s_login: data._s_login}, safe.sure(cb, function(existsUser) {
		  if (!existsUser) {
			data._s_password = crypto.createHash("md5").update(data._s_password).digest("hex");  
			users.insert(data, gdrive.callback(token, USERS, cb));
		  }
		  else
			cb(new Error('User with this login or Identifier already exists.'));
		}));
	}));
};

module.exports.addUser = addUser;

var checkAccess = function(token, cb) {
  if (!token)
    return safe.back(cb, new Error(400, 'Invalid token'));

  getUser('fakeUser', {_s_token: token}, safe.sure(cb, function(user) {
    if (!user)
      return cb(new Error(403, 'Access forbidden'));

    cb(null, user._s_token);
  }));
};

module.exports.checkAccess = checkAccess;
