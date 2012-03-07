/*global window, document, Image */
/*global WebApp */

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_loader = [];

	function getAnimInfo(o) {
/*
	[1] = first part of the filename
	[2] = delay
	[3] = frame count
	[4] = frame index
	[5] = end part of the filename
*/
		var u;
		if ((u = window.getComputedStyle(o, null).backgroundImage)) {	// null is required for Firefox
			o._ = 1;	// To track if loading animation is still active
			return (/(.+?(\d+)x(\d+)x)(\d+)(.*)/).exec(u);
		}
		return undefined;
	}

	function animator(a) {
		if (!a[5]) {
			a[1]  = a[1] % a[2] + 1;
			var b = a[3].replace("*", a[1]);
			a[4].onload = function() {
				if (a[0]._) {
					a[0].style.backgroundImage = b;	// TODO: handle multiple background
					a[5] = 0;
				}
			};
			a[5] = a[4].src = b.substr(4, b.length - 5).replace(/"/g, "");	// Remove " for Firefox
		}
	}

	function prepare(o) {
		var d, c, i;
		
		// if the object has no background with anim definition, search any child
		if (!(d = getAnimInfo(o))) {
			c = o.getElementsByTagName("*");
			for (i = 0; i < c.length; i++) {
				o = c[i];
				if ((d = getAnimInfo(o))) {
					break;
				}
			}
		}
		// return the animator or nothing (see above for description of the d[])
		return !d ? d : [o, window.setInterval(animator, d[2], [o, d[4], d[3], (d[1] + "*" + d[5]), new Image() ])];
	}

	function extender(obj, show) {
		var o, f, c, h = false;

		if ((o = _.$(obj))) {
			c = o.classList;
			h = c.contains("__lod");
			if (!(show ? !h : h)) {	// XOR
				return h;
			}

// TODO: Hook["loaderInit"] ??
//			_.applyMoreButton(o);	// CoreUIMoreButton method

			if (show) {
				c.add("__lod");
				_loader.push([o, prepare(o)]);

			} else {
				c.remove("__lod");
				f = _loader.filter(function(a) {
					return (a[0] == o);
				})[0];
				_loader.splice(_loader.indexOf(f), 1);
				if ((f = f[1])) {
					f[0]._ = 0;
					window.clearInterval(f[1]);
					f[0].style.backgroundImage = "";
				}
			}
		}

		return h;
	}

	/* extend WebApp with a new method */
	W.append(function(core) {
		_ = core;
	})
	W.extend("loader", extender);
	W.extend("Loader", extender, true); // Compatibility
})();
