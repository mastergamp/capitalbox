!function(t){var s=function(s){var e=this,o=function(){};this.options=t.extend({ajaxUrl:null,headers:{},socketUrl:null,onmessage:o,onopen:o,onclose:o,onerror:o,getSocket:function(t){return e._getSocket(t)}},s),this.wsOnMessage=function(t){e._wsOnMessage(t)},this._wsSocket=null,this._wsCallbacks={},this._currentId=1,this._wsRequestQueue=[],!window.JSON&&t&&t.toJSON?this.JSON={stringify:t.toJSON,parse:t.parseJSON}:this.JSON=JSON};s.prototype.call=function(s,e,o,i){o="function"==typeof o?o:function(){},i="function"==typeof i?i:function(){};var n={jsonrpc:"2.0",method:s,params:e,id:this._currentId++},r=this.options.getSocket(this.wsOnMessage);if(null!==r)return this._wsCall(r,n,o,i),null;if(null===this.options.ajaxUrl)throw"JsonRpcClient.call used with no websocket and no http endpoint.";var a=this,c=t.ajax({type:"POST",url:this.options.ajaxUrl,contentType:"application/json",data:this.JSON.stringify(n),dataType:"json",cache:!1,headers:this.options.headers,xhrFields:this.options.xhrFields,timeout:this.options.timeout,success:function(t){"error"in t?i(t.error):o(t.result)},error:function(t,s,e){try{var o=a.JSON.parse(t.responseText);"console"in window&&console.log(o),i(o.error)}catch(n){i({error:t.responseText})}}});return c},s.prototype.notify=function(s,e){var o={jsonrpc:"2.0",method:s,params:e},i=this.options.getSocket(this.wsOnMessage);if(null!==i)return this._wsCall(i,o),null;if(null===this.options.ajaxUrl)throw"JsonRpcClient.notify used with no websocket and no http endpoint.";var n=t.ajax({type:"POST",url:this.options.ajaxUrl,contentType:"application/json",data:this.JSON.stringify(o),dataType:"json",cache:!1,headers:this.options.headers,xhrFields:this.options.xhrFields});return n},s.prototype.batch=function(t,e,o){var i=new s._batchObject(this,e,o);t(i),i._execute()},s.prototype._getSocket=function(t){if(null===this.options.socketUrl||!("WebSocket"in window))return null;if(null===this._wsSocket||this._wsSocket.readyState>1){try{this._wsSocket=new WebSocket(this.options.socketUrl)}catch(s){return null}this._wsSocket.onmessage=t;var e=this;this._wsSocket.onclose=function(t){e._wsOnClose(t)},this._wsSocket.onerror=function(t){e._wsOnError(t)}}return this._wsSocket},s.prototype._wsCall=function(t,s,e,o){var i=this.JSON.stringify(s);if("id"in s&&"undefined"!=typeof e&&(this._wsCallbacks[s.id]={successCb:e,errorCb:o}),t.readyState<1){if(this._wsRequestQueue.push(i),!t.onopen){var n=this;t.onopen=function(s){n.options.onopen(s);for(var e,o=n.options.timeout,i=0;i<n._wsRequestQueue.length;i++)e=n._wsRequestQueue[i],o&&n._wsCallbacks[e.id]&&(n._wsCallbacks[e.id].timeout=n._createTimeout(e.id)),t.send(e);n._wsRequestQueue=[]}}}else this.options.timeout&&this._wsCallbacks[s.id]&&(this._wsCallbacks[s.id].timeout=this._createTimeout(s.id)),t.send(i)},s.prototype._wsOnMessage=function(t){var s;try{s=this.JSON.parse(t.data)}catch(e){return void this.options.onmessage(t)}if("object"==typeof s&&"2.0"===s.jsonrpc){if("result"in s&&this._wsCallbacks[s.id]){var o=this._wsCallbacks[s.id].successCb;return this._wsCallbacks[s.id].timeout&&clearTimeout(this._wsCallbacks[s.id].timeout),delete this._wsCallbacks[s.id],void o(s.result)}if("error"in s&&this._wsCallbacks[s.id]){var i=this._wsCallbacks[s.id].errorCb;return delete this._wsCallbacks[s.id],void i(s.error)}}this.options.onmessage(t)},s.prototype._wsOnError=function(t){this._failAllCalls("Socket errored."),this.options.onerror(t)},s.prototype._wsOnClose=function(t){this._failAllCalls("Socket closed."),this.options.onclose(t)},s.prototype._failAllCalls=function(t){for(var s in this._wsCallbacks)if(this._wsCallbacks.hasOwnProperty(s)){var e=this._wsCallbacks[s].errorCb;e(t)}this._wsCallbacks={}},s.prototype._createTimeout=function(t){if(this.options.timeout){var s=this;return setTimeout(function(){if(s._wsCallbacks[t]){var e=s._wsCallbacks[t].errorCb;delete s._wsCallbacks[t],e("Call timed out.")}},this.options.timeout)}},s._batchObject=function(t,s,e){this._requests=[],this.jsonrpcclient=t,this.allDoneCb=s,this.errorCb="function"==typeof e?e:function(){}},s._batchObject.prototype.call=function(t,s,e,o){this._requests.push({request:{jsonrpc:"2.0",method:t,params:s,id:this.jsonrpcclient._currentId++},successCb:e,errorCb:o})},s._batchObject.prototype.notify=function(t,s){this._requests.push({request:{jsonrpc:"2.0",method:t,params:s}})},s._batchObject.prototype._execute=function(){var s=this,e=null;if(0!==this._requests.length){var o=[],i=s.jsonrpcclient.options.getSocket(s.jsonrpcclient.wsOnMessage);if(null!==i){for(var n=0,r=[],a=function(t){return s.allDoneCb?function(e){if(t(e),r.push(e),n--,0>=n){var o,i={};for(o=0;o<r.length;o++)i[r[o].id]=r[o];var a=[];for(o=0;o<s._requests.length;o++)i[s._requests[o].id]&&a.push(i[s._requests[o].id]);s.allDoneCb(a)}}:t},c=0;c<this._requests.length;c++){var l=this._requests[c];"id"in l.request&&n++,s.jsonrpcclient._wsCall(i,l.request,a(l.successCb),a(l.errorCb))}return null}for(var u={},c=0;c<this._requests.length;c++){var l=this._requests[c];o.push(l.request),"id"in l.request&&(u[l.request.id]={successCb:l.successCb,errorCb:l.errorCb})}var h=function(t){s._batchCb(t,u,s.allDoneCb)};if(null===s.jsonrpcclient.options.ajaxUrl)throw"JsonRpcClient.batch used with no websocket and no http endpoint.";return e=t.ajax({url:s.jsonrpcclient.options.ajaxUrl,contentType:"application/json",data:this.jsonrpcclient.JSON.stringify(o),dataType:"json",cache:!1,type:"POST",headers:s.jsonrpcclient.options.headers,xhrFields:s.jsonrpcclient.options.xhrFields,error:function(t,e,o){s.errorCb(t,e,o)},success:h})}},s._batchObject.prototype._batchCb=function(t,s,e){for(var o=0;o<t.length;o++){var i=t[o];"error"in i?null!==i.id&&i.id in s?s[i.id].errorCb(i.error):"console"in window&&console.log(i):!(i.id in s)&&"console"in window?console.log(i):s[i.id].successCb(i.result)}"function"==typeof e&&e(t)},t.JsonRpcClient=s}(this.jQuery);