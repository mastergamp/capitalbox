define(["jquery","jsonrpc"],function(n){var r=new n.JsonRpcClient({ajaxUrl:"/jsonrpc"});return{call:function(){var n=arguments[arguments.length-1],e=arguments[0],a=new Array(arguments.length-1);a[0]=_apiToken;for(var t=1,u=arguments.length-1;u>t;t++)a[t]=arguments[t];r.call(e,a,function(r){n(null,r)},function(r){n(r)})}}});