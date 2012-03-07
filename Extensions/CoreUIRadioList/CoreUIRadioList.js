/*global window, document */
/*global WebApp */

// DONE

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_radio,
		_layer;

	function apply(p) {
		var i, c, o = p.getElementsByTagName("li");	// TODO: use getElementsByClassName

		// search each <li> for unprocessed iRadio
		for (i = 0; i < o.length; i++) {
			c = o[i].classList;
			if (c.contains("iRadio") && !c.contains("__done")) {
				var lnk = document.createElement("a"),
					sel = document.createElement("span"),
					inp = o[i].getElementsByTagName("input");

				lnk.href = "#";
				lnk.appendChild(sel);
				while (o[i].hasChildNodes()) {
					lnk.appendChild(o[i].firstChild);
				}
				o[i].appendChild(lnk);
				c.add("__done");	// TODO: use dataset
				update(inp, o[i]);
			}
		}
	}

	function update(r, p) {
		for (var j = 0; j < r.length; j++) {
			var o = r[j];

			if  (o.type == "radio" &&
				(o.checked || o.getAttribute("checked"))) {	// Safari bug, have to use getAttribute and set checked state from async content

				o.checked = true;
				p = (p || _.getParent(r[j], "li")).getElementsByTagName("span")[0];
				p.innerHTML = _.getText(o.parentNode);
				break;
			}
		}
	}

	function click(a, u) {
		var p = _radio;
		var x = p.getElementsByTagName("input");
		var y = u.getElementsByTagName("a");

		for (var i = 0; i < y.length; i++) {
			if (y[i] == a) {
				var c = x[i].onclick;
				if (x[i].disabled ||
					(c && c() === false)) {
					return false;
				}

				x[i].checked = true;
				update([x[i]]);
				//$$("span", p)[0].innerHTML = GetText(x[i].parentNode);
				if (p.getAttribute("value") == "autoback") {
					window.setTimeout(W.back, 0);
				}
				break;
			}
		}
	}

	function show(p) {
		var c,
			o = p.getElementsByTagName("input"),
			dv = document.createElement("div"),
			ul = document.createElement("ul");

		ul.className = "iCheck";
		_radio = p;

		for (var i = 0; i < o.length; i++) {
			if (o[i].type == "radio") {
				var li = document.createElement("li"),
					a  = document.createElement("a");

				a.href = "#";
				a.innerHTML = o[i].nextSibling.nodeValue; // TODO: is that correct???

				li.appendChild(a);
				ul.appendChild(li);

				c = li.classList;
				if (o[i].checked)	{ c.add("__act"); }
				if (o[i].disabled)	{ c.add("__dis"); }
			}
		}

		dv.className = "iMenu";
		dv.appendChild(ul);

		o = _layer;
		if (o.firstChild) {
			o.removeChild(o.firstChild);
		}
		o.title = _.getText(p.firstChild);
		o.appendChild(dv);
	}

	WebApp.append(function(core) {
		_ = core;
		
		_.Hook.add("viewBeginChange", function(p, src, dst, dir) {
			apply(dst);
		});

		_.Hook.add("eventPostOnClick", function(p, e) {
			if (p !== true) {
				/* Radio parent */
				var o = e.target,
					a = _.getLink(o),
					u = _.getParent(o, "ul"),
					l = _.getParent(o, "li"),
					c  = !l || l.classList;

				if (l && c.contains("iRadio")) {
					c.add("__sel");

					show(l);
					_.hold(location.href);
					_.slideTo("wa__radio");
					return true;
				}

				/* Radio list */
				c  = !u || u.classList;
				if (u && c.contains("iCheck")) {
					if (click(a, u) !== false) {
						a = u.querySelectorAll("li");
						for (var i = 0; i < a.length; i++) {
							c = a[i].classList;
							c.remove("__act");
							c.remove("__sel");
						}
						c = l.classList;
						c.add("__act");
						c.add("__sel");
						window.setTimeout(function() {
							c.remove("__sel");
						}, 500);
					}
					return true;
				}
			}
			return p;
		});
	});
	
	/* Initialization */
	_.Hook.add("onInit", function() {
		// create the layer to show radio selection
		_layer = _.createLayer("wa__radio");
		apply(_.getActiveLayer());
	});
})();
