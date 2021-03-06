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
		charts: 'js/lib/charts'
	},
	shim: {
		charts: {
			deps: ['jquery']
		},
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
		dst: {
			deps: ['dust', 'dust-helpers']
		}
	}
});
