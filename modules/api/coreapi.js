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

var CoreApi = function() {};

CoreApi.prototype.tpl = function(name) {
	return util.format('dst!views/%s.dust', name);
};

CoreApi.prototype.logoutProcess = function(token, cb) {
	var self = CoreApi;
	
	ctx.collection("users", safe.sure(cb, function(users_coll) {
		users_coll.update({_s_token: token}, {$unset: {_s_token: 1}}, cb);
	}));	
};

CoreApi.prototype.loggedinProcess = function(token, query, cb) {
	var self = CoreApi;
	
	safe.parallel([
		function(cb) {
			ctx.collection("users", cb);
		},
		function(cb) {
			self.getUser(token, query, cb);
		}	
	], safe.sure_spread(cb, function(users_coll, user) {
		if (!user)
			return cb(new Error("Password or login is incorrect"));

		user._s_token = crypto.createHash("md5").update(user._s_login).update(moment().toDate().valueOf().toString()).digest("hex");
		users_coll.update({_id: user._id}, {$set: {_s_token: user._s_token}}, safe.sure(cb, function() {
			cb(null, user);
		}))
	}));
};

CoreApi.prototype.getUser = function(token, query, cb) {
  ctx.collection('users', safe.sure(cb, function(users) {
	if (query._s_password)
		query._s_password = crypto.createHash("md5").update(query._s_password).digest("hex");
	
    users.findOne(query, cb);
  }));
};

CoreApi.prototype._getUser = function(token, cb) {
	var self = CoreApi;
	
	self.getUser(token, {_s_token: token}, safe.sure(cb, function(user) {
		if (!user)
			return cb(403);
			
		cb(null, user);	
	}))
};

CoreApi.prototype.prefixify = function(data) {
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

(function() {
  var fields = {
    _s_login : 1,
    _s_password : 1
  };

  CoreApi.prototype.addUser = function(token, data, cb) {
    var self = CoreApi; var m = null;

    data = self.prefixify(data);

    _.each(fields, function(v, k) {
      if (!data[k]) {
        m = 'Invalid Insert Data';
        return false
      }
    });

    if (m)
      return safe.back(cb, new Error(m));

    ctx.collection('users', safe.sure(cb, function(users) {
        users.findOne({_s_login: data._s_login}, safe.sure(cb, function(existsUser) {
          if (!existsUser) {
			data._s_password = crypto.createHash("md5").update(data._s_password).digest("hex");  
			users.insert(data, cb);
		  }
          else
            cb(new Error('User with this login or Identifier already exists.'));
        }));
    }));
  };
})();

CoreApi.prototype.checkAccess = function(token, cb) {
  var self = CoreApi;
  if (!token)
    return safe.back(cb, new Error(400, 'Invalid token'));

  self.getUser('fakeUser', {_s_token: token}, safe.sure(cb, function(user) {
    if (!user)
      return cb(new Error(403, 'Access forbidden'));

    cb(null, user._s_token);
  }));
};

CoreApi = new CoreApi();
module.exports = CoreApi;
