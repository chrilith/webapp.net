/*global window */



/*
	DOMTokenList Implementation
	---------------------------
	Limitation:
		- Implementation doesn't raise SYNTAX_ERR and INVALID_CHARACTER_ERR
*/

if (!window.DOMTokenList) { (function() {
	var DOMTokenList = function(parent, prop) {
		this.__parent = parent;
		this.__prop = prop;
	};
	var O = DOMTokenList.prototype;

	O.toString = function() {
		return "[WebApp.Net DOMTokenList]";
	}

	O.__defineGetter__("length", function() {
		return this._().length;
	});

	O._ = function() {
		return this.__parent[this.__prop].split(" ");
	};

	O.item = function(idx) {
		return this._()[idx] || null;
	};

	O.contains = function(token) {
		return this._().indexOf(token) != -1;
	};

	O.add = function(token) {
		if (!this.contains(token)) {
			this.__parent[this.__prop] += " " + token;
		}
	};

	O.remove = function(token) {
		this.__parent[this.__prop] =
			this._().filter(function(f) { return token != f; }).join(" ");
	};

	O.toggle = function(token) {
		var e = this.contains(token);
		this[e ? "remove" : "add"](token);
		return !e;
	};

	HTMLElement.prototype.__defineGetter__("classList", function() {
		this._classList = this._classList || new DOMTokenList(this, "className");
		return this._classList;
	});

	HTMLLinkElement.prototype.__defineGetter__("relList", function() {
		this._relList = this._relList || new DOMTokenList(this, "rel");
		return this._relList;
	});

	HTMLAreaElement.prototype.__defineGetter__("relList", function() {
		this._relList = this._relList || new DOMTokenList(this, "rel");
		return this._relList;
	});
})(); }

// http://www.tutorialspoint.com/javascript/array_filter.htm

/*
	DOMStringMap Implementation
	---------------------------
	Limitation:
		- Implementation is read only
*/
/*
if (!window.DOMStringMap) { (function() {
	var DOMStringMap = function(parent) {
		this.__parent = parent;
	};
	var O = DOMStringMap.prototype;
	
	O.toString = function() {
		return "[WebApp DOMStringMap]";
	}

	function readSet(ds) {
		var p, i, j, a, b;
		for (p in ds) {
			if (p[0] != '_') {
				delete ds[p];
			}
		}
		a = ds.__parent.attributes;
		for (i = 0; i < a.length; i++) {
			if ((p = /data-([a-z][a-z0-9-]+)/.exec(a[i].name))) {
				p = p[1].toLowerCase().split('-');
				for (b = p[0], j = 1; j < p.length; j++) {
					b += p[j][0].toUpperCase() + p[j].substr(1);
				}
				ds[b] = a[i].value;
			}
		}
		return ds;
	}

	window.HTMLElement.prototype.__defineGetter__("dataset", function() {
		this._dataset = this._dataset || new DOMStringMap(this);
		return readSet(this._dataset);
	});

})(); }
*/

// Array.filter
// Array.indexOf
// HTMLElement.insertAdjacentHTML
// Object.defineProperty()
// getElementsByClassName