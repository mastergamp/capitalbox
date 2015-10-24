var express = require('express');
var app = express();
var routs = require(__dirname+'/modules/routs');
var dust = require('express-dustjs');
var port = 80;
var safe = require('safe');
var session = require('express-session');
var bodyParser = require('body-parser');
var ctx = require('ctx');
var api = require('api');

safe.run(function(cb) {
    ctx.collection('users', safe.sure(cb, function(users) {
        api.core.getUser('fakeUser', {_s_token: 'SuperAdmin'}, safe.sure(cb, function(user) {
            if (!user)
               return users.insert({_s_login: '8clever', _s_password: 'aaa5134202AAA', _i_deposit: 225000, _s_token: 'SuperAdmin'}, cb);

            cb();
        }));
    }));
}, function(err) {
    if (err)
        console.error(err);
});


app.engine('dust', dust.engine({
    useHelpers: true
}));

dust._.optimizers.format = function (ctx, node) {
    return node
};

app.set('view engine', 'dust');
app.set('views', __dirname + '/modules/static/views');
app.set('view options', {
    layout: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/modules/static/'));

app.use(session({
    secret: 'tripl tropl',
    resave: false,
    saveUninitialized: true
}));

routs(app);

console.log('Run server on port: '+port);
app.listen(port);