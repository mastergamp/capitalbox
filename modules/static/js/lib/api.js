define(['jquery', 'jsonrpc'], function($) {
    var server = new $.JsonRpcClient({ ajaxUrl: '/jsonrpc' });

    return {
        call: function() {
            var self = this;
            var cb = arguments[arguments.length - 1];
            var fname = arguments[0];

            var args = new Array(arguments.length - 1);
            args[0] = _apiToken;
            for (var i = 1, l = arguments.length - 1; i < l; i++)
                args[i] = arguments[i];

            server.call(
                fname, args,
                function(data) {
                    cb(null, data)
                },
                function(err) {
                    cb(err);
                }
            );
        }
    };
});