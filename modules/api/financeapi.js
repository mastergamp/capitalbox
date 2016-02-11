
var ctx = require('ctx');
var core = require('./coreapi.js');
var safe = require('safe');
var _ = require('lodash');
var Error = require('./errorapi');
var prefixify = core.prefixify;
var TingoID = ctx.TingoID;

var FinanceApi = function() {};

FinanceApi.prototype.editNotice = function(token, notice, cb) {
	notice = prefixify(notice);
	if (!notice._s_title)
		return cb(new Error('Notice invalid Title.'));
	
	safe.parallel([
		function(cb) {
			ctx.collection('notice', cb);
		},
		function(cb) {
			core._getUser(token, cb);	
		}
	], safe.sure_spread(cb, function(notice_coll, user) {
		notice._iduser = user._id;
	
		if (notice._id)
			return notice_coll.update({_id: notice._id}, {$set: _.omit(notice, "_id")}, cb);
		
		notice_coll.insert(notice, cb);
	}));
};

FinanceApi.prototype.removeNotice = function(token, _id, cb) {
	_id = TingoID(_id);
    if (!_id)
        safe.back(cb, new Error("Invalid data _id."));
	
	ctx.collection('notice', safe.sure(cb, function(notice_coll) {
		notice_coll.remove({_id: _id}, cb);
	}));
}

FinanceApi.prototype.getNotice = function(token, query, cb) {
	 ctx.collection('notice', safe.sure(cb, function(notice_coll) {
		notice_coll.find(query).toArray(cb);
	}));
};

FinanceApi.prototype.editFinance = function(token, data, cb) {
    data = prefixify(data);
    if (!data._i_val || !data._s_type)
        return safe.back(cb, new Error('Value is incorrect.'));
    
    safe.parallel([
    	function(cb) {
			ctx.collection('finance', cb);
    	},
    	function(cb) {
    		core.getUser(token, {_s_token: token}, cb);
    	}
    ], safe.sure_spread(cb, function(finance_coll, user) {
    	data._iduser = user._id;
		if (data._id)
			return finance_coll.update({_id: data._id}, {$set: _.omit(data, '_id')}, cb);

		finance_coll.insert(data, cb);
    }));
};

FinanceApi.prototype.removeFinance = function(token, _id, cb) {
  _id = TingoID(_id);
    if (!_id)
        safe.back(cb, new Error("Invalid data _id."));

	ctx.collection('finance', safe.sure(cb, function(finance) {
		finance.remove({_id: _id}, cb);
	}));
};

FinanceApi.prototype.getFinance = function(token, query, opts, cb) {
    if (_.isFunction(opts)) {
        cb = opts;
        opts = {};
    }

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
};

FinanceApi.prototype.getTotal = function(token, query, opts, cb) {
    var self = FinanceApi;
	
	self.getFinance(token, query, opts, safe.sure(cb, function(finance) {
        var total = _.reduce(finance, function (memo, i) {
            if (i._s_type == 'd')
                memo += Number(opts.availability ? i._i_val/2 : i._i_val);
            else
                memo -= Number(i._i_val);

            return memo;
        }, 0);
        
        cb(null, total);
    }));
};

FinanceApi = new FinanceApi();
module.exports = FinanceApi;