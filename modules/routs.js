/**
 * Created by ivan on 17.10.15.
 */
var api = require('api');
var safe = require('safe');
var _ = require('lodash');
var moment = require('moment');
var util = require('util');
var fs = require('fs');

module.exports = function(app) {
    
    app.post('/:token/main/api', app.checkAccess(), function(req, res, cb) {
        var token = req.params.token;
		var filter = req.body;
		var defFormat = 'DD-MM-YYYY';
		
		api.core._getUser(token, safe.sure(cb, function(user) {
			filter.from = filter.from ? filter.from : moment().subtract(30, 'days').format(defFormat);
			filter.to = filter.to ? filter.to : moment().add(1, 'days').format(defFormat);

			var where = {
				_dt: {
					$gte: moment(filter.from, defFormat).startOf('day').toISOString(),
					$lte: moment(filter.to, defFormat).endOf('day').toISOString()
				},
				_iduser: user._id
			};
			
			safe.parallel([
				function (cb) {
					api.finance.getFinance(token, where, {sort: {_dt: -1}}, cb);
				},
				function (cb) {
					api.finance.getTotal(token, {_iduser: user._id}, {sort: {_dt: -1}}, cb);
				},
				function (cb) {
					api.finance.getTotal(token, {_iduser: user._id}, {availability: 1}, cb);
				}
			], safe.sure_spread(cb, function (finance, total, available) {
				res.send({
					title: 'CapitalBox',
					tpls: [api.core.tpl('main'), api.core.tpl('finance_table_item'), api.core.tpl('date_filter')],
					total: _.round(total),
					finance: finance,
					filter: filter,
					available: _.round(available)
				});
			}));
		}));	
    });

    app.post('/:token/charts/api', function(req, res, next) {
        var token = req.params.token;
        api.core._getUser(token, safe.sure(next, function(user) {
			api.finance.getFinance(token, {_iduser: user._id}, {sort: {_dt: -1}}, safe.sure(next, function (finance) {
				finance = _.groupBy(finance, function (f) {
					return moment.utc(f._dt).format("YYYY MMM")
				});
				finance = _.map(finance, function (v, k) {
					var value = _.reduce(v, function (memo, i) {
						if (i._s_type == 'd') {
							memo.total += i._i_val;
							memo.debet += i._i_val;
						}
						else {
							memo.total -= i._i_val;
							memo.credit += i._i_val;
						}
						return memo;
					}, {credit: 0, debet: 0, total: 0});

					return {date: k, debet: value.debet, credit: value.credit, total: value.total};
				});
				res.send({
					title: 'Charts',
					tpls: [api.core.tpl('charts')],
					debet: _.pluck(finance, 'debet'),
					credit: _.pluck(finance, 'credit'),
					total: _.pluck(finance, 'total'),
					date: _.pluck(finance, 'date')
				});
			}));
		}))	
    });
	
	app.post("/:token/notice/api", function(req, res, next) {
		var token = req.params.token;
        
        api.core._getUser(token, safe.sure(next, function(user) {
			api.finance.getNotice(token, {_iduser: user._id}, safe.sure(next, function(notices) {
				res.send({
					title: 'Notise',
					tpls: [api.core.tpl('notise')],
					notices: notices
				});
			}));
        }))
	})
};
