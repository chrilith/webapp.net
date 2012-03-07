/*global window, document */
/*global WebApp */

// Pas fini

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_dialog;	// Blocking form

	W.append(function(core) {
		_ = core;		
	});

	function buildQueryString(i, f) {
		var n, q = "";
		for (n = 0; n < i.length; n++) {
			i[n].blur();
			if (i[n].name && !i[n].disabled && (f ? f(i[n]) : 1)) {
				q += "&" + i[n].name + "=" + encodeURIComponent(i[n].value);
			}
		}
		return q;
	}
	
	function shouldAddValue(i) {
		return ((Contains(i.type, ["text", "password", "hidden", "search"]) ||
				(Contains(i.type, ["radio", "checkbox"]) && i.checked)))		
	}

	function extenderSubmit(frm) {
		var f = _.getFirstElementOfType(frm, "form");
		if (f) {
			var a = arguments[1],
				q = buildQueryString($$("input", f), shouldAddValue)
				  + buildQueryString($$("select", f))
				  + buildQueryString($$("textarea", f))
				  + "&" + (a && a.id ? a.id : "__submit") + "=1";
				q = q.substr(1); // TODO: add q to action if method=get (use AddParam)
			
			/*	Use getAttribute instead of f.action because if an element of the form
				is named "action", the element will be returned instead of the action attr.
			 */
			var u = ($A(f, "action") || self.location.href);
			if ($A(f, "method").toLowerCase() != "post") {
				u = _.addParams(u, q);
				q = null;
			}

			_.getAsyncContent(u, null, q);	// Required: CoreContentRequester
			if (_dialog) { $pc.Form(_dialog); } // TODO: hook pour HeaderManager ou deplacement
		}

		return false;
	}

	W.extend("submit", extenderSubmit);
	W.extend("Submit", extenderSubmit, true);

})();
