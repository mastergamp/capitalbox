var appError; var Uniq; var appInfo; var cliRedirect;

function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}

require.config({
    baseUrl: '..',
    paths: {
        jquery: 'js/lib/jquery',
        'jquery-block': 'js/lib/jquery-block',
        bootstrap: 'js/lib/bootstrap',
        api: 'js/lib/api',
        safe: 'js/lib/safe',
        lodash: 'js/lib/lodash',
        moment: 'js/lib/moment',
        datepicker: 'js/lib/bootstrap-datepicker',
        jsonrpc: 'js/lib/jquery.jsonrpcclient',
        dust: 'js/lib/dust-full',
        dst: 'js/lib/dst',
        text: 'js/lib/text',
        'dust-helpers': 'js/lib/dust-helpers',
        d3: 'js/lib/d3'
    },
    shim: {
        bootstrap: {
            deps: ['jquery']
        },
        datepicker: {
            deps: ['bootstrap'],
            init: function() {
                loadCss('../css/bootstrap-datepicker.css');
            }
        },
        'jquery-block': {
            deps: ['jquery']
        },
        jsonrpc: {
            deps: ['jquery']
        },
        dust: {
            init: function() {
                require(['dust-helpers']);
            }
        },
        dst: {
            deps: ['dust']
        }
    }
});

Uniq = function() {
    return Math.random().toString().split('.').join('X');
};

require(['jquery', 'safe', 'jquery-block'], function($, safe) {
    var $body = $('body #body');

    cliRedirect = function(path) {
        $.blockUI();
        $.get(path, function(data) {
            safe.run(function(cb) {
                require(data.tpls, function(tpl) {
                    data.uniq = Uniq();
                    data.token = _apiToken;
                    tpl(data, safe.sure_result(cb, function(text) {
                        var $text = $(text);
                        $body.empty().append($text);
                    }));
                }, cb);
            }, function(err) {
                $.unblockUI();
                if (err)
                    console.error(err);
            })
        }).fail(function(err) {
            $.unblockUI();
            console.error(err);
        });
    };

    appError = function(err, ctx) {
        if (!err)
            return ;

        var uniq = Uniq();
        var alert;

        if (err.status)
            alert = '<div class="alert alert-danger" id="'+uniq+'"><b>'+err.status +' :</b> '+ err.statusText+'</div>';
        else
            alert = '<div class="alert alert-danger" id="'+uniq+'">'+err+'</div>';

        setTimeout(function() {
            $('#'+uniq).remove();
        }, 20000);

        if (ctx)
            return  $(ctx + ' *').first().before(alert);

        $('#content *').first().before(alert);
    };

    appInfo = function(m, ctx) {
        var uniq = Uniq();
        var alert = '<div class="alert alert-info" id="'+uniq+'">'+m+'</div>';

        setTimeout(function() {
            $('#'+uniq).remove();
        }, 20000);

        if (ctx)
            return  $(ctx + ' *').first().before(alert);

        $('#content *').first().before(alert);
    }
}, function(err) {
    if (err)
        console.error(err);
});

