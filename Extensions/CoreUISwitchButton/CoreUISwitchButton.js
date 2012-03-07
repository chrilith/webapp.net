/*global window, document */
/*global WebApp */

// DONE

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_radio,
		_layer;

	function apply(p) {
		var i, c, o = p.getElementsByTagName("input");	// TODO: use getElementsByClassName

		for (i = 0; i < o.length; i++) {
			c = o[i].classList;
			if (o[i].type == "checkbox" && c.contains("iToggle") && !c.contains("__done")) {
				o[i].id		= o[i].id || "__" + Math.random();
				o[i].title	= o[i].title || "ON|OFF";

				var txt = o[i].title.split("|"),
					b1  = document.createElement("b"),
					b2  = document.createElement("b"),
					i1  = document.createElement("i");

				b1.innerHTML = "&nbsp;";
				b1.className = "iToggle";
				b1.title = o[i].id;
				i1.innerHTML = txt[1];

				b1.appendChild(b2);
				b1.appendChild(i1);
				o[i].parentNode.insertBefore(b1, o[i]);
				b1.onclick = function() { update(this) };
				update(b1, true);
				c.add("__done");
			}
		}
	}
	
	// <b><b>OFF</b><i></i></b>
	//     o
	//  o
	function update(o, dontChange) {
		var c = o.classList,
			i = document.getElementById(o.title),
			txt = i.title.split("|");

		if (!dontChange) {
			i.click();
		}

		if (i.disabled) {
			c.add("__dis");
		} else {
			c.remove("__dis");
		}

		var l  = o.lastChild;
			s1 = o.firstChild.nextSibling.style,
			s2 = l.style,
			ck = i.checked;

		l.innerHTML = txt[ck ? 0 : 1];
		if (ck) {
			s1.left  = "";
			s2.left  = 0;
			s1.right = "-1px";
			s2.right = "";
			c.add("__sel");
		} else {
			s1.left  = "-1px";
			s2.left  = "";
			s1.right = "";
			s2.right = 0;
			c.remove("__sel");
		}
	}

	WebApp.append(function(core) {
		_ = core;
		
		_.Hook.add("viewBeginChange", function(p, src, dst, dir) {
			apply(dst);
		});
		
		_.Hook.add("eventPreOnClick", function(p, e) {
			if (p !== true) {
				/* Checkbox label */
				var o = e.target,
					n = _.getName(o);
				if (n == "label") {
					var f = document.getElementById(o.getAttribute("for"));
					if (f && f.classList.contains("iToggle")) {
						window.setTimeout(update, 1, f.previousSibling, true);
					}
				}
			}
			return p;
		});

	});
	
	/* Initialization */
	_.Hook.add("onInit", function() {
		apply(_.getActiveLayer());
	});
})();
