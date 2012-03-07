/*global WebApp */

// DONE //
// TODO: gestion de l'evenement click???

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp;

	function swapText(o, restore) {
		if (o.classList.contains("iMore")) {
			var b, a = o.querySelector("a");
			if (a && a.title) {
				var s = a.querySelector("span") || a;
				b = s.innerHTML;
				s.innerHTML = a.title;
				a.title = b;
			}
		}
		// Do not instanciate a new object if restoring the text
		return restore || function(x, d, c) {
			c(x); swapText(o, 1);
		}
	}

	W.append(function(core) {
		_ = core;
		_.Hook.add("eventPostOnClick", function(p, e) {
			if (p !== true) {
				var o = e.target,
					a = _.getLink(o),
					x = a && _.isAsync(a),
					c;

				if ((p = _.anyOf(o, "iMore"))) {
					if (!p.classList.contains("__lod")) {
						W.loader(p, 1);
						c = swapText(p, !x);	// No callback is no async content
						if (x) { _.getAsyncContent(a, c); }
					}
					return true;
				}
			}
			return p; // "p" may be defined to Object but !== true, use p here just for convenience
		});
	});
})();
