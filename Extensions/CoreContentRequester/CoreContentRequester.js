/*global window, document */
/*global WebApp */

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_ajax = [],
		_proxy;			// TODO

	W.append(function(core) {
		_ = core;
	});

	function ReadTextNodes(o) {
		var nds = o.childNodes;
		var txt = "";
		for (var y = 0; y < nds.length; y++) {
			txt += nds[y].nodeValue;
		}
		return txt;
	}

	function onStateChanged(o, cb, lr) {
		if (o.readyState != 4) {
			return;
		}
		var er, ld, ob;

		if ((ob = _ajax.filter(function(a) { return o == a[0] })[0])) {
//TODO		CallListeners("endasync", ob.pop(), ob[0]);
			//Remove(_ajax, ob);
//			_ajax.splice(_ajax.indexOf(ob), 1);
		}

		er = (o.status != 200 && o.status != 0); // 0 for file scheme requests
//		if (!er && !o.responseXML) {
//TODO		o.responseJSON = JSON(o.responseText);
//		}

		try { if (cb) { ld = cb(o, lr, DefaultCallback()); } } 
		catch (ex) { er = ex; console.error(er); }

		if (lr) {
			W.loader(lr, 0);
			if (er) {
				lr.classList.remove("__sel");
				lr.classList.remove("__tap");
			}
		}
	}
	
	// TODO: optimize this!!!!
	function DefaultCallback(i, np) {
//		var c = 
		return function(o) {
			var u = i ? _.parseParams(i, np) : null;
			var g = _.ShowAsync(o);

			if (g && (g[1] || u)) {
				_.Forward(g[1] || u);
			} else {
				_.Cleanup(); //setTimeout(Cleanup, 250);
			}
			return null;
		};

//		c.toString = function() { return "[WebApp.Net AJAX Callback]" };
//		return c;
	}

	_.getAsyncContent = function(item, cb, q) {
		var h, o, u, i;

		i = (typeof item == "object");
		u = (i ? item.href : item);
		o = _.getParent(item, "li");	// get loader

		if (!cb) { cb = DefaultCallback(u, false/*HasToken(item.rev, "async:np")*/); }
		extender(u, q, cb, false, o, (i ? item : null));
	}

	function extender(url, prms, cb, noAsync, loader) {
		// allow default callback only when document is fully loaded
/*		if (_historyPos === cb) {	// TODO
			return;
		}*/

// TODO: add real event to loader if any

		var r, a = [url, prms];
/*		if (!CallListeners("beginasync", a)) {
			if (loader) {
				setTimeout(DelClass, 100, loader, "__sel");	// TO have feedback - will be removed if touchstart is added
			}
		} else {*/
//			url		= a[0];	// Can be changed in beginasync event
//			prms	= a[1];

			cb = (cb == -1) ? DefaultCallback() : cb;	// TODO

			var o = new XMLHttpRequest();
			var c = function() { onStateChanged(o, cb, loader) };	// TODO
			var m = prms ? "POST" : "GET";

			noAsync = !!noAsync;
			if (loader) { W.loader(loader, 1); }
			_ajax.push([o, a]);	// ????

			url = _.addParam(url, "__async", "true");
/*	TODO	if (_historyPos >= 0) {
				url = AddParam(url, "__source", _history[_historyPos][0]);
			}*/
			url = _.setUrl(url);

			o.open(m, url, !noAsync);
			if (prms) { o.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); }
//			CallListeners("willasync", a, o);
			o.onreadystatechange = (noAsync) ? null : c;
			o.send(prms);

			if (noAsync) { c(); }
//		}
	}

	function extenderCompatibility(url, prms, cb, async, loader) {
		extender(url, prms, cb, !async, loader);
	}

	/* extend WebApp with a new method */
	WebApp.extend("request", extender);
	WebApp.extend("Request", extenderCompatibility, true); // Compatibility

})();
