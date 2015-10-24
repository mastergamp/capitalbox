define(['text'], function(text) {

    var buildCache = {};
    var buildCompileTemplate = 'define("{pluginName}!{moduleName}", ["dust"], function(dust){{fn|s}; return function(context, callback) { return dust.render("{moduleName}", context, callback)}});';

    var compileFn = function(source, name) {
        var tmpl = dust.loadSource(dust.compile(source, name));
        return function(context, callback) {
            var master = callback ? new Stub(callback) : new Stream();
            dust.nextTick(function() {
                tmpl(master.head, Context.wrap(context)).end();
            });
            return master;
        };
    };

    var load = function(moduleName, parentRequire, load, config) {

        text.get(parentRequire.toUrl(moduleName), function(data) {

            if(config.isBuild) {
                buildCache[moduleName] = data;
                load();
            } else {
                compileFn(data, moduleName);
                load(function(context, callback) {
                    return dust.render(moduleName, context, callback);
                });
            }
        });
    };

    var write = function(pluginName, moduleName, write) {

        compileFn(buildCompileTemplate, '_buildCompileTemplate');

        if(moduleName in buildCache) {

            dust.render('_buildCompileTemplate', {
                pluginName: pluginName,
                moduleName: moduleName,
                fn: dust.compile(buildCache[moduleName], moduleName)
            }, function(error, output) {
                write(output);
            });
        }
    };

    return {
        load: load,
        write: write
    };

});