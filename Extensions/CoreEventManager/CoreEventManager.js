/*global window, document */
/*global WebApp */

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_events = {},
		_timerID;

/* Async event manager */
	function get(type) {
		return (_events[type] || []);
	}

	function extenderAddListener(id, type, listener, useCapture) {
		var e, o = document.getElementById(id);
		if (o) {
			o.addEventListener(type, listener, useCapture);
		} else {
			e = get(type);
			e.push([id, type, listener, useCapture]);
			_events[type] = e;
		}
	}

	/* Ne supprime que avant l'association puisque event ne peut pas exister avant objet */
	function extenderRemoveListener(id, type, listener, useCapture) {
		var e = get(type),
			i = e.lastIndexOf(
				e.filter(function(o) {
				return (o[0] == id &&
						o[1] == type &&
						o[2] == listener &&
						o[3] == useCapture);
			}).pop());

		if (i != -1) {
			e.splice(i, 1);
			if ((i = document.getElementById(id))) {
				i.removeEventListener(type, listener, useCapture);
			}
		}
	}

/* Obsolete */
	var _handler = {};

	function extenderAddEventListener(evt, handler) {
		var h = _handler[evt] || [];
		_handler[evt] = h;
		
		if (h.indexOf(handler) == -1) {
			h.push(handler);
		}
	}

	function extenderRemoveEventListener(evt, handler) {
		var h = _handler[evt];
		if (h != undefined) {
			h.splice(h.lastIndexOf(handler), 1);
		}
	}

	function call(evt, ctx, obj) {
		var l, h = _handler[evt];
		// Do not waste time and memory if no handler have been defined for the given event
		if (!h || (l = h.length) == 0) {
			return true;
		}
		
		e = _.getEvent();
		e.type = evt;
		e.target = obj || null;
		e.context = ctx || e.context;

		var k = true;
		for (var i = 0; i < l; i++) {
			k = k && (h[i](e) == false ? false : true);
		}
		return k;
	}


/* Click event handler */
	function noEvent(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	function unselect(li) {
//		if (li) {
			window.setTimeout(function() {
				li.classList.remove("__sel");	// TODO: multiple dans API ???
				li.classList.remove("__tap");
			}, 1000);
//		}
	}
	
	/* TODO: optimize this to prevent multiple call while updating */
	// verifier le fonctionnement avec log() sur terminal
	function listenerTreeModified(e) {
//		console.log("called");
//		console.log(e.target);	// rechercher dans le tree modifié ?
		window.clearTimeout(_timerID);
		_timerID = window.setTimeout(processAsyncEvent, 0);
	}
	
	function processAsyncEvent() {
//		console.log("processed");
		_timerID = undefined;
		for (var type in _events) {
			var o, c, a = get(type);
			for (var j = 0; j < a.length; j++) {
				c = a[j];
				if ((o = document.getElementById(c[0]))) {
					o.addEventListener(c[1], c[2], c[3]);
					a.splice(j--, 1);
				}
			}
		}		
	}

	function listener(e) {
/*		if (_sliding) {	// TODO avec un PreOnClick
			return noEvent(e);
		}		*/
		if (_.Hook.call("eventPreOnClick", false, e)) {
			return noEvent(e);
		}

		var o  = e.target,	// currentTarget ???
			a  = _.getLink(o),
			li = _.getParent(o, "li"),
			c  = !li || li.classList;

		/* handle onclick event on links */
		if (a && li && c.contains("__dis")) {
			return noEvent(e);
		}

		/*	Warning: if onclick="return false" and doesn't call any other code,
			a.onclick will be null and the following code will not be executed.
		*/
        if (a && a.onclick) {
			var old = a.onclick;
			a.onclick = null;			// prevent double execution
			var val = old.call(a, e);

			window.setTimeout(function() {
				a.onclick = old;
			}, 0);

			if (val === false) {
				if (li) {
					c.add(a.classList.contains("iSide") ? "__tap" : "__sel");
					unselect(li);
				}
				return noEvent(e);
			}
        }

		if (_.Hook.call("eventPostOnClick", false, e)) {
			return noEvent(e);
		}
		
		/* Basic async link */
		if (a && _.isAsync(a)) {
			_.getAsyncContent(a);
			noEvent(e);

		} else if (a && !a.target) {
			/* Basic go layer */
/*			if (startsWith(a.href, "http:", "https:", "file:")) {	// file: for local testing
				Forward(a.href);
				noEvent(e);	TODO
			}
			unselect(li);*/
		}

		return undefined;
	}

	W.extend("addEventListenerAsync", extenderAddListener);
	W.extend("removeEventListenerAsync", extenderRemoveListener);
	W.extend("AddEventListener", extenderAddEventListener, true);
	W.extend("RemoveEventListener", extenderRemoveEventListener, true);

	W.append(function(core) {
		_ = core;
		
		// Obsolete
		_.CallListeners = call;
		
		document.addEventListener("click", listener, true);
		document.addEventListener("DOMSubtreeModified", listenerTreeModified, false);
	});
})();
