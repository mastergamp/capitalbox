/**
 * Created by ivan on 17.10.15.
 */
var api = require('api');
var safe = require('safe');
var _ = require('lodash');
var Error = api.Error;
var moment = require('moment');
var util = require('util');

var tpl = function(name) {
    return util.format('dst!views/%s.dust', name);
};

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('layout', {token: req.session.apiToken || 'fakeUser'});
    });

    app.get('/login/api', function(req, res, next) {
        next(403);
    });

    app.get('/logout/api', function(req, res, next) {
        delete req.session.apiToken;
        next(403);
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
            if (err)
                rpc.error = err;
            else
                rpc.result = data;

            if (m.method == 'core.checkAccess')
                req.session.apiToken = data;

            res.json(rpc);
        });
    });

    app.get('/:token/main/api', function(req, res, cb) {
        if (req.session.apiToken != req.params.token)
            return safe.back(cb, 403);

        var token = req.params.token;
        api.core.checkAccess(token, safe.sure(cb, function() {
            var filter = req.query;
            var defFormat = 'DD-MM-YYYY';

            filter.from = filter.from ? filter.from : moment().subtract(7,'days').format(defFormat);
            filter.to = filter.to ? filter.to : moment().add(1, 'days').format(defFormat);

            var where = {
              _dt: {
                  $gte: moment(filter.from, defFormat).startOf('day').toISOString(),
                  $lte: moment(filter.to, defFormat).endOf('day').toISOString()
              },
              _s_userToken: token
            };

            safe.parallel([
                function(cb) {
                    api.finance.getFinance(token, where, {sort: {_dt: -1}}, cb);
                },
                function(cb) {
                    api.finance.getTotal(token, {_s_userToken: token}, {sort: {_dt: -1}}, cb);
                },
                function(cb) {
                    api.finance.getTotal(token, {_s_userToken: token}, {availability: 1}, cb);
                }
            ], safe.sure_spread(cb, function(finance, total, available) {
                res.send({
                    title: 'CapitalBox',
                    tpls: [tpl('main'), tpl('header'), tpl('finance_table_item')],
                    total: _.round(total),
                    finance: finance,
                    filter: filter,
                    available: _.round(available)
                });
            }));

       }));
    });

    app.get('/:token/charts/api', function(req, res, next) {
        if (req.session.apiToken != req.params.token)
            return safe.back(next, 403);

        var token = req.params.token;
        api.finance.getFinance(token, {}, {sort: {_dt: -1}}, safe.sure(next, function(finance) {
            finance = _.groupBy(finance, function(f) { return moment.utc(f._dt).month()});
            finance = _.map(finance, function(v, k) {
                var value = _.reduce(v, function(memo, i) {
                    if (i._s_type == 'd')
                        memo += i._i_val;
                    else
                        memo -= i._i_val;
                    return memo;
                }, 0);
               return {month: k, value: value};
            });
            var maxHeigh = _.max(finance, function(r) {return r.value}).value;
            var maxWidth = finance.length;
            _.each(finance, function(r) {
                r.month = moment.utc(r.month, 'MM').format('YYYY-MM-DD');
                r.percentH = r.value*100/maxHeigh;
                r.percentW = 100/maxWidth;
            });
            res.send({
                title: 'Charts',
                tpls: [tpl('charts'), tpl('header')],
                finance: finance
            });
        }));
    });

    app.use(function(err, req, res, next) {
        if(err == 403);
            return res.send({title: 'Login', tpls: [tpl('login')]});

        next();
    });
};