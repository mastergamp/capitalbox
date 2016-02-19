!function(t,e){"function"==typeof define&&define.amd&&define.amd.dust===!0?define("dust.core",[],e):"object"==typeof exports?module.exports=e():t.dust=e()}(this,function(){function getTemplate(t,e){return t?"function"==typeof t&&t.template?t.template:dust.isTemplateFn(t)?t:e!==!1?dust.cache[t]:void 0:void 0}function load(t,e,r){if(!t)return e.setError(new Error("No template or template name provided to render"));var n=getTemplate(t,dust.config.cache);return n?n(e,Context.wrap(r,n.templateName)):dust.onLoad?e.map(function(e){function n(t,n){var i;if(t)return e.setError(t);if(i=getTemplate(n,!1)||getTemplate(o,dust.config.cache),!i){if(!dust.compile)return e.setError(new Error("Dust compiler not available"));i=dust.loadSource(dust.compile(n,o))}i(e,Context.wrap(r,i.templateName)).end()}var o=t;3===dust.onLoad.length?dust.onLoad(o,r.options,n):dust.onLoad(o,n)}):e.setError(new Error("Template Not Found: "+t))}function Context(t,e,r,n,o){void 0===t||t instanceof Stack||(t=new Stack(t)),this.stack=t,this.global=e,this.options=r,this.blocks=n,this.templateName=o}function getWithResolvedData(t,e,r){return function(n){return t.push(n)._get(e,r)}}function Stack(t,e,r,n){this.tail=e,this.isObject=t&&"object"==typeof t,this.head=t,this.index=r,this.of=n}function Stub(t){this.head=new Chunk(this),this.callback=t,this.out=""}function Stream(){this.head=new Chunk(this)}function Chunk(t,e,r){this.root=t,this.next=e,this.data=[],this.flushable=!1,this.taps=r}function Tap(t,e){this.head=t,this.tail=e}var dust={version:"2.7.2"},NONE="NONE",ERROR="ERROR",WARN="WARN",INFO="INFO",DEBUG="DEBUG",EMPTY_FUNC=function(){};dust.config={whitespace:!1,amd:!1,cjs:!1,cache:!0},dust._aliases={write:"w",end:"e",map:"m",render:"r",reference:"f",section:"s",exists:"x",notexists:"nx",block:"b",partial:"p",helper:"h"},function(){var t,e,r={DEBUG:0,INFO:1,WARN:2,ERROR:3,NONE:4};"undefined"!=typeof console&&console.log?(t=console.log,e="function"==typeof t?function(){t.apply(console,arguments)}:function(){t(Array.prototype.slice.apply(arguments).join(" "))}):e=EMPTY_FUNC,dust.log=function(t,n){n=n||INFO,r[n]>=r[dust.debugLevel]&&e("[DUST:"+n+"]",t)},dust.debugLevel=NONE,"undefined"!=typeof process&&process.env&&/\bdust\b/.test(process.env.DEBUG)&&(dust.debugLevel=DEBUG)}(),dust.helpers={},dust.cache={},dust.register=function(t,e){t&&(e.templateName=t,dust.config.cache!==!1&&(dust.cache[t]=e))},dust.render=function(t,e,r){var n=new Stub(r).head;try{load(t,n,e).end()}catch(o){n.setError(o)}},dust.stream=function(t,e){var r=new Stream,n=r.head;return dust.nextTick(function(){try{load(t,n,e).end()}catch(r){n.setError(r)}}),r},dust.loadSource=function(source){return eval(source)},Array.isArray?dust.isArray=Array.isArray:dust.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)},dust.nextTick=function(){return function(t){setTimeout(t,0)}}(),dust.isEmpty=function(t){return 0===t?!1:dust.isArray(t)&&!t.length?!0:!t},dust.isEmptyObject=function(t){var e;if(null===t)return!1;if(void 0===t)return!1;if(t.length>0)return!1;for(e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0},dust.isTemplateFn=function(t){return"function"==typeof t&&t.__dustBody},dust.isThenable=function(t){return t&&"object"==typeof t&&"function"==typeof t.then},dust.isStreamable=function(t){return t&&"function"==typeof t.on&&"function"==typeof t.pipe},dust.filter=function(t,e,r,n){var o,i,u,s;if(r)for(o=0,i=r.length;i>o;o++)u=r[o],u.length&&(s=dust.filters[u],"s"===u?e=null:"function"==typeof s?t=s(t,n):dust.log("Invalid filter `"+u+"`",WARN));return e&&(t=dust.filters[e](t,n)),t},dust.filters={h:function(t){return dust.escapeHtml(t)},j:function(t){return dust.escapeJs(t)},u:encodeURI,uc:encodeURIComponent,js:function(t){return dust.escapeJSON(t)},jp:function(t){return JSON?JSON.parse(t):(dust.log("JSON is undefined; could not parse `"+t+"`",WARN),t)}},dust.makeBase=dust.context=function(t,e){return new Context(void 0,t,e)},Context.wrap=function(t,e){return t instanceof Context?t:new Context(t,{},{},null,e)},Context.prototype.get=function(t,e){return"string"==typeof t&&("."===t[0]&&(e=!0,t=t.substr(1)),t=t.split(".")),this._get(e,t)},Context.prototype._get=function(t,e){var r,n,o,i,u,s=this.stack||{},c=1;if(n=e[0],o=e.length,t&&0===o)i=s,s=s.head;else{if(t)s&&(s=s.head?s.head[n]:void 0);else{for(;s&&(!s.isObject||(i=s.head,r=s.head[n],void 0===r));)s=s.tail;s=void 0!==r?r:this.global&&this.global[n]}for(;s&&o>c;){if(dust.isThenable(s))return s.then(getWithResolvedData(this,t,e.slice(c)));i=s,s=s[e[c]],c++}}return"function"==typeof s?(u=function(){try{return s.apply(i,arguments)}catch(t){throw dust.log(t,ERROR),t}},u.__dustBody=!!s.__dustBody,u):(void 0===s&&dust.log("Cannot find reference `{"+e.join(".")+"}` in template `"+this.getTemplateName()+"`",INFO),s)},Context.prototype.getPath=function(t,e){return this._get(t,e)},Context.prototype.push=function(t,e,r){return void 0===t?(dust.log("Not pushing an undefined variable onto the context",INFO),this):this.rebase(new Stack(t,this.stack,e,r))},Context.prototype.pop=function(){var t=this.current();return this.stack=this.stack&&this.stack.tail,t},Context.prototype.rebase=function(t){return new Context(t,this.global,this.options,this.blocks,this.getTemplateName())},Context.prototype.clone=function(){var t=this.rebase();return t.stack=this.stack,t},Context.prototype.current=function(){return this.stack&&this.stack.head},Context.prototype.getBlock=function(t){var e,r,n;if("function"==typeof t&&(t=t(new Chunk,this).data.join("")),e=this.blocks,!e)return dust.log("No blocks for context `"+t+"` in template `"+this.getTemplateName()+"`",DEBUG),!1;for(r=e.length;r--;)if(n=e[r][t])return n;return dust.log("Malformed template `"+this.getTemplateName()+"` was missing one or more blocks."),!1},Context.prototype.shiftBlocks=function(t){var e,r=this.blocks;return t?(e=r?r.concat([t]):[t],new Context(this.stack,this.global,this.options,e,this.getTemplateName())):this},Context.prototype.resolve=function(t){var e;return"function"!=typeof t?t:(e=(new Chunk).render(t,this),e instanceof Chunk?e.data.join(""):e)},Context.prototype.getTemplateName=function(){return this.templateName},Stub.prototype.flush=function(){for(var t=this.head;t;){if(!t.flushable)return t.error?(this.callback(t.error),dust.log("Rendering failed with error `"+t.error+"`",ERROR),void(this.flush=EMPTY_FUNC)):void 0;this.out+=t.data.join(""),t=t.next,this.head=t}this.callback(null,this.out)},Stream.prototype.flush=function(){for(var t=this.head;t;){if(!t.flushable)return t.error?(this.emit("error",t.error),this.emit("end"),dust.log("Streaming failed with error `"+t.error+"`",ERROR),void(this.flush=EMPTY_FUNC)):void 0;this.emit("data",t.data.join("")),t=t.next,this.head=t}this.emit("end")},Stream.prototype.emit=function(t,e){var r,n,o=this.events||{},i=o[t]||[];if(!i.length)return dust.log("Stream broadcasting, but no listeners for `"+t+"`",DEBUG),!1;for(i=i.slice(0),r=0,n=i.length;n>r;r++)i[r](e);return!0},Stream.prototype.on=function(t,e){var r=this.events=this.events||{},n=r[t]=r[t]||[];return"function"!=typeof e?dust.log("No callback function provided for `"+t+"` event listener",WARN):n.push(e),this},Stream.prototype.pipe=function(t){if("function"!=typeof t.write||"function"!=typeof t.end)return dust.log("Incompatible stream passed to `pipe`",WARN),this;var e=!1;return"function"==typeof t.emit&&t.emit("pipe",this),"function"==typeof t.on&&t.on("error",function(){e=!0}),this.on("data",function(r){if(!e)try{t.write(r,"utf8")}catch(n){dust.log(n,ERROR)}}).on("end",function(){if(!e)try{t.end(),e=!0}catch(r){dust.log(r,ERROR)}})},Chunk.prototype.write=function(t){var e=this.taps;return e&&(t=e.go(t)),this.data.push(t),this},Chunk.prototype.end=function(t){return t&&this.write(t),this.flushable=!0,this.root.flush(),this},Chunk.prototype.map=function(t){var e=new Chunk(this.root,this.next,this.taps),r=new Chunk(this.root,e,this.taps);this.next=r,this.flushable=!0;try{t(r)}catch(n){dust.log(n,ERROR),r.setError(n)}return e},Chunk.prototype.tap=function(t){var e=this.taps;return e?this.taps=e.push(t):this.taps=new Tap(t),this},Chunk.prototype.untap=function(){return this.taps=this.taps.tail,this},Chunk.prototype.render=function(t,e){return t(this,e)},Chunk.prototype.reference=function(t,e,r,n){return"function"==typeof t?(t=t.apply(e.current(),[this,e,null,{auto:r,filters:n}]),t instanceof Chunk?t:this.reference(t,e,r,n)):dust.isThenable(t)?this.await(t,e,null,r,n):dust.isStreamable(t)?this.stream(t,e,null,r,n):dust.isEmpty(t)?this:this.write(dust.filter(t,r,n,e))},Chunk.prototype.section=function(t,e,r,n){var o,i,u,s=r.block,c=r["else"],a=this;if("function"==typeof t&&!dust.isTemplateFn(t)){try{t=t.apply(e.current(),[this,e,r,n])}catch(f){return dust.log(f,ERROR),this.setError(f)}if(t instanceof Chunk)return t}if(dust.isEmptyObject(r))return a;if(dust.isEmptyObject(n)||(e=e.push(n)),dust.isArray(t)){if(s){if(i=t.length,i>0){for(u=e.stack&&e.stack.head||{},u.$len=i,o=0;i>o;o++)u.$idx=o,a=s(a,e.push(t[o],o,i));return u.$idx=void 0,u.$len=void 0,a}if(c)return c(this,e)}}else{if(dust.isThenable(t))return this.await(t,e,r);if(dust.isStreamable(t))return this.stream(t,e,r);if(t===!0){if(s)return s(this,e)}else if(t||0===t){if(s)return s(this,e.push(t))}else if(c)return c(this,e)}return dust.log("Section without corresponding key in template `"+e.getTemplateName()+"`",DEBUG),this},Chunk.prototype.exists=function(t,e,r){var n=r.block,o=r["else"];if(dust.isEmpty(t)){if(o)return o(this,e)}else{if(n)return n(this,e);dust.log("No block for exists check in template `"+e.getTemplateName()+"`",DEBUG)}return this},Chunk.prototype.notexists=function(t,e,r){var n=r.block,o=r["else"];if(dust.isEmpty(t)){if(n)return n(this,e);dust.log("No block for not-exists check in template `"+e.getTemplateName()+"`",DEBUG)}else if(o)return o(this,e);return this},Chunk.prototype.block=function(t,e,r){var n=t||r.block;return n?n(this,e):this},Chunk.prototype.partial=function(t,e,r,n){var o;return void 0===n&&(n=r,r=e),dust.isEmptyObject(n)||(r=r.clone(),o=r.pop(),r=r.push(n).push(o)),dust.isTemplateFn(t)?this.capture(t,e,function(t,e){r.templateName=t,load(t,e,r).end()}):(r.templateName=t,load(t,this,r))},Chunk.prototype.helper=function(t,e,r,n,o){var i,u=this,s=n.filters;if(void 0===o&&(o="h"),!dust.helpers[t])return dust.log("Helper `"+t+"` does not exist",WARN),u;try{return i=dust.helpers[t](u,e,r,n),i instanceof Chunk?i:("string"==typeof s&&(s=s.split("|")),dust.isEmptyObject(r)?u.reference(i,e,o,s):u.section(i,e,r,n))}catch(c){return dust.log("Error in helper `"+t+"`: "+c.message,ERROR),u.setError(c)}},Chunk.prototype.await=function(t,e,r,n,o){return this.map(function(i){t.then(function(t){i=r?i.section(t,e,r):i.reference(t,e,n,o),i.end()},function(t){var n=r&&r.error;n?i.render(n,e.push(t)).end():(dust.log("Unhandled promise rejection in `"+e.getTemplateName()+"`",INFO),i.end())})})},Chunk.prototype.stream=function(t,e,r,n,o){var i=r&&r.block,u=r&&r.error;return this.map(function(s){var c=!1;t.on("data",function(t){c||(i?s=s.map(function(r){r.render(i,e.push(t)).end()}):r||(s=s.reference(t,e,n,o)))}).on("error",function(t){c||(u?s.render(u,e.push(t)):dust.log("Unhandled stream error in `"+e.getTemplateName()+"`",INFO),c||(c=!0,s.end()))}).on("end",function(){c||(c=!0,s.end())})})},Chunk.prototype.capture=function(t,e,r){return this.map(function(n){var o=new Stub(function(t,e){t?n.setError(t):r(e,n)});t(o.head,e).end()})},Chunk.prototype.setError=function(t){return this.error=t,this.root.flush(),this};for(var f in Chunk.prototype)dust._aliases[f]&&(Chunk.prototype[dust._aliases[f]]=Chunk.prototype[f]);Tap.prototype.push=function(t){return new Tap(t,this)},Tap.prototype.go=function(t){for(var e=this;e;)t=e.head(t),e=e.tail;return t};var HCHARS=/[&<>"']/,AMP=/&/g,LT=/</g,GT=/>/g,QUOT=/\"/g,SQUOT=/\'/g;dust.escapeHtml=function(t){return"string"==typeof t||t&&"function"==typeof t.toString?("string"!=typeof t&&(t=t.toString()),HCHARS.test(t)?t.replace(AMP,"&amp;").replace(LT,"&lt;").replace(GT,"&gt;").replace(QUOT,"&quot;").replace(SQUOT,"&#39;"):t):t};var BS=/\\/g,FS=/\//g,CR=/\r/g,LS=/\u2028/g,PS=/\u2029/g,NL=/\n/g,LF=/\f/g,SQ=/'/g,DQ=/"/g,TB=/\t/g;return dust.escapeJs=function(t){return"string"==typeof t?t.replace(BS,"\\\\").replace(FS,"\\/").replace(DQ,'\\"').replace(SQ,"\\'").replace(CR,"\\r").replace(LS,"\\u2028").replace(PS,"\\u2029").replace(NL,"\\n").replace(LF,"\\f").replace(TB,"\\t"):t},dust.escapeJSON=function(t){return JSON?JSON.stringify(t).replace(LS,"\\u2028").replace(PS,"\\u2029").replace(LT,"\\u003c"):(dust.log("JSON is undefined; could not escape `"+t+"`",WARN),t)},dust}),function(t,e){"function"==typeof define&&define.amd&&define.amd.dust===!0?define("dust.parse",["dust.core"],function(t){return e(t).parse}):"object"==typeof exports?module.exports=e(require("./dust")):e(t.dust)}(this,function(t){var e=function(){function t(t,e){function r(){this.constructor=t}r.prototype=e.prototype,t.prototype=new r}function e(t,e,r,n,o,i){this.message=t,this.expected=e,this.found=r,this.offset=n,this.line=o,this.column=i,this.name="SyntaxError"}function r(t){function r(){return i(Nr).line}function n(){return i(Nr).column}function o(t){throw s(t,null,Nr)}function i(e){function r(e,r,n){var o,i;for(o=r;n>o;o++)i=t.charAt(o),"\n"===i?(e.seenCR||e.line++,e.column=1,e.seenCR=!1):"\r"===i||"\u2028"===i||"\u2029"===i?(e.line++,e.column=1,e.seenCR=!0):(e.column++,e.seenCR=!1)}return Ar!==e&&(Ar>e&&(Ar=0,kr={line:1,column:1,seenCR:!1}),r(kr,Ar,e),Ar=e),kr}function u(t){Er>Cr||(Cr>Er&&(Er=Cr,Rr=[]),Rr.push(t))}function s(r,n,o){function u(t){var e=1;for(t.sort(function(t,e){return t.description<e.description?-1:t.description>e.description?1:0});e<t.length;)t[e-1]===t[e]?t.splice(e,1):e++}function s(t,e){function r(t){function e(t){return t.charCodeAt(0).toString(16).toUpperCase()}return t.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\x08/g,"\\b").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\f/g,"\\f").replace(/\r/g,"\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g,function(t){return"\\x0"+e(t)}).replace(/[\x10-\x1F\x80-\xFF]/g,function(t){return"\\x"+e(t)}).replace(/[\u0180-\u0FFF]/g,function(t){return"\\u0"+e(t)}).replace(/[\u1080-\uFFFF]/g,function(t){return"\\u"+e(t)})}var n,o,i,u=new Array(t.length);for(i=0;i<t.length;i++)u[i]=t[i].description;return n=t.length>1?u.slice(0,-1).join(", ")+" or "+u[t.length-1]:u[0],o=e?'"'+r(e)+'"':"end of input","Expected "+n+" but "+o+" found."}var c=i(o),a=o<t.length?t.charAt(o):null;return null!==n&&u(n),new e(null!==r?r:s(n,a),n,a,o,c.line,c.column)}function c(){var t;return t=a()}function a(){var t,e,r;for(t=Cr,e=[],r=f();r!==q;)e.push(r),r=f();return e!==q&&(Nr=t,e=V(e)),t=e}function f(){var t;return t=L(),t===q&&(t=D(),t===q&&(t=l(),t===q&&(t=v(),t===q&&(t=x(),t===q&&(t=g(),t===q&&(t=_())))))),t}function l(){var e,r,n,o,i,s,c,f;if(Sr++,e=Cr,r=p(),r!==q){for(n=[],o=$();o!==q;)n.push(o),o=$();n!==q?(o=G(),o!==q?(i=a(),i!==q?(s=y(),s!==q?(c=h(),c===q&&(c=et),c!==q?(Nr=Cr,f=rt(r,i,s,c),f=f?nt:tt,f!==q?(Nr=e,r=ot(r,i,s,c),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt;if(e===q)if(e=Cr,r=p(),r!==q){for(n=[],o=$();o!==q;)n.push(o),o=$();n!==q?(47===t.charCodeAt(Cr)?(o=it,Cr++):(o=q,0===Sr&&u(ut)),o!==q?(i=G(),i!==q?(Nr=e,r=st(r),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt;return Sr--,e===q&&(r=q,0===Sr&&u(X)),e}function p(){var e,r,n,o,i,s,c;if(e=Cr,r=J(),r!==q)if(ct.test(t.charAt(Cr))?(n=t.charAt(Cr),Cr++):(n=q,0===Sr&&u(at)),n!==q){for(o=[],i=$();i!==q;)o.push(i),i=$();o!==q?(i=C(),i!==q?(s=d(),s!==q?(c=m(),c!==q?(Nr=e,r=ft(n,i,s,c),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt;else Cr=e,e=tt;return e}function h(){var e,r,n,o,i,s,c;if(Sr++,e=Cr,r=J(),r!==q)if(47===t.charCodeAt(Cr)?(n=it,Cr++):(n=q,0===Sr&&u(ut)),n!==q){for(o=[],i=$();i!==q;)o.push(i),i=$();if(o!==q)if(i=C(),i!==q){for(s=[],c=$();c!==q;)s.push(c),c=$();s!==q?(c=G(),c!==q?(Nr=e,r=pt(i),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt;else Cr=e,e=tt}else Cr=e,e=tt;else Cr=e,e=tt;return Sr--,e===q&&(r=q,0===Sr&&u(lt)),e}function d(){var e,r,n,o;return e=Cr,r=Cr,58===t.charCodeAt(Cr)?(n=ht,Cr++):(n=q,0===Sr&&u(dt)),n!==q?(o=C(),o!==q?(Nr=r,n=mt(o),r=n):(Cr=r,r=tt)):(Cr=r,r=tt),r===q&&(r=et),r!==q&&(Nr=e,r=yt(r)),e=r}function m(){var e,r,n,o,i,s,c;if(Sr++,e=Cr,r=[],n=Cr,o=[],i=$(),i!==q)for(;i!==q;)o.push(i),i=$();else o=tt;for(o!==q?(i=w(),i!==q?(61===t.charCodeAt(Cr)?(s=vt,Cr++):(s=q,0===Sr&&u(bt)),s!==q?(c=N(),c===q&&(c=C(),c===q&&(c=j())),c!==q?(Nr=n,o=xt(i,c),n=o):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt);n!==q;){if(r.push(n),n=Cr,o=[],i=$(),i!==q)for(;i!==q;)o.push(i),i=$();else o=tt;o!==q?(i=w(),i!==q?(61===t.charCodeAt(Cr)?(s=vt,Cr++):(s=q,0===Sr&&u(bt)),s!==q?(c=N(),c===q&&(c=C(),c===q&&(c=j())),c!==q?(Nr=n,o=xt(i,c),n=o):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)}return r!==q&&(Nr=e,r=Ct(r)),e=r,Sr--,e===q&&(r=q,0===Sr&&u(gt)),e}function y(){var e,r,n,o,i,s,c,f;for(Sr++,e=Cr,r=[],n=Cr,o=J(),o!==q?(58===t.charCodeAt(Cr)?(i=ht,Cr++):(i=q,0===Sr&&u(dt)),i!==q?(s=w(),s!==q?(c=G(),c!==q?(f=a(),f!==q?(Nr=n,o=xt(s,f),n=o):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt);n!==q;)r.push(n),n=Cr,o=J(),o!==q?(58===t.charCodeAt(Cr)?(i=ht,Cr++):(i=q,0===Sr&&u(dt)),i!==q?(s=w(),s!==q?(c=G(),c!==q?(f=a(),f!==q?(Nr=n,o=xt(s,f),n=o):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt);return r!==q&&(Nr=e,r=At(r)),e=r,Sr--,e===q&&(r=q,0===Sr&&u(Nt)),e}function g(){var t,e,r,n,o;return Sr++,t=Cr,e=J(),e!==q?(r=C(),r!==q?(n=b(),n!==q?(o=G(),o!==q?(Nr=t,e=Et(r,n),t=e):(Cr=t,t=tt)):(Cr=t,t=tt)):(Cr=t,t=tt)):(Cr=t,t=tt),Sr--,t===q&&(e=q,0===Sr&&u(kt)),t}function v(){var e,r,n,o,i,s,c,a,f,l;if(Sr++,e=Cr,r=J(),r!==q)if(62===t.charCodeAt(Cr)?(n=St,Cr++):(n=q,0===Sr&&u(wt)),n===q&&(43===t.charCodeAt(Cr)?(n=Tt,Cr++):(n=q,0===Sr&&u(Ot))),n!==q){for(o=[],i=$();i!==q;)o.push(i),i=$();if(o!==q)if(i=Cr,s=w(),s!==q&&(Nr=i,s=jt(s)),i=s,i===q&&(i=j()),i!==q)if(s=d(),s!==q)if(c=m(),c!==q){for(a=[],f=$();f!==q;)a.push(f),f=$();a!==q?(47===t.charCodeAt(Cr)?(f=it,Cr++):(f=q,0===Sr&&u(ut)),f!==q?(l=G(),l!==q?(Nr=e,r=Ft(n,i,s,c),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt;else Cr=e,e=tt;else Cr=e,e=tt;else Cr=e,e=tt}else Cr=e,e=tt;else Cr=e,e=tt;return Sr--,e===q&&(r=q,0===Sr&&u(Rt)),e}function b(){var e,r,n,o,i;for(Sr++,e=Cr,r=[],n=Cr,124===t.charCodeAt(Cr)?(o=Bt,Cr++):(o=q,0===Sr&&u(Ut)),o!==q?(i=w(),i!==q?(Nr=n,o=mt(i),n=o):(Cr=n,n=tt)):(Cr=n,n=tt);n!==q;)r.push(n),n=Cr,124===t.charCodeAt(Cr)?(o=Bt,Cr++):(o=q,0===Sr&&u(Ut)),o!==q?(i=w(),i!==q?(Nr=n,o=mt(i),n=o):(Cr=n,n=tt)):(Cr=n,n=tt);return r!==q&&(Nr=e,r=Lt(r)),e=r,Sr--,e===q&&(r=q,0===Sr&&u(_t)),e}function x(){var e,r,n,o,i;return Sr++,e=Cr,r=J(),r!==q?(126===t.charCodeAt(Cr)?(n=It,Cr++):(n=q,0===Sr&&u(Jt)),n!==q?(o=w(),o!==q?(i=G(),i!==q?(Nr=e,r=Gt(o),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt),Sr--,e===q&&(r=q,0===Sr&&u(Dt)),e}function C(){var t,e;return Sr++,t=Cr,e=S(),e!==q&&(Nr=t,e=Wt(e)),t=e,t===q&&(t=Cr,e=w(),e!==q&&(Nr=t,e=zt(e)),t=e),Sr--,t===q&&(e=q,0===Sr&&u(Pt)),t}function N(){var t,e;return Sr++,t=Cr,e=A(),e===q&&(e=R()),e!==q&&(Nr=t,e=Qt(e)),t=e,Sr--,t===q&&(e=q,0===Sr&&u($t)),t}function A(){var e,r,n,o;return Sr++,e=Cr,r=R(),r!==q?(46===t.charCodeAt(Cr)?(n=Mt,Cr++):(n=q,0===Sr&&u(Zt)),n!==q?(o=k(),o!==q?(Nr=e,r=qt(r,o),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt),Sr--,e===q&&(r=q,0===Sr&&u(Ht)),e}function k(){var e,r,n;if(Sr++,e=Cr,r=[],Kt.test(t.charAt(Cr))?(n=t.charAt(Cr),Cr++):(n=q,0===Sr&&u(Vt)),n!==q)for(;n!==q;)r.push(n),Kt.test(t.charAt(Cr))?(n=t.charAt(Cr),Cr++):(n=q,0===Sr&&u(Vt));else r=tt;return r!==q&&(Nr=e,r=Xt(r)),e=r,Sr--,e===q&&(r=q,0===Sr&&u(Yt)),e}function E(){var e,r,n;return Sr++,e=Cr,45===t.charCodeAt(Cr)?(r=ee,Cr++):(r=q,0===Sr&&u(re)),r!==q?(n=k(),n!==q?(Nr=e,r=ne(r,n),e=r):(Cr=e,e=tt)):(Cr=e,e=tt),Sr--,e===q&&(r=q,0===Sr&&u(te)),e}function R(){var t,e;return Sr++,t=E(),t===q&&(t=k()),Sr--,t===q&&(e=q,0===Sr&&u(oe)),t}function S(){var e,r,n,o;if(Sr++,e=Cr,r=w(),r===q&&(r=et),r!==q){if(n=[],o=O(),o===q&&(o=T()),o!==q)for(;o!==q;)n.push(o),o=O(),o===q&&(o=T());else n=tt;n!==q?(Nr=e,r=ue(r,n),e=r):(Cr=e,e=tt)}else Cr=e,e=tt;if(e===q)if(e=Cr,46===t.charCodeAt(Cr)?(r=Mt,Cr++):(r=q,0===Sr&&u(Zt)),r!==q){for(n=[],o=O(),o===q&&(o=T());o!==q;)n.push(o),o=O(),o===q&&(o=T());n!==q?(Nr=e,r=se(n),e=r):(Cr=e,e=tt)}else Cr=e,e=tt;return Sr--,e===q&&(r=q,0===Sr&&u(ie)),e}function w(){var e,r,n,o;if(Sr++,e=Cr,ae.test(t.charAt(Cr))?(r=t.charAt(Cr),Cr++):(r=q,0===Sr&&u(fe)),r!==q){for(n=[],le.test(t.charAt(Cr))?(o=t.charAt(Cr),Cr++):(o=q,0===Sr&&u(pe));o!==q;)n.push(o),le.test(t.charAt(Cr))?(o=t.charAt(Cr),Cr++):(o=q,0===Sr&&u(pe));n!==q?(Nr=e,r=he(r,n),e=r):(Cr=e,e=tt)}else Cr=e,e=tt;return Sr--,e===q&&(r=q,0===Sr&&u(ce)),e}function T(){var e,r,n,o,i,s;if(Sr++,e=Cr,r=Cr,n=P(),n!==q){if(o=Cr,i=[],Kt.test(t.charAt(Cr))?(s=t.charAt(Cr),Cr++):(s=q,0===Sr&&u(Vt)),s!==q)for(;s!==q;)i.push(s),Kt.test(t.charAt(Cr))?(s=t.charAt(Cr),Cr++):(s=q,0===Sr&&u(Vt));else i=tt;i!==q&&(Nr=o,i=me(i)),o=i,o===q&&(o=C()),o!==q?(i=W(),i!==q?(Nr=r,n=ye(o),r=n):(Cr=r,r=tt)):(Cr=r,r=tt)}else Cr=r,r=tt;return r!==q?(n=O(),n===q&&(n=et),n!==q?(Nr=e,r=ge(r,n),e=r):(Cr=e,e=tt)):(Cr=e,e=tt),Sr--,e===q&&(r=q,0===Sr&&u(de)),e}function O(){var e,r,n,o,i;if(Sr++,e=Cr,r=[],n=Cr,46===t.charCodeAt(Cr)?(o=Mt,Cr++):(o=q,0===Sr&&u(Zt)),o!==q?(i=w(),i!==q?(Nr=n,o=be(i),n=o):(Cr=n,n=tt)):(Cr=n,n=tt),n!==q)for(;n!==q;)r.push(n),n=Cr,46===t.charCodeAt(Cr)?(o=Mt,Cr++):(o=q,0===Sr&&u(Zt)),o!==q?(i=w(),i!==q?(Nr=n,o=be(i),n=o):(Cr=n,n=tt)):(Cr=n,n=tt);else r=tt;return r!==q?(n=T(),n===q&&(n=et),n!==q?(Nr=e,r=xe(r,n),e=r):(Cr=e,e=tt)):(Cr=e,e=tt),Sr--,e===q&&(r=q,0===Sr&&u(ve)),e}function j(){var e,r,n,o;if(Sr++,e=Cr,34===t.charCodeAt(Cr)?(r=Ne,Cr++):(r=q,0===Sr&&u(Ae)),r!==q?(34===t.charCodeAt(Cr)?(n=Ne,Cr++):(n=q,0===Sr&&u(Ae)),n!==q?(Nr=e,r=ke(),e=r):(Cr=e,e=tt)):(Cr=e,e=tt),e===q&&(e=Cr,34===t.charCodeAt(Cr)?(r=Ne,Cr++):(r=q,0===Sr&&u(Ae)),r!==q?(n=B(),n!==q?(34===t.charCodeAt(Cr)?(o=Ne,Cr++):(o=q,0===Sr&&u(Ae)),o!==q?(Nr=e,r=Ee(n),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)):(Cr=e,e=tt),e===q))if(e=Cr,34===t.charCodeAt(Cr)?(r=Ne,Cr++):(r=q,0===Sr&&u(Ae)),r!==q){if(n=[],o=F(),o!==q)for(;o!==q;)n.push(o),o=F();else n=tt;n!==q?(34===t.charCodeAt(Cr)?(o=Ne,Cr++):(o=q,0===Sr&&u(Ae)),o!==q?(Nr=e,r=Re(n),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt;return Sr--,e===q&&(r=q,0===Sr&&u(Ce)),e}function F(){var t,e;return t=x(),t===q&&(t=g(),t===q&&(t=Cr,e=B(),e!==q&&(Nr=t,e=Se(e)),t=e)),t}function _(){var e,r,n,o,i,s,c,a;if(Sr++,e=Cr,r=z(),r!==q){for(n=[],o=$();o!==q;)n.push(o),o=$();n!==q?(Nr=e,r=Te(r,n),e=r):(Cr=e,e=tt)}else Cr=e,e=tt;if(e===q){if(e=Cr,r=[],n=Cr,o=Cr,Sr++,i=I(),Sr--,i===q?o=nt:(Cr=o,o=tt),o!==q?(i=Cr,Sr++,s=L(),Sr--,s===q?i=nt:(Cr=i,i=tt),i!==q?(s=Cr,Sr++,c=D(),Sr--,c===q?s=nt:(Cr=s,s=tt),s!==q?(c=Cr,Sr++,a=z(),Sr--,a===q?c=nt:(Cr=c,c=tt),c!==q?(t.length>Cr?(a=t.charAt(Cr),Cr++):(a=q,0===Sr&&u(Oe)),a!==q?(Nr=n,o=je(a),n=o):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt),n!==q)for(;n!==q;)r.push(n),n=Cr,o=Cr,Sr++,i=I(),Sr--,i===q?o=nt:(Cr=o,o=tt),o!==q?(i=Cr,Sr++,s=L(),Sr--,s===q?i=nt:(Cr=i,i=tt),i!==q?(s=Cr,Sr++,c=D(),Sr--,c===q?s=nt:(Cr=s,s=tt),s!==q?(c=Cr,Sr++,a=z(),Sr--,a===q?c=nt:(Cr=c,c=tt),c!==q?(t.length>Cr?(a=t.charAt(Cr),Cr++):(a=q,0===Sr&&u(Oe)),a!==q?(Nr=n,o=je(a),n=o):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt)):(Cr=n,n=tt);else r=tt;r!==q&&(Nr=e,r=Fe(r)),e=r}return Sr--,e===q&&(r=q,0===Sr&&u(we)),e}function B(){var e,r,n,o,i;if(Sr++,e=Cr,r=[],n=Cr,o=Cr,Sr++,i=I(),Sr--,i===q?o=nt:(Cr=o,o=tt),o!==q?(i=U(),i===q&&(Be.test(t.charAt(Cr))?(i=t.charAt(Cr),Cr++):(i=q,0===Sr&&u(Ue))),i!==q?(Nr=n,o=je(i),n=o):(Cr=n,n=tt)):(Cr=n,n=tt),n!==q)for(;n!==q;)r.push(n),n=Cr,o=Cr,Sr++,i=I(),Sr--,i===q?o=nt:(Cr=o,o=tt),o!==q?(i=U(),i===q&&(Be.test(t.charAt(Cr))?(i=t.charAt(Cr),Cr++):(i=q,0===Sr&&u(Ue))),i!==q?(Nr=n,o=je(i),n=o):(Cr=n,n=tt)):(Cr=n,n=tt);else r=tt;return r!==q&&(Nr=e,r=Le(r)),e=r,Sr--,e===q&&(r=q,0===Sr&&u(_e)),e}function U(){var e,r;return e=Cr,t.substr(Cr,2)===De?(r=De,Cr+=2):(r=q,0===Sr&&u(Ie)),r!==q&&(Nr=e,r=Je()),e=r}function L(){var e,r,n,o,i,s;if(Sr++,e=Cr,t.substr(Cr,2)===Pe?(r=Pe,Cr+=2):(r=q,0===Sr&&u(We)),r!==q){for(n=[],o=Cr,i=Cr,Sr++,t.substr(Cr,2)===ze?(s=ze,Cr+=2):(s=q,0===Sr&&u($e)),Sr--,s===q?i=nt:(Cr=i,i=tt),i!==q?(t.length>Cr?(s=t.charAt(Cr),Cr++):(s=q,0===Sr&&u(Oe)),s!==q?(Nr=o,i=Qe(s),o=i):(Cr=o,o=tt)):(Cr=o,o=tt);o!==q;)n.push(o),o=Cr,i=Cr,Sr++,t.substr(Cr,2)===ze?(s=ze,Cr+=2):(s=q,0===Sr&&u($e)),Sr--,s===q?i=nt:(Cr=i,i=tt),i!==q?(t.length>Cr?(s=t.charAt(Cr),Cr++):(s=q,0===Sr&&u(Oe)),s!==q?(Nr=o,i=Qe(s),o=i):(Cr=o,o=tt)):(Cr=o,o=tt);n!==q?(t.substr(Cr,2)===ze?(o=ze,Cr+=2):(o=q,0===Sr&&u($e)),o!==q?(Nr=e,r=He(n),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt;return Sr--,e===q&&(r=q,0===Sr&&u(Ge)),e}function D(){var e,r,n,o,i,s;if(Sr++,e=Cr,t.substr(Cr,2)===Ze?(r=Ze,Cr+=2):(r=q,0===Sr&&u(qe)),r!==q){for(n=[],o=Cr,i=Cr,Sr++,t.substr(Cr,2)===Ye?(s=Ye,Cr+=2):(s=q,0===Sr&&u(Ke)),Sr--,s===q?i=nt:(Cr=i,i=tt),i!==q?(t.length>Cr?(s=t.charAt(Cr),Cr++):(s=q,0===Sr&&u(Oe)),s!==q?(Nr=o,i=je(s),o=i):(Cr=o,o=tt)):(Cr=o,o=tt);o!==q;)n.push(o),o=Cr,i=Cr,Sr++,t.substr(Cr,2)===Ye?(s=Ye,Cr+=2):(s=q,0===Sr&&u(Ke)),Sr--,s===q?i=nt:(Cr=i,i=tt),i!==q?(t.length>Cr?(s=t.charAt(Cr),Cr++):(s=q,0===Sr&&u(Oe)),s!==q?(Nr=o,i=je(s),o=i):(Cr=o,o=tt)):(Cr=o,o=tt);n!==q?(t.substr(Cr,2)===Ye?(o=Ye,Cr+=2):(o=q,0===Sr&&u(Ke)),o!==q?(Nr=e,r=Ve(n),e=r):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt;return Sr--,e===q&&(r=q,0===Sr&&u(Me)),e}function I(){var e,r,n,o,i,s,c,a,f,l;if(e=Cr,r=J(),r!==q){for(n=[],o=$();o!==q;)n.push(o),o=$();if(n!==q)if(Xe.test(t.charAt(Cr))?(o=t.charAt(Cr),Cr++):(o=q,0===Sr&&u(tr)),o!==q){for(i=[],s=$();s!==q;)i.push(s),s=$();if(i!==q){if(s=[],c=Cr,a=Cr,Sr++,f=G(),Sr--,f===q?a=nt:(Cr=a,a=tt),a!==q?(f=Cr,Sr++,l=z(),Sr--,l===q?f=nt:(Cr=f,f=tt),f!==q?(t.length>Cr?(l=t.charAt(Cr),Cr++):(l=q,0===Sr&&u(Oe)),l!==q?(a=[a,f,l],c=a):(Cr=c,c=tt)):(Cr=c,c=tt)):(Cr=c,c=tt),c!==q)for(;c!==q;)s.push(c),c=Cr,a=Cr,Sr++,f=G(),Sr--,f===q?a=nt:(Cr=a,a=tt),a!==q?(f=Cr,Sr++,l=z(),Sr--,l===q?f=nt:(Cr=f,f=tt),f!==q?(t.length>Cr?(l=t.charAt(Cr),Cr++):(l=q,0===Sr&&u(Oe)),l!==q?(a=[a,f,l],c=a):(Cr=c,c=tt)):(Cr=c,c=tt)):(Cr=c,c=tt);else s=tt;if(s!==q){for(c=[],a=$();a!==q;)c.push(a),a=$();c!==q?(a=G(),a!==q?(r=[r,n,o,i,s,c,a],e=r):(Cr=e,e=tt)):(Cr=e,e=tt)}else Cr=e,e=tt}else Cr=e,e=tt}else Cr=e,e=tt;else Cr=e,e=tt}else Cr=e,e=tt;return e===q&&(e=g()),e}function J(){var e;return 123===t.charCodeAt(Cr)?(e=er,Cr++):(e=q,0===Sr&&u(rr)),e}function G(){var e;return 125===t.charCodeAt(Cr)?(e=nr,Cr++):(e=q,0===Sr&&u(or)),e}function P(){var e;return 91===t.charCodeAt(Cr)?(e=ir,Cr++):(e=q,0===Sr&&u(ur)),e}function W(){var e;return 93===t.charCodeAt(Cr)?(e=sr,Cr++):(e=q,0===Sr&&u(cr)),e}function z(){var e;return 10===t.charCodeAt(Cr)?(e=ar,Cr++):(e=q,0===Sr&&u(fr)),e===q&&(t.substr(Cr,2)===lr?(e=lr,Cr+=2):(e=q,0===Sr&&u(pr)),e===q&&(13===t.charCodeAt(Cr)?(e=hr,Cr++):(e=q,0===Sr&&u(dr)),e===q&&(8232===t.charCodeAt(Cr)?(e=mr,Cr++):(e=q,0===Sr&&u(yr)),e===q&&(8233===t.charCodeAt(Cr)?(e=gr,Cr++):(e=q,0===Sr&&u(vr)))))),e}function $(){var e;return br.test(t.charAt(Cr))?(e=t.charAt(Cr),Cr++):(e=q,0===Sr&&u(xr)),e===q&&(e=z()),e}function Q(t){return parseInt(t.join(""),10)}function H(t){return t.concat([["line",r()],["col",n()]])}var M,Z=arguments.length>1?arguments[1]:{},q={},Y={start:c},K=c,V=function(t){var e=["body"].concat(t);return H(e)},X={type:"other",description:"section"},tt=q,et=null,rt=function(t,e,r,n){return n&&t[1].text===n.text||o("Expected end tag for "+t[1].text+" but it was not found."),!0},nt=void 0,ot=function(t,e,r,n){return r.push(["param",["literal","block"],e]),t.push(r,["filters"]),H(t)},it="/",ut={type:"literal",value:"/",description:'"/"'},st=function(t){return t.push(["bodies"],["filters"]),H(t)},ct=/^[#?\^<+@%]/,at={type:"class",value:"[#?\\^<+@%]",description:"[#?\\^<+@%]"},ft=function(t,e,r,n){return[t,e,r,n]},lt={type:"other",description:"end tag"},pt=function(t){return t},ht=":",dt={type:"literal",value:":",description:'":"'},mt=function(t){return t},yt=function(t){return t?["context",t]:["context"]},gt={type:"other",description:"params"},vt="=",bt={type:"literal",value:"=",description:'"="'},xt=function(t,e){return["param",["literal",t],e]},Ct=function(t){return["params"].concat(t)},Nt={type:"other",description:"bodies"},At=function(t){return["bodies"].concat(t)},kt={type:"other",description:"reference"},Et=function(t,e){return H(["reference",t,e])},Rt={type:"other",description:"partial"},St=">",wt={type:"literal",value:">",description:'">"'},Tt="+",Ot={type:"literal",value:"+",description:'"+"'},jt=function(t){return["literal",t]},Ft=function(t,e,r,n){var o=">"===t?"partial":t;return H([o,e,r,n])},_t={type:"other",description:"filters"},Bt="|",Ut={type:"literal",value:"|",description:'"|"'},Lt=function(t){return["filters"].concat(t)},Dt={type:"other",description:"special"},It="~",Jt={type:"literal",value:"~",description:'"~"'},Gt=function(t){return H(["special",t])},Pt={type:"other",description:"identifier"},Wt=function(t){var e=["path"].concat(t);return e.text=t[1].join(".").replace(/,line,\d+,col,\d+/g,""),e},zt=function(t){var e=["key",t];return e.text=t,e},$t={type:"other",description:"number"},Qt=function(t){return["literal",t]},Ht={type:"other",description:"float"},Mt=".",Zt={type:"literal",value:".",description:'"."'},qt=function(t,e){return parseFloat(t+"."+e)},Yt={type:"other",description:"unsigned_integer"},Kt=/^[0-9]/,Vt={type:"class",value:"[0-9]",description:"[0-9]"},Xt=function(t){return Q(t)},te={type:"other",description:"signed_integer"},ee="-",re={type:"literal",value:"-",description:'"-"'},ne=function(t,e){return-1*e},oe={type:"other",description:"integer"},ie={type:"other",description:"path"},ue=function(t,e){return e=e[0],t&&e?(e.unshift(t),H([!1,e])):H([!0,e])},se=function(t){return H(t.length>0?[!0,t[0]]:[!0,[]])},ce={type:"other",description:"key"},ae=/^[a-zA-Z_$]/,fe={type:"class",value:"[a-zA-Z_$]",description:"[a-zA-Z_$]"},le=/^[0-9a-zA-Z_$\-]/,pe={type:"class",value:"[0-9a-zA-Z_$\\-]",description:"[0-9a-zA-Z_$\\-]"},he=function(t,e){return t+e.join("")},de={type:"other",description:"array"},me=function(t){return t.join("")},ye=function(t){return t},ge=function(t,e){return e?e.unshift(t):e=[t],e},ve={type:"other",description:"array_part"},be=function(t){return t},xe=function(t,e){return e?t.concat(e):t},Ce={type:"other",description:"inline"},Ne='"',Ae={type:"literal",value:'"',description:'"\\""'},ke=function(){return H(["literal",""])},Ee=function(t){return H(["literal",t])},Re=function(t){return H(["body"].concat(t))},Se=function(t){return["buffer",t]},we={type:"other",description:"buffer"},Te=function(t,e){return H(["format",t,e.join("")])},Oe={type:"any",description:"any character"},je=function(t){return t},Fe=function(t){return H(["buffer",t.join("")])},_e={type:"other",description:"literal"},Be=/^[^"]/,Ue={type:"class",value:'[^"]',description:'[^"]'},Le=function(t){return t.join("")},De='\\"',Ie={type:"literal",value:'\\"',description:'"\\\\\\""'},Je=function(){return'"'},Ge={type:"other",description:"raw"},Pe="{`",We={type:"literal",value:"{`",description:'"{`"'},ze="`}",$e={type:"literal",value:"`}",description:'"`}"'},Qe=function(t){return t},He=function(t){return H(["raw",t.join("")])},Me={type:"other",description:"comment"},Ze="{!",qe={type:"literal",value:"{!",description:'"{!"'},Ye="!}",Ke={type:"literal",value:"!}",description:'"!}"'},Ve=function(t){return H(["comment",t.join("")])},Xe=/^[#?\^><+%:@\/~%]/,tr={type:"class",value:"[#?\\^><+%:@\\/~%]",description:"[#?\\^><+%:@\\/~%]"},er="{",rr={type:"literal",value:"{",description:'"{"'},nr="}",or={type:"literal",value:"}",description:'"}"'},ir="[",ur={type:"literal",value:"[",description:'"["'},sr="]",cr={type:"literal",value:"]",description:'"]"'},ar="\n",fr={type:"literal",value:"\n",description:'"\\n"'},lr="\r\n",pr={
type:"literal",value:"\r\n",description:'"\\r\\n"'},hr="\r",dr={type:"literal",value:"\r",description:'"\\r"'},mr="\u2028",yr={type:"literal",value:"\u2028",description:'"\\u2028"'},gr="\u2029",vr={type:"literal",value:"\u2029",description:'"\\u2029"'},br=/^[\t\x0B\f \xA0\uFEFF]/,xr={type:"class",value:"[\\t\\x0B\\f \\xA0\\uFEFF]",description:"[\\t\\x0B\\f \\xA0\\uFEFF]"},Cr=0,Nr=0,Ar=0,kr={line:1,column:1,seenCR:!1},Er=0,Rr=[],Sr=0;if("startRule"in Z){if(!(Z.startRule in Y))throw new Error("Can't start parsing from rule \""+Z.startRule+'".');K=Y[Z.startRule]}if(M=K(),M!==q&&Cr===t.length)return M;throw M!==q&&Cr<t.length&&u({type:"end",description:"end of input"}),s(null,Rr,Er)}return t(e,Error),{SyntaxError:e,parse:r}}();return t.parse=e.parse,e}),function(t,e){"function"==typeof define&&define.amd&&define.amd.dust===!0?define("dust.compile",["dust.core","dust.parse"],function(t,r){return e(r,t).compile}):"object"==typeof exports?module.exports=e(require("./parser").parse,require("./dust")):e(t.dust.parse,t.dust)}(this,function(t,e){function r(t){var e={};return v.filterNode(e,t)}function n(t,e){var r,n,o,i=[e[0]];for(r=1,n=e.length;n>r;r++)o=v.filterNode(t,e[r]),o&&i.push(o);return i}function o(t,e){var r,n,o,i,u=[e[0]];for(n=1,o=e.length;o>n;n++)i=v.filterNode(t,e[n]),i&&("buffer"===i[0]||"format"===i[0]?r?(r[0]="buffer"===i[0]?"buffer":r[0],r[1]+=i.slice(1,-2).join("")):(r=i,u.push(i)):(r=null,u.push(i)));return u}function i(t,e){return["buffer",x[e[1]],e[2],e[3]]}function u(t,e){return e}function s(){}function c(t,r){return e.config.whitespace?(r.splice(1,2,r.slice(1,-2).join("")),r):null}function a(t,r){var n,o={name:r,bodies:[],blocks:{},index:0,auto:"h"},i=e.escapeJs(r),u=r?'"'+i+'",':"",s="function(dust){",c=v.compileNode(o,t);return r&&(s+='dust.register("'+i+'",'+c+");"),s+=f(o)+l(o)+"return "+c+"}",n="("+s+"(dust));",e.config.amd?"define("+u+'["dust.core"],'+s+");":e.config.cjs?"module.exports=function(dust){var tmpl="+n+"var f="+g().toString()+";f.template=tmpl;return f}":n}function f(t){var e,r=[],n=t.blocks;for(e in n)r.push('"'+e+'":'+n[e]);return r.length?(t.blocks="ctx=ctx.shiftBlocks(blocks);","var blocks={"+r.join(",")+"};"):(t.blocks="",t.blocks)}function l(t){var e,r,n=[],o=t.bodies,i=t.blocks;for(e=0,r=o.length;r>e;e++)n[e]="function body_"+e+"(chk,ctx){"+i+"return chk"+o[e]+";}body_"+e+".__dustBody=!0;";return n.join("")}function p(t,e){var r,n,o="";for(r=1,n=e.length;n>r;r++)o+=v.compileNode(t,e[r]);return o}function h(t,r,n){return"."+(e._aliases[n]||n)+"("+v.compileNode(t,r[1])+","+v.compileNode(t,r[2])+","+v.compileNode(t,r[4])+","+v.compileNode(t,r[3])+")"}function d(t){return t.replace(C,"\\\\").replace(N,'\\"').replace(A,"\\f").replace(k,"\\n").replace(E,"\\r").replace(R,"\\t")}function m(t,r,n){var o=e.loadSource(e.compile(t));return g(o)(r,n)}function y(t,r){var n=e.loadSource(e.compile(t,r));return g(n)}function g(t){return function(r,n){var o=n?"render":"stream";return e[o](t,r,n)}}var v={},b=e.isArray;v.compile=function(e,n){try{var o=r(t(e));return a(o,n)}catch(i){if(!i.line||!i.column)throw i;throw new SyntaxError(i.message+" At line : "+i.line+", column : "+i.column)}},v.filterNode=function(t,e){return v.optimizers[e[0]](t,e)},v.optimizers={body:o,buffer:u,special:i,format:c,reference:n,"#":n,"?":n,"^":n,"<":n,"+":n,"@":n,"%":n,partial:n,context:n,params:n,bodies:n,param:n,filters:u,key:u,path:u,literal:u,raw:u,comment:s,line:s,col:s},v.pragmas={esc:function(t,e,r){var n,o=t.auto;return e||(e="h"),t.auto="s"===e?"":e,n=p(t,r.block),t.auto=o,n}};var x={s:" ",n:"\n",r:"\r",lb:"{",rb:"}"};v.compileNode=function(t,e){return v.nodes[e[0]](t,e)},v.nodes={body:function(t,e){var r=t.index++,n="body_"+r;return t.bodies[r]=p(t,e),n},buffer:function(t,e){return".w("+S(e[1])+")"},format:function(t,e){return".w("+S(e[1])+")"},reference:function(t,e){return".f("+v.compileNode(t,e[1])+",ctx,"+v.compileNode(t,e[2])+")"},"#":function(t,e){return h(t,e,"section")},"?":function(t,e){return h(t,e,"exists")},"^":function(t,e){return h(t,e,"notexists")},"<":function(t,e){for(var r=e[4],n=1,o=r.length;o>n;n++){var i=r[n],u=i[1][1];if("block"===u)return t.blocks[e[1].text]=v.compileNode(t,i[2]),""}return""},"+":function(t,e){return"undefined"==typeof e[1].text&&"undefined"==typeof e[4]?".b(ctx.getBlock("+v.compileNode(t,e[1])+",chk, ctx),"+v.compileNode(t,e[2])+", {},"+v.compileNode(t,e[3])+")":".b(ctx.getBlock("+S(e[1].text)+"),"+v.compileNode(t,e[2])+","+v.compileNode(t,e[4])+","+v.compileNode(t,e[3])+")"},"@":function(t,e){return".h("+S(e[1].text)+","+v.compileNode(t,e[2])+","+v.compileNode(t,e[4])+","+v.compileNode(t,e[3])+","+v.compileNode(t,e[5])+")"},"%":function(t,e){var r,n,o,i,u,s,c,a,f,l=e[1][1];if(!v.pragmas[l])return"";for(r=e[4],n={},a=1,f=r.length;f>a;a++)s=r[a],n[s[1][1]]=s[2];for(o=e[3],i={},a=1,f=o.length;f>a;a++)c=o[a],i[c[1][1]]=c[2][1];return u=e[2][1]?e[2][1].text:null,v.pragmas[l](t,u,n,i)},partial:function(t,e){return".p("+v.compileNode(t,e[1])+",ctx,"+v.compileNode(t,e[2])+","+v.compileNode(t,e[3])+")"},context:function(t,e){return e[1]?"ctx.rebase("+v.compileNode(t,e[1])+")":"ctx"},params:function(t,e){for(var r=[],n=1,o=e.length;o>n;n++)r.push(v.compileNode(t,e[n]));return r.length?"{"+r.join(",")+"}":"{}"},bodies:function(t,e){for(var r=[],n=1,o=e.length;o>n;n++)r.push(v.compileNode(t,e[n]));return"{"+r.join(",")+"}"},param:function(t,e){return v.compileNode(t,e[1])+":"+v.compileNode(t,e[2])},filters:function(t,e){for(var r=[],n=1,o=e.length;o>n;n++){var i=e[n];r.push('"'+i+'"')}return'"'+t.auto+'"'+(r.length?",["+r.join(",")+"]":"")},key:function(t,e){return'ctx.get(["'+e[1]+'"], false)'},path:function(t,e){for(var r=e[1],n=e[2],o=[],i=0,u=n.length;u>i;i++)b(n[i])?o.push(v.compileNode(t,n[i])):o.push('"'+n[i]+'"');return"ctx.getPath("+r+", ["+o.join(",")+"])"},literal:function(t,e){return S(e[1])},raw:function(t,e){return".w("+S(e[1])+")"}};var C=/\\/g,N=/"/g,A=/\f/g,k=/\n/g,E=/\r/g,R=/\t/g,S="undefined"==typeof JSON?function(t){return'"'+d(t)+'"'}:JSON.stringify;return e.compiler=v,e.compile=e.compiler.compile,e.renderSource=m,e.compileFn=y,e.filterNode=v.filterNode,e.optimizers=v.optimizers,e.pragmas=v.pragmas,e.compileNode=v.compileNode,e.nodes=v.nodes,v}),"function"==typeof define&&define.amd&&define.amd.dust===!0&&define(["require","dust.core","dust.compile"],function(t,e){return e.onLoad=function(e,r){t([e],function(){r()})},e});