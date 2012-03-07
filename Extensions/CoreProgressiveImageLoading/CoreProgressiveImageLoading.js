/*global window, document */
/*global WebApp */

// TODO: xml based selection + parent stack

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_scrAmount,
		_scrID,
		_scrolling,
		_scrolled = true,
		_isActive = false,

	// RFC 2397 (http://www.scalora.org/projects/uriencoder/)
		_blank = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

	function load(i, c) {
		var o = i.getAttribute("data-load");	// TODO: use dataset
		if (o && c) {
			i.removeAttribute("data-load");		// TODO: use dataset
			i.src = o;
		}
	}

	function show() {
		if (_isActive) {
			var img = _.getActiveLayer().getElementsByTagName("img");
			for (var i = 0; i < img.length; i++) {
				load(img[i], _.isViewable(img[i]));
			}
		}
	}

	function check() {
		if (_scrAmount - _.winInfo().y == 0) {
			_scrID = window.clearInterval(_scrID);	// no return = disable _scrID
			show();
		}
	}

	function listener() {
		_scrolled = 1;
		if (_isActive /*&& !_sliding*/) {	// TODO: sliding
			if (!_scrolling) {
				_scrolling = 1;
				window.setTimeout(function() {
					_scrAmount = _.winInfo().y;
					_scrolling = 0;
				}, 500);
			}
			if (!_scrID) { _scrID = window.setInterval(check, 1000); }
		}
	}

	function extender(enable) {
		_isActive = enable;
	}
	
	W.append(function(core) {
		_ = core;

		_.Hook.add("contentPreProcessing", function(c) {
			return (!_isActive) ? c : c.replace(/(.*?<img.*?(\s)*?)src(=.+?>.*?)/g, "$1data-load$3");
		});

		_.Hook.add("contentPostProcessing", function(c) {
			if (_isActive) {
				var i, p, tmp = c.getElementsByTagName("img");
				for (i = 0; i < tmp.length; i++) {
					// Ignore elements with button parent
					if ( (p = _.getParent(tmp[i], "a")) &&
							(	p.rel.contains("action") ||
								p.rel.contains("back") ) ) {
						load(tmp[i], 1);
					} else {
						tmp[i].src = _blank;
					}
				}

				// Check for the images to display at first place
				listener();
			}
			return c;
		});

		document.addEventListener("scroll", listener, false);	// TODO: touch ou scroll
		W.AddEventListener("endslide", function() {		// TODO: utiliser les nouveaux events
			window.setTimeout(show, 0);
		});
	});

	/* Extend WebApp.Net with a new method */
	W.extend("progressive", extender);
	W.extend("Progressive", extender, true); // Compatibility
})();
