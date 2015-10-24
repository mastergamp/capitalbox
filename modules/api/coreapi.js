/**
 * Created by ivan on 16.10.15.
 */
"use strict";

var _ = require("lodash");
var safe = require("safe");
var ctx = require('ctx');
var Error = require('./errorapi.js');

var CoreApi = function() {};

CoreApi.prototype.getUser = function(token, query, cb) {
  var self = this;
  if (!query._s_token && !query._s_login)
    return safe.back(cb, new Error(400, 'Invalid request data'));

  ctx.collection('users', safe.sure(cb, function(users) {
    users.findOne(query, cb);
  }));
};

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
