/**
 * Created by ivan on 17.10.15.
 */
var api = require('api');
var safe = require('safe');
var _ = require('lodash');
var Error = api.Error;
var moment = require('moment');
var util = require('util');
var fs = require('fs');
var ugli = require('uglify-js');

var tpl = function(name) {
    return util.format('dst!views/%s.dust', name);
};

module.exports = function(app) {
    app.use(function(req, res, next) {
        req.header('Cache-Control', 'max-age=7200');
        next();
    });
    
    var files = [
        {type: 'script', path: __dirname + '/static/js/require.js'},
        {type: 'script', path: __dirname + '/static/js/app.js'},
        {type: 'css', path: __dirname + '/static/css/bootstrap.css'}
    ];
    
    var layoutHTML = '';
    
    _.each(files, function(file) {
        var str;
        
        if (file.type == 'script') {
            str = ugli.minify(file.path).code;
            str = util.format('%s%s%s', '<script>', str, '</script>');
        }
            
        if (file.type == 'css') {
            str = fs.readFileSync(file.path);
            str = util.format('%s%s%s', '<style>', str, '</style>');
        }
            
        layoutHTML += str;
    });
    
    app.get('/', function(req, res, next) {
        res.render('layout', {token: req.session.apiToken || 'fakeUser'}, safe.sure(next, function(html) {
            html = html.replace(/<include><\/include>/, layoutHTML);
            res.send(html);
        }));
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
        api.finance.getFinance(token, {_s_userToken: token}, {sort: {_dt: -1}}, safe.sure(next, function(finance) {
            finance = _.groupBy(finance, function(f) { return moment.utc(f._dt).format("YYYY MMM")});
            finance = _.map(finance, function(v, k) {
                var value = _.reduce(v, function(memo, i) {
                    if (i._s_type == 'd')
                        memo.debet += i._i_val;
                    else
                        memo.credit += i._i_val;
                    return memo;
                }, {credit: 0, debet: 0});
               return {date: k, debet: value.debet, credit: value.credit};
            });
            res.send({
                title: 'Charts',
                tpls: [tpl('charts'), tpl('header')],
                debet: _.pluck(finance, 'debet'),
                credit: _.pluck(finance, 'credit'),
                date: _.pluck(finance, 'date')
            });
        }));
    });

    app.use(function(err, req, res, next) {
        if(err == 403);
            return res.send({title: 'Login', tpls: [tpl('login')]});

        next();
    });
};