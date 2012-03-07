/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_proxy,
		_opener;

	W.append(function(core) {
		_ = core;
		
		_.open = function(url) {
			_opener(url);
		}
		
		_.setUrl = function(url) {
			var d = url.match(/[a-z]+:\/\/(.+:.*@)?([a-z0-9-\.]+)((:\d+)?\/.*)?/i);
			return (!_proxy || !d || d[2] == location.hostname)
				? url : _.addParam(_proxy, "__url", url);
		};
		
		_.splitUrl = function(u) {
			var s, q, d;
	
			s = u.replace(/&amp;/g, "&");	// TODO: always receive a Location object?
			d = s.indexOf("#");
			d = s.substr(d != -1 ? d : s.length);
			s = s.substr(0, s.length - d.length);
			q = s.indexOf("?");
			q = s.substr(q != -1 ? q : s.length);
			s = s.substr(0, s.length - q.length);
			q = !q ? [] : q.substr(1).split("&");
	
			return [s, q, d];
		}
	
		_.parseParams = function(s, np) {
			var ed = s.indexOf("#_");
			if (ed == -1) {
				return null;
			}
			var rs = "";
			var bs = _.splitUrl(s);
			if (!np) {
				for (var i = 0; i < bs[1].length; i++) {
					rs += "/" + bs[1][i].split("=").pop();
				}
			}
			return bs[2] + rs;
		}

		_.addParam = function(u, k, v) {
			u = _.splitUrl(u);
			var q = u[1].filter(
					function(o) { return o && o.indexOf(k + "=") != 0 });	// != 0 => any parameter not starting with (k + "=") no multiple name allowed!!! FIXME?
			q.push(k + "=" + encodeURIComponent(v));
			return u[0] + "?" + q.join("&") + u[2];
		}

		_.addParams = function(u, q) {
			u = _.splitUrl(u);
			u[1].push(q);
			return u[0] + "?" + u[1].join("&") + u[2];
		}
	});
	
	function defaultOpener(u) {
		window.location = u;
	}

	function extenderProxy(url) {
		_proxy = url;
	}

	function extenderOpener(func) {
		_opener = func || defaultOpener;
	}

	W.extend("proxy", extenderProxy);
	W.extend("opener", extenderOpener);

	W.extend("Proxy", extenderProxy, true);
	W.extend("Opener", extenderOpener, true);

	/* Initialization */	
	extenderOpener();
})();
