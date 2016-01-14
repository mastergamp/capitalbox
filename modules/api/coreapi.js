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

var CoreApi = function() {};

CoreApi.prototype.getUser = function(token, query, cb) {
  var self = this;
  if (!query._s_token && !query._s_login)
    return safe.back(cb, new Error(400, 'Invalid request data'));

  ctx.collection('users', safe.sure(cb, function(users) {
	if (query._s_password)
		query._s_password = crypto.createHash("md5").update(query._s_password).digest("hex");
	
    users.findOne(query, cb);
  }));
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
    _s_token : 1,
    _s_login : 1,
    _s_password : 1,
    _i_deposit : 1
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
        users.findOne({
          $or: [
            {_s_login: data._s_login},
            {_s_token: data._s_token}
          ]
        }, safe.sure(cb, function(existsUser) {
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
    return safe.back(cb, new Error(400, 'Invalid request data'));

  self.getUser('fakeUser', {_s_token: token}, safe.sure(cb, function(user) {
    if (!user)
      return cb(new Error(403, 'Access forbidden'));

    cb(null, user._s_token);
  }));
};

CoreApi = new CoreApi();
module.exports = CoreApi;
