
var ctx = require('ctx');
var core = require('./coreapi.js');
var safe = require('safe');
var _ = require('lodash');
var Error = require('./errorapi');
var prefixify = core.prefixify;
var TingoID = ctx.TingoID;

var FinanceApi = function() {};

FinanceApi.prototype.editFinance = function(token, data, cb) {
    data = prefixify(data);
    if (!data._s_userToken || !data._i_val || !data._s_type)
        return safe.back(cb, new Error('Identifier or value is incorrect.'));

    core.checkAccess(token, safe.sure(cb, function() {
        ctx.collection('finance', safe.sure(cb, function(finance) {
            if (data._id)
                return finance.update({_id: data._id}, {$set: _.omit(data, '_id')}, cb);

            finance.insert(data, cb);
        }));
    }));
};

FinanceApi.prototype.removeFinance = function(token, _id, cb) {
  _id = TingoID(_id);
    if (!_id)
        safe.back(cb, new Error("Invalid data _id."));

    core.checkAccess(token, safe.sure(cb, function() {
        ctx.collection('finance', safe.sure(cb, function(finance) {
            finance.remove({_id: _id}, cb);
        }));
    }));
};

FinanceApi.prototype.getFinance = function(token, query, opts, cb) {
    if (_.isFunction(opts)) {
        cb = opts;
        opts = {};
    }

    if (query._id)
        query._id = TingoID(query._id);

    core.checkAccess(token, safe.sure(cb, function() {
        var opts = opts || {};

        ctx.collection('finance', safe.sure(cb, function(finance) {
            var cursor = finance.find(query, opts.fields || {});
            if (opts.sort)
                cursor.sort(opts.sort);
            if (opts.skip)
                cursor.skip(opts.skip);
            if (opts.limit)
                cursor.limit(opts.limit);

            cursor.toArray(function(err, data) {
                cb(err, data);
            });
        }));
    }));
};

FinanceApi.prototype.getTotal = function(token, query, opts, cb) {
    var self = FinanceApi;
    safe.parallel([
        function(cb) {
            self.getFinance(token, query, opts, cb);
        },
        function(cb) {
            core.getUser(token, {_s_token: query._s_userToken}, cb);
        }
    ], safe.sure_spread(cb, function(finance, user) {
        var total = _.reduce(finance, function (memo, i) {
            if (i._s_type == 'd')
                memo += Number(i._i_val);
            else
                memo -= Number(i._i_val);

            return memo;
        }, Number(user._i_deposit));
        cb(null, total);
    }));
};

FinanceApi = new FinanceApi();
module.exports = FinanceApi;