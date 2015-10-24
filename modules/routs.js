/**
 * Created by ivan on 17.10.15.
 */
var api = require('api');
var safe = require('safe');
var _ = require('lodash');
var Error = api.Error;
var moment = require('moment');

module.exports = function(app) {
    app.get('/', function(req, res) {
       res.redirect('/login')
    });

    app.get('/login', function(req, res) {
        res.render('login', {title: 'Login'});
    });

    app.get('/logout', function(req, res) {
        delete req.session.apiToken;
        res.redirect('/login');
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

    app.get('/:token/main', function(req, res, cb) {
        if (req.session.apiToken != req.params.token)
            return res.redirect('/login');

        var token = req.params.token;
        api.core.checkAccess(token, safe.sure(cb, function() {
            var filter = req.query;
            var defFormat = 'DD-MM-YYYY';

            filter.from = filter.from ? filter.from : moment().subtract(7,'days').format(defFormat);
            filter.to = filter.to ? filter.to : moment().add(1, 'days').format(defFormat);

            var where = {
              _dt: {
                  $gte: moment(filter.from, defFormat).toISOString(),
                  $lte: moment(filter.to, defFormat).toISOString()
              },
              _s_userToken: token
            };

            safe.parallel([
                function(cb) {
                    api.finance.getFinance(token, where, {sort: {_dt: -1}}, cb);
                },
                function(cb) {
                    api.finance.getTotal(token, {_s_userToken: token}, {sort: {_dt: -1}}, cb);
                }
            ], safe.sure_spread(cb, function(finance, total) {
                _.each(finance, function(r) {
                    r._dt = moment(r._dt).format('DD MMM YYYY HH:mm');
                });

                res.render('main', {
                    total: total,
                    finance: finance,
                    title: 'CapitalBox',
                    filter: filter
                });
            }));

       }));
    });
};