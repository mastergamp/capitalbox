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
var gm = require('gm').subClass({imageMagick: true});
var tpl = function(name) {
    return util.format('dst!views/%s.dust', name);
};

module.exports = function(app) {
    var files = [
        {type: 'script', path: __dirname + '/static/js/require.js'},
        {type: 'script', path: __dirname + '/static/js/app.js'}
    ];
    
    var scripts = '';
    
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
            
        scripts += str;
    });
    
    app.get('/', function(req, res, next) {
        res.render('layout', {token: req.session.apiToken || 'fakeUser'}, safe.sure(next, function(html) {
            html = html.replace(/<include><\/include>/, scripts);
            res.send(html);
        }));
    });

    app.post('/:token/login/api', function(req, res, next) {
        next(403);
    });

    app.post('/:token/logout/api', function(req, res, next) {
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

    app.post('/:token/main/api', function(req, res, cb) {
        if (req.session.apiToken != req.params.token)
            return safe.back(cb, 403);

        var token = req.params.token;
        api.core.checkAccess(token, safe.sure(cb, function() {
            var filter = req.body;
            var defFormat = 'DD-MM-YYYY';

            filter.from = filter.from ? filter.from : moment().subtract(30,'days').format(defFormat);
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

    app.post('/:token/charts/api', function(req, res, next) {
        if (req.session.apiToken != req.params.token)
            return safe.back(next, 403);

        var token = req.params.token;
        api.finance.getFinance(token, {_s_userToken: token}, {sort: {_dt: -1}}, safe.sure(next, function(finance) {
            finance = _.groupBy(finance, function(f) { return moment.utc(f._dt).format("YYYY MMM")});
            finance = _.map(finance, function(v, k) {
                var value = _.reduce(v, function(memo, i) {
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
                tpls: [tpl('charts'), tpl('header')],
                debet: _.pluck(finance, 'debet'),
                credit: _.pluck(finance, 'credit'),
                total: _.pluck(finance, 'total'),
                date: _.pluck(finance, 'date')
            });
        }));
    });
    
    app.use(function(err, req, res, next) {
        if(err == 403);
            return res.send({title: 'Login', tpls: [tpl('login')]});

        next();
    });
    
    app.get('/image/:name', function(req, res, next) {
        var image = __dirname + '/static/img/' + req.params.name;
        var query = req.query;
        var resX = query.resx || 320;
        var resY = query.resy || 240;
        var cursor = gm(image).resize(resX, resY);
        
        if (query.blur)
            cursor.blur(query.blur, query.blur/2);
            
        cursor.toBuffer('JPEG',safe.sure(next, function(buffer) {
            res.send(buffer);
        }))
    });
};
