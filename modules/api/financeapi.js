
var ctx = require('ctx');
var core = require('./coreapi.js');
var safe = require('safe');
var _ = require('lodash');

var FinanceApi = function() {};

FinanceApi.prototype.addFinance = function(token, data, cb) {
    core.checkAccess(token, safe.sure(cb, function() {
        ctx.collection('finance', safe.sure(cb, function(finance) {
            finance.insert(data, cb);
        }));
    }));
};

FinanceApi.prototype.getFinance = function(token, query, opts, cb) {
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

            cursor.toArray(cb);
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