var WebApp = new function() {
	var _ = this;
/*	
	_.Core = {
		toString: function() {
			return "[Core Global Methods]";
		}
	};
*/	
//	_.__DefineSetter__("_sliding", function() { return _sliding });

	
	// var _ = this; this.test = "DATA"; // Then in the ext. alert(test) => DATA
	
	var _def, _headView, _head, _header;
	var _webapp, _group, _bdo, _bdy, _file;
	var _maxw, _maxh;
	var _scrID, _scrolling, _scrAmount;
	var /*_opener,*/ _radio /*, _nomove, _noslide*/;
	
//	_.test = "Accessed";

	var _prev		= -1;	// for beginslide/endslide event (SlideInfo)
	var _historyPos	= -1;	// warning: must order properly var names for reduction script
	var _history	= [];
	var _loader		= [];
	var _fading		= [];
	var _ajax		= [];
	var _initialNav	= history.length;
//	var _sliding	= 0;
	var _hold		= 0;
	var _baseTitle	= "";
	var _baseBack	= "";
//	var _lockCnt	= 0;
	var _width		= 0;
	var _height		= 0;
	var _lastScroll	= 1;
	var _dialog		= null;
	var _scrolled	= 1;
	var _proxy		= "";
//	var _pil		= 0;
	var _tmp		= setInterval(InitBlocks, 250);
	var _locker		= null;
	var _win		= window;
	
	_._sliding = 0;
	
	// RFC 2397 (http://www.scalora.org/projects/uriencoder/)
//	var _blank		= "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

	var _wkt;
	var _v2			= !!document.getElementsByClassName && UA("WebKit");	// FIXME: no UA?
	var _fullscreen	= !!navigator.standalone;
	var _touch		= IsDefined(_win.ontouchstart) && !UA("Android");	// FIXME: null on android???
	var _translator	= _touch ? tr_iphone : tr_others;					// FIXME: added for WKT bug on Iphone 3

//	var _detach		= {};
/*	_handler.load				= [];
	_handler.beginslide			= [];
	_handler.endslide			= [];
	_handler.beginasync			= [];
	_handler.willasync			= [];
	_handler.endasync			= [];
	_handler.orientationchange	= [];
	_handler.tabchange			= [];*/
//	_handler.contentchange		= [];

/* Public */
	var _o_acl = false;

	var d = document;
	var $h = {
		get HEAD() { return 0 },
		get BACK() { return 1 },
		get HOME() { return 2 },
		get LEFT() { return 3 },
		get RIGHT() { return 4 },
		get TITLE() { return 5 }
	};
	var $d = {
		get L2R() { return +1 },
		get R2L() { return -1 }
	};
	d.wa = {
		get autoCreateLayer() { return _o_acl; },
		set autoCreateLayer(v) { _o_acl = (v == "true" || v == "yes" || v === true) },
		
		get header() { return $h },
		get direction() { return $d }
	};
	d.webapp = d.wa;

	var $pc = {
		get Version() { return 'v0.6.0 WIP' },

		Refresh: function(id) {
			if (id !== false) {
				var o = $(id);

				if (!o) {
					InitForms();
				} else if (o.type == "radio") {
					UpdateRadio([o]);
				} else if (o.type == "checkbox") {
					FlipCheck(o.previousSibling, 1);
				}
			}

			/* reset layer title */
			SetTitle();
			SetBackButton();

			/* force adjustment in height of the active layer */
			Resizer();
		},

		HideBar: function() {
			if (_scrolled && IsMobile()) {
				_scrolled = 0;
				ToTop(1); setTimeout(ToTop, 0);
			}
			return false;
		},

		Header: function(show, what, keep) {
			ShowHeader();			// HACK: be sure to always have all header elements displayed before removing them...
			if (keep != -1)	{		// keep all header controls?
				Buttons(!show, keep);
			}

			Display(_headView, 0);	// hide previous if any
			_headView = $(what);
			Display(_headView, show);

			_header[$h.HEAD].style.zIndex = !show ? 2 : "";
			return false;
		},

		Tab: function(id, active) {
			var o = $(id);
			ShowTab(o, $$("li", o)[active]);
		},

/*
		Extension: function(ext) {
			if (_file) {
				var f, b = _file + "Extensions/" + ext;

				//	In f...ing Safari dynamic <script> element are loaded after document load...
					this is a very bad hack to workaround this problem ... I hate Safari.
					The good part is that it immediately evaluates the code!!!!!
				 //
				f = b + ".js";
				if (f = FileRead(f))
					NewScript(f);

				f = b + ".css";
				if (f = FileRead(f))
					NewStyle(f);
//
				if (FileExists(f)) {
					s = NewItem("link");
					s.rel = "stylesheet";
					s.type = "text/css";
					s.href = f;
					h.appendChild(s);
				}
//
			}
		},

*/

		Form: function(frm, focus) {
			var s, a, b, c, o, k, f, t, i;

			a = $(frm);
			b = $(_history[_historyPos][0]);
			s = (a.style.display != "block");

			f = GetForm(a);
			with (_header[$h.HEAD]) {
				t = offsetTop + offsetHeight;
			}

			// WARNING: this variable (k?) must not be changed, else onsumbit will not point to the function anymore!
			if (s) { a.style.top = t + "px"; }
			if (f) {
				k = f.onsubmit;
				if (!s) {
					f.onsubmit = f.onsubmit(0, 1);
				} else {
					f.onsubmit = function(e, b) {
						if (b) { return k; }			// return the old onsubmit
						if (e) { NoEvent(e); }			// or process actions...
						if (!(k && k(e) === false)) {
							$pc.Submit(this, null, e);
						}
					};
				}
			}

			Display(a, s);
			Shadow(s, t + a.offsetHeight);

			o = $$("legend", a)[0];
			SetTitle(s && o ? o.innerHTML : null);

			_dialog = (s) ? a : null;
			if (s) { c = a; a = b; b = c }

			DelLayerButtons(a);
			AddLayerButtons(b, s);

			if (s) {
				$pc.Header();
				if (focus && (i = $$("input", f)[0])) {
					i.focus();
				}
			} else {
				Buttons(!s);
			}
			return false;
		},

		Submit: function(frm) {
			var f = GetForm(frm);
			if (f) {
				var a = arguments[1];
				var _a = function(i, f) {
					var q = "";
					for (var n = 0; n < i.length; n++) {
						i[n].blur();
						if (i[n].name && !i[n].disabled && (f ? f(i[n]) : 1)) {
							q += "&" + i[n].name + "=" + encodeURIComponent(i[n].value);
						}
					}
					return q;
				}

				var q  = _($$("input", f),
					function(i) {
						with(i) {
							return ((Contains(type, ["text", "password", "hidden", "search"]) ||
									(Contains(type, ["radio", "checkbox"]) && checked)))
						}
					});
					q += _a($$("select", f));
					q += _a($$("textarea", f));
					q += "&" + (a && a.id ? a.id : "__submit") + "=1";
					q  = q.substr(1); // TODO: add q to action if method=get (use AddParam)
				
				/*	Use getAttribute instead of f.action because if an element of the form
					is named "action", the element will be returned instead of the action attr.
				 */
				var u = ($A(f, "action") || self.location.href);
				if ($A(f, "method").toLowerCase() != "post") {
					u = _.addParams(u, q);
					q = null;
				}

				BasicAsync(u, null, q);
				if (_dialog) { $pc.Form(_dialog); }
			}

			return false;
		},

		Postable: function(keys, values) {
			var q = "";
			for (var i = 1; i < values.length && i <= keys.length; i++) {
				q += "&" + keys[i - 1] + "=" + encodeURIComponent(values[i]);
			}
			return q.replace(/&=/g, "&").substr(1);
		},

		extend: function(n, m, o) {
			this[n] = function() {
				if (o) {
					console.log("Method WebApp." + n + "() is obsolete.");
				}
				m.apply(_, arguments);
			};
		},

		append: function(n) { n(_); },
		
/*
		Activate: function(id) {
			id = id || _def;
			_noslide = 1;
			_opener(Go(id));
			return false;
		},
*/
		Player: function(src) {
			if (!IsMobile()) {
				_win.open(src);
			} else {
//				var a = arguments[1];
//				var t = (a && _v2);

				// prevent the back request sent by the internal player
//				if (!t) location = "#" + Math.random();
				if (_v2) { location = "#" + Math.random(); }

				var w = $("__wa_media");
				var o = NewItem("iframe");
				o.id = "__wa_media";
				o.src = src;			// must be before appendChild to prevent Safari weird behavior

				_webapp.appendChild(o);
				DelItem(w);

/*
				var w = $("__wa_media");
				//	keep iframe if !a, for an obscur reason Play() doesn't produce any effect
					if not called processing "click" event. Also, appendChild work but
					raise an exception ('result of _webapp.appendChild is not an object').
					TODO: fill a bug report
				 //
				var o = NewItem(t ? "embed" : "iframe");

				o.id = "__wa_media";
				o.setAttribute("postdomevents", "true");	// add it even if it is a <iframe> element
				o.src = src;								// must be before appendChild to prevent Safari weird behavior

				(a || _webapp).appendChild(o);
				if (t) o.Play();
				if (w) DelItem(w);*/
			}
			return false;
		},

		ProgressHUD: function(str) {
			var f, c, i = "iProgressHUD";
			if (!(c = $(i))) {
				c = NewItem("div");
				c.id = i;
				c.appendChild(NewItem("div"));
				_bdy.appendChild(c);
			}
			AdjustView();
			Display(c, str);
			$pc.Loader(i, str);

//			(str ? Lock : Unlock)();

			f = c.firstChild;
			f.innerHTML = str;
			with (c.style) {
				top = (WIN().h - f.offsetHeight) / 2 + "px";
				visibility = str ? "visible" : "";
			}
		},

		toString: function() { return "[WebApp.Net Framework]"; }

/*,

		StatusBar: function() {
			var fnd = 0;
			var mta = $$("meta");
			var cnt = "apple-mobile-web-app-status-bar-style";
			for (var i = 0; i < mta.length && !fnd; i++)
				fnd = (mta[i].name == cnt);
			if (fnd) mta = mta[i - 1];

			var arg = arguments;
			if (arg.length) {
				if (!fnd) {
					mta = NewItem("meta");
					mta.name = cnt;
					$$("head")[0].appendChild(mta);
				}
				mta.content = arg[0];
			}
			return mta.content;
		}*/
	}
/*
	function FileRead(f) {
		with (new XMLHttpRequest()) {
			open("GET", f, false);
			send(null);
			return responseText;
		}
	}
*/
/*
	function FileExists(f) {
		with (new XMLHttpRequest()) {
			open("HEAD", f, false);
			send(null);
			return (status == 0 || status== 200);
		}
	}
*/

/*	_.Hook.add("contentPreProcessing", function(c) {
		console.log("ImagesParse");
		return ImagesParse(c);
	});
	_.Hook.add("contentPostProcessing", function(c) {
		console.log("contentPostProcessing");
		ImagesInit(c);
		return c;
	});
*/

	function ToTop(h) {
		h = h ? h : 0;
		_webapp.style.minHeight = (_height + h) + "px";
		_win.scrollTo(0, h);
	}

	function CalcEaseOut(s, w, dir, step, mn) {
		s += Math.max((w - s) / step, mn || 4);
		return [s, (w + w * dir) / 2 - Math.min(s, w) * dir];
	}


	function Buttons(s, k) {
		if (_head) {
			var h = _header;
			k = (s) ? [] : k || []; // if have to show header, ignore k parameter

			for (var i = 1; i < h.length; i++) {	// don't hide HEAD, just hide content
				if (!Contains(i, k)) {
					Display(h[i], s);
				}
			}

			with ($h) {
				if (!Contains(BACK, k)) {
					Display(h[BACK], s && !h[LEFT] && _.position());
				}
				if (!Contains(HOME, k)) {
					Display(h[HOME], s && !h[RIGHT] && !_hold && _.position() > 1);
				}
			}
		}
	}

	function AddLayerButtons(lay, ignore) {
		if (_head) {
			var a = $$("a", lay);
			var p = $h.RIGHT;
	
			for (var i = 0; i < a.length && p >= $h.LEFT; i++) {
				if (_header[p] && !ignore) { i--; p--; continue; }

				if (HasToken(a[i].rel, "action") ||
					HasToken(a[i].rel, "back")) {
	
					AddClass(a[i], p == $h.RIGHT ? "iRightButton" : "iLeftButton");
					Display(a[i], 1);
					_header[p--] = a[i];
					_head.appendChild(a[i--]);
				}
			}
		}
	}

	function DelLayerButtons(lay) {
		if (_head) { 
			with ($h) {
				for (var i = LEFT; i <= RIGHT; i++) {
					var a = _header[i];
					if (a && (	HasToken(a.rel, "action") ||
								HasToken(a.rel, "back")) ) {
		
						Display(a, 0);
						DelClass(a, i == RIGHT ? "iRightButton" : "iLeftButton");
						lay.insertBefore(a, lay.firstChild);
					}
				}
				_header[RIGHT] = $("waRightButton");
				_header[LEFT] = $("waLeftButton");
			}
		}
	}

/* Private */
	function NoTag(s) { return s.replace(/<.+?>/g, "").replace(/^\s+|\s+$/g, "").replace(/\s{2,}/, " "); }
	function NoEvent(e) { e.preventDefault(); e.stopPropagation(); }
	function IsAsync(o) { return HasToken(o.rev, "async") || HasToken(o.rev, "async:np"); }
	function IsMedia(o) { return HasToken(o.rev, "media") /*|| HasToken(o.rev, "media:audio") || HasToken(o.rev, "media:video");*/ }
	function IsDefined(o) { return (typeof o != "undefined"); }
	function Contains(o, a) { return a.indexOf(o) != -1 }
	
	_.isAsync = function(o) {
		return IsAsync(o);
	}
	
	_.$ = $;

	function $(i) { return typeof i == "string" ? document.getElementById(i) : i; }
	function $$(t, o) { return (o || document).getElementsByTagName(t); }
	function $A(o, a) { return o.getAttribute(a) || ""; }

	_.$ = function(i) {
		return $(i);
	}

	_.objInfo = function(o) {
		return XY(o);
	}

	function XY(e) {
		var x = 0;
		var y = 0;

		while (e) {
			x += e.offsetLeft;
			y += e.offsetTop;
			e  = e.offsetParent;
		}

		return {x:x, y:y};
	}
	
	_.winInfo = function() {
		return WIN();
	}
	
	function WIN() {
		with (_win) return { x:pageXOffset, y:pageYOffset, w:innerWidth, h:innerHeight };
	}

	function NewScript(c) {
		var	s, h = $$("head")[0];
		s = NewItem("script");
		s.type = "text/javascript"; // should be application/x-javascript see RFC4329
		s.textContent = c;
		h.appendChild(s);
	}
	/*
	function NewStyle(c) {
		var	s, h = $$("head")[0];
		s = NewItem("style");
		s.type = "text/css";
		s.textContent = c;
		h.appendChild(s);
	}
*/
	function NewItem(t, c) {
		var o = document.createElement(t);
		if (c) { o.innerHTML = c; }
		return o;
	}
	function DelItem(p, c)	{
		if (p) {
			if (!c) {
				c = p;
				p = c.parentNode;
			}
			p.removeChild(c);
		}
	}
	
	_.getFirstElementOfType = function(o, name) {
		o = $(o);
		if (o && GetName(o) != name) {
			o = GetParent(o, name);
		}
		return o;		
	}
	
	function GetForm(o)	{
		o = $(o);
		if (o && GetName(o) != "form") {
			o = GetParent(o, "form");
		}
		return o;
	}
	function GetLink(o)		{ return GetName(o) == "a" ? o : GetParent(o, "a") }
	function GetName(o)		{ return o.localName.toLowerCase() }
	function HasToken(o, t)	{ return o && Contains(t, o.toLowerCase().split(" ")); }

	_.getName = GetName;

	_.getLink = function(o) {
		return o.localName == "a" ? o : _.getParent(o, "a");
	}

	function HasClass(o, c)	{ return o && Contains(c, GetClass(o)); }
	function GetClass(o)	{ return o.className.split(" "); }
	function AddClass(o, c) {
		var h = HasClass(o, c);
		if (!h) { o.className += " " + c; }
		return h;
	}
	function DelClass(o) {
		var c = GetClass(o);
		var a = arguments;
		for (var i = 1; i < a.length; i++) {
			Remove(c, a[i]);
//			var p = c.indexOf(a[i]);
//			if (p != -1) c.splice(p, 1);
		}
		o.className = c.join(" ");
	}
	
	_.getParent = function(o, t) {
		return GetParent(o, t);
	}
	
	function GetParent(o, t) {
		while ((o = o.parentNode) && (o.nodeType != 1 || GetName(o) != t)){};
		return o;
	}
	function AnyOf(o, c) {
		while ((o = o.parentNode) && (o.nodeType != 1 || !HasClass(o, c))){};
		return o;
	}

	_.anyOf = function(o, c) {
		return AnyOf(o, c);
	}

	function Remove(a, e) {
		var p = a.indexOf(e);
		if (p != -1) { a.splice(p, 1); }
	}

	_.getText = function(o) {
		return GetText(o);
	}


	function GetText(o) {
		o = o.childNodes;
		for (var i = 0; i < o.length; i++) {
			if (o[i].nodeType == 3) {
				return o[i].nodeValue.replace(/^\s+|\s+$/g, "");
			}
		}
		return null;
	}

	function InitBlocks() {
		if (!_webapp)	{ _webapp	= $("WebApp"); }
		if (!_group)	{ _group	= $("iGroup"); }

		var i = $("iLoader");
		if (i && !HasClass(i, "__lod")) {
			$pc.loader(i, 1);
		}
	}

	function InitVars() {
		_header = [
			$("iHeader"),
			$("waBackButton"),
			$("waHomeButton"),
			$("waLeftButton"),
			$("waRightButton"),
			$("waHeadTitle")
		];

		_bdy = document.body;
		_bdo = (_bdy.dir == "rtl") ? -1 : +1;
		_wkt = IsDefined(_bdy.style.webkitTransform);		
	}

	function Display(o, s) { if (o = $(o)) { o.style.display = s ? "block" : "none"; } }

	_.layer = Layer;
	function Layer(o, s) {
		if (o = $(o)) {
			o.style[_bdo == 1 ? "left" : "right"] = s ? 0 : "";
			o.style.display = s ? "block" : "";
		}
	}

	// TODO: any way to do this with CSS??
	function AdjustLayer(o) {
		if (o = o || _.getActiveLayer()) {
			var z = $$("div", o); z = z[z.length -1];
			if (z && (HasClass(z, "iList") || HasClass(z, "iFull"))) {
				z.style.minHeight = parseInt(_webapp.style.minHeight) - XY(z).y + "px";
			}
		}
	}

	function Shadow(s, p) {
		var o = $("__wa_shadow");
		o.style.top = p + "px";
		// display:relative may slow down webkit effect, use it only when required
		_webapp.style.position = s ? "relative" : "";
		Display(o, s);
	}
/*	
	function Lock() {
		if (!_locker) {
			$pc.HideBar();
			_locker = function(e) {
				e.preventDefault();
				e.stopPropagation();
			};
			_bdy.addEventListener("touchstart", _locker, false);
		}
	}

	function Unlock() {
		if (_locker) {
			_bdy.removeEventListener("touchstart", _locker, false);
		}
		_locker = null;
	}

	function Lock() {
		if (!_lockCnt++)
			Display("__wa_noclick", 1);
	}
	function Unlock() {
		if (!--_lockCnt)
			Display("__wa_noclick", 0);
	}
*/


	// We need to remove scripts from the clone to prevent execution
	function PrepareClone(o) {
		// prevent execution of script tag
		var s = $$("script", o);
		while(s.length) {
			DelItem(s[0]);
		}
		return o;
	}
	
	_.Cleanup = function() {
		Cleanup();
	}

	function Cleanup() {
		var s, i, c;

// FIXME: may cancel some unwanted visual loaders
/*		while (s = _loader.pop()) {
			$pc.Loader(s[0], 0);
			clearInterval(s[1][1]);
			s[1][0].style.backgroundImage = "";
		}*/

// TODO: devrait etre gerer automatiquement par la source (fait pour iMore)
//		while (_loader.length) {
//			$pc.loader(_loader[0][0], 0);
//		}
		s = $$("li");
		for (i = 0; i < s.length; i++) {
			DelClass(s[i], "__sel", "__tap");
		}
	}
/*
	function ParseParams(s, np) {
		var ed = s.indexOf("#_");
		if (ed == -1) {
			return null;
		}
		var rs = "";
		var bs = SplitURL(s);
		if (!np) {
			for (var i = 0; i < bs[1].length; i++) {
				rs += "/" + bs[1][i].split("=").pop();
			}
		}
		return bs[2] + rs;
	}*/
/*
	function FadeWait(o, cb) {
		setTimeout(function() {
			if (_fading.indexOf(o) != -1)
				FadeWait(o, cb);
			else cb();
		}, 5);
	}

	function FadeItem(o, show, cb, sp, nx) {
		// if we're already fading the same oject, exits
		if (!nx) {
			if (!o) {
				if (cb) cb();
				return;

			} else if (_fading.indexOf(o) != -1)
				return;

			else
				_fading.push(o);
		}

		// set default step if not defined
		if (!sp) sp = 0.5;

		// process fading effect
		with (o.style) {
			if ((!show && opacity > 0) || (show && opacity < 1)) {
				if (show) display = "block";
				opacity = parseFloat(opacity) + (show ? +sp : -sp);
				setTimeout(FadeItem, 0, o, show, cb, sp, 1);
			} else {
				display = (opacity == 0) ? "none" : "block";
				_fading.splice(_fading.indexOf(o), 1);
				if (cb) cb();
			}
		}
	}
*/
	function IsMobile() {
		return (UA("iPhone") || UA("iPod") || UA("Aspen"));
	}

	function UA(s) {
		return Contains(s, navigator.userAgent);
	}

	function Resizer() {
		if (_._sliding) {
			return;
		}
		var m, h, o, w = (WIN().w >= _maxh) ? _maxh : _maxw;
		if (w != _width) {
			_width = w;
			_webapp.className = (w == _maxw) ? "portrait" : "landscape";
			_.CallListeners("orientationchange");
		}

		if ((o = _.getActiveLayer())) {
			h = XY(o).y + o.offsetHeight;
		}

		m = _width == _maxw ? 416 : 268;	// minimum height values for Safari iPhone
		w = WIN().h;
		h = h < w ? w : h;
		h = h < m ? m : h;

		_height = h;
		_webapp.style.minHeight = h + "px";
		AdjustLayer();

//		if (_touch) $pc.HideBar();
	}
/*
	function Locator() {
		if (_._sliding || _hold == location.href) {
			return;
		}
		_hold = 0;

		var act = GetActive();
		if (act) {
			act = act.id;
		} else if (location.hash.length > 0) {	// there is a simple anchor, jump to it
			return;
		} else {						// No? should slide back to home
			act = _history[0][0];
		}

		var cur = _history[_historyPos][0];
		if (act != cur) {
			var i, pos = -1;
			for (i in _history) {
				if (_history[i][0] == act) {
					pos = parseInt(i);
					break;
				}
			}
			if (pos != -1 && pos < _historyPos) {
// TODO: check this, seems it is useless and make URL based change to an invalid history position, should fix back madness
// Locator redefini _historyPos ? = erreur de position quand # (_historyPos = pos + 1)
//				_historyPos = pos + 1;
				InitSlide(cur, act, $d.L2R);
			} else {
				SlideTo(act);
			}
		}
	}
*/	
	_.getEvent = function() {
		return {
			context: _.explode(_.current(1)),
			windowWidth: _width,
			windowHeight: _height 
		}
		
	}
	
/*
	function CallListeners(evt, ctx, obj) {
		// Do not waste time and memory if no handler have been defined for the given event
		var l = _handler[evt].length;
		if (l == 0) {
			return true;
		}
		var e = {
			type: evt,
			target: obj || null,
			context: ctx || _.explode(_history[_historyPos][1]),
			windowWidth: _width,
			windowHeight: _height 
		}

		var k = true;
		for (var i = 0; i < l; i++) {
			k = k && (_handler[evt][i](e) == false ? false : true);
		}
		return k;
	}
*/
	// find location of the lib based on the <script>/Logic.js
/*	function FindLocation() {
		var f, n, s = $$("script");

		for (n = 0; n < s.length; n++) {
			if (f = s[n].src.match(/(.*\/)Action\/Logic.js$/)) {
				_file = f[1];
				break;
			}
		}
	}
*/
//	var _msy, _moy, _mty = 0, _ty = 0;
	

	function Init() {

/*
if (_touch) {
	// TODO: if mouseout of the screen, raise touchend

	_group.addEventListener("touchstart", function(e) {
		$(GetActive()).style.webkitTransitionProperty = "none";
		e.preventDefault();
	}, false);

	_group.addEventListener("touchend", function(e) {
		_moy = null;
		_ty += _mty;
		
		if (_ty > 0) {
			$(GetActive()).style.webkitTransition = "-webkit-transform 0.35s ease-out";
			$(GetActive()).style.webkitTransform = "translateY(0)";
			_ty = 0;
		}
			
		
	}, false);

	_group.addEventListener("touchmove", function(e) {
		_msy = e.touches[0].pageY;
		_moy = _moy || _msy;
		_mty = (_msy - _moy);

		if (_ty + _mty > 0)
			_mty = -_ty + (_mty + _ty) * 0.4;

		var xx = parseInt(_webapp.style.minHeight) - $(GetActive()).offsetHeight;

		if (_ty + _mty < xx)
			_mty = (-_ty + xx) + (_mty - (-_ty + xx)) * 0.3;

		$(GetActive()).style.webkitTransform = "translateY(" + (_ty + _mty) + "px)";

		e.preventDefault();
	}, false);
}
*/
		clearInterval(_tmp);

		InitBlocks();
		InitVars();
		InitForms();
		InitTab();
		InitHeader();
		InitObj("__wa_shadow");
//		InitObj("__wa_noclick");

		var i = $("iLoader");
		$pc.loader(i, 0);
		DelItem(i);

//		$pc.Opener(_opener);

		// get screen size
		_maxw = screen.width;
		_maxh = screen.height;
		if (_maxw > _maxh) { var l = _maxh; _maxh = _maxw; _maxw = l; }

		_.Hook.call("onInit");	// TODO: changer en initFramework
/*
		// Get the default layer
		_def = GetLayers()[0].id;
		_.historize(_def, 1);

		var a = (GetActive() || "").id;
		if (a != _def)	{ _.historize(a); }				// FIXME: should historize extra params too if any (?)
		if (!a)			{ a = _def; _.open("#"); }

//		ImagesInit(_group);	// inutile le markup est deja calculŽ
		Layer(a, 1);
*/

// TODO
		var a = (_.getActiveLayer() || "").id;	// Deja calculŽ dans Navigation...
 		AddLayerButtons($(a));

/*TODO
		with ($h) {
			var h = _header;
			Display(h[BACK], (!h[LEFT] && _historyPos));
			Display(h[HOME], (!h[RIGHT] && _historyPos > 1 && a != _def));
	
			if (h[BACK]) {
				_baseBack = h[BACK].innerHTML;
			}
			if (h[TITLE]) {
				_baseTitle = h[TITLE].innerHTML;
				SetTitle();
			}
		}
*/
		/*	start common jobs
		*/
//		setInterval(Locator, 250);
//		setInterval(Resizer, 500);
//		setTimeout(AdjustView, 500);

		/*	call load listener in blocking mode to allow loading of destination layer
		*/
		_.CallListeners("load");

		document.addEventListener("touchstart", new Function(), false);	// active state
//		(_fullscreen ? _group : document).addEventListener(_fullscreen ? "touchmove" : "scroll", ImagesListener, false);
//		(_touch ? _group : document).addEventListener(_touch ? "touchmove" : "scroll", ImagesListener, false);

		Resizer();
//		ImagesShow();	// CHECKME: inutile ?
		DocumentTracker("DOMSubtreeModified");
		DocumentTracker("resize");
		$pc.HideBar();
	}

/* Event */
	function ShowTab(ul, li, h, ev) {	// TODO: load async content here?
		if (!(	HasClass(li, "__dis") ||
				HasToken($$("a", li)[0].rel, "action"))) {

			var c, s, al = $$("li", ul);
			for (var i = 0; i < al.length; i++) {
				c = (al[i] == li);
				if (c) { s = i; }						// check which has been selected
	
				Display(ul.id + i, (!h && c));	// display/hide the panel if no override (h)
				DelClass(al[i], "__act");			// unselected any tabs
			}

			AddClass(li, "__act");
			if (ev) { _.CallListeners("tabchange", [s], ul); }
		}
	}

	function ClearTransform(o) {
		if (o) o.style.webkitTransform = "";
	}

	function ListenClick(e) {
		if (_._sliding) {
			return NoEvent(e);
		}

// ONCLICK

		/* Tab */
		var ul = GetParent(o, "ul");
		var pr = !ul ? null : ul.parentNode;
		var ax = a && IsAsync(a);

		if (a && ul && HasClass(pr, "iTab")) {
			var h, t;

			t = HasToken(a.rel, "action");	// allows classic link on tab
			h = $(ul.id + "-loader");
			Display(h, 0);

			if (!t && ax) {
				Display(h, 1);
				$pc.loader(h, 1);
				BasicAsync(a, function(o) {
					Display(h, 0);
					$pc.loader(h, 0);
					Display(ShowAsync(o)[0], 1);
					ShowTab(ul, li, 0, 1);
				});
			} else { h = t }				// activation only if loader doesn't exists or disabled (!ax)
			ShowTab(ul, li, !!h, !ax);		// !ax = event will be raised by async callback

			if (!t) { return NoEvent(e); }	// will be processed as classic link
		}


		/* Menu and list */
		if (ul && !HasClass(li, "iMore") &&
			((HasClass(ul, "iMenu") || HasClass(pr, "iMenu")) ||
			 (HasClass(ul, "iList") || HasClass(pr, "iList"))) ) {

			if (a && !HasClass(a, "iButton")) {
				var c = AddClass(li, HasClass(a, "iSide") ? "__tap" : "__sel");
				if (ax) {
					if (!c) { BasicAsync(a); }
					return NoEvent(e);
				}
			}
		}


		/* Top form button */
		if (a && _dialog) {
			if (HasToken(a.rel, "back")) {
				$pc.Form(_dialog, a);
				return NoEvent(e);
			}
			if (HasToken(a.rel, "action")) {
				var f = GetForm(_dialog);
				if (f) {
					f.onsubmit(e);
					return;
				}
			}
		}

		/* Media player */
		if (a && IsMedia(a)) {
			Unselect(li);
			/*if (!d)*/ $pc.Player(a.href, a);
			return NoEvent(e);
		}

		/* Basic async link */
		if (ax) {
			BasicAsync(a);
			NoEvent(e);

		} else if (a && !a.target) {
			/* Basic go layer */
			if (startsWith(a.href, "http:", "https:", "file:")) {	// file: for local testing
				Forward(a.href);
				NoEvent(e);
			}
			Unselect(li);
		}
	}

	function Unselect(li) {
		if (li) { setTimeout(DelClass, 1000, li, "__sel", "__tap"); }
	}

	function startsWith(s1) {
		var r, i, a = arguments;
		for (i = 1; i < a.length; i++) {
			if (s1.toLowerCase().indexOf(a[i]) == 0) {
				return 1;
			}
		}
	}

/* Animate */

	_.slideTo = function(to) {
		var h = _.current();
		if (h != to) {
			InitSlide(h, to);
		}
	}
	
	_.returnFrom = function(src, dst) {
		InitSlide(src, dst, $d.L2R);
	}

	function InitSlide(src, dst, dir) {
		if (_._sliding) {
			return;
		}
		_._sliding = 1;

//		Lock();

		AdjustView();
		if (dst == _.first()) {
			_initialNav = history.length;
		}
		dir = dir || $d.R2L;
		src = $(src);
		dst = $(dst);

		var h;	/*, p, txt;*/

		if (_wkt && _head /*&& !_noslide*/) {
//			p = XY(_head);
			h = PrepareClone(_head.cloneNode(true));
		}

		_prev = _.position();
		_.set(dir, dst.id);

// New title bar
		HideHeader();
		DelLayerButtons(src);
		AddLayerButtons(dst);
		ShowHeader();

		if (h) { _header[$h.HEAD].appendChild(h); }
		SetBackButton((dir != $d.R2L) ? "" : (_hold ? "" : NoTag(src.title)) || _baseBack);

/*	OLD
 	if (_header[BACK]) {
			if (dir == $d.R2L)
				txt = (_hold ? "" : NoTag(src.title)) || _baseBack;
			else if (_historyPos)
				txt = NoTag($(_history[_historyPos - 1][0]).title) || _baseBack;
			if (txt) _header[BACK].innerHTML = txt;
		}
*/		SetTitle(_hold ? dst.title : null);
		DoSlide(src, dst, dir);
	}

	function SetBackButton(txt) {
		if (_header[$h.BACK]) {
			if (!txt && _.position()) {
				txt = NoTag($(_.prev()).title) || _baseBack;
			}
			if (txt) { _header[$h.BACK].innerHTML = txt; }
		}
	}

	function SlideInfo(m) {
		var s = _.explode(_.history(_prev,1));
		var d = _.explode(_.current(1));
		var r = (m < 0 && !!_hold) ? ["wa__radio"] : d;
		return [s, d, m, r];
	}
	
	function tr_iphone(t) { return "translate3d(" + t + ",0,0)"; }
	function tr_others(t) { return "translateX(" + t + ")"; }

	function TranslateX(o, t, i) {
		if (o) {
			if (t) { t = _translator(t); }
			o.style.webkitTransitionProperty = (i) ? "none" : "";
			o.style.webkitTransform = t;
		}
	}	

	function GetTiming(o) {
		return o ? getComputedStyle(o, null).webkitTransitionDuration : "0s";
	}
	
	function GetHigherOf() {
		var r, t, i, j, a = arguments;		
		r = 0;
		for (i = 0; i < a.length; i++) {
			t = GetTiming(a[i]).split(',');
			for (j = 0; j < t.length; j++) {
				r = Math.max(r, parseFloat(t[j]) * 1000);
			}
		}
		return r;
	}

	function DoSlide(src, dst, dir) {
		_.CallListeners("beginslide", SlideInfo(dir));

		InitForms(dst);
		_.Hook.call("viewBeginChange", 0, src, dst, dir);
		Layer(src, 1);
		Layer(dst, 1);

		// default effect if not webkit
		if (!_wkt /*|| _noslide*/) {
//			_noslide = 0;
			EndSlide(src, dst, dir);
			return;
		}

		var b = _group;
		var w = _webapp;
		var g = dir * _bdo;

		// set the height of iGroup to match the real height of the effect
//		var h1 = src.offsetHeight;
//		var h2 = dst.offsetHeight;
//		b.style.height = (h1 > h2 ? h1 : h2) + "px";
		b.style.height = (_height - b.offsetTop) + "px";

		// layer anim
		AddClass(w, "__ani");
		TranslateX(src, "0", 1);
		TranslateX(dst, (g * -100) + "%", 1);

		// header anim
		var h, hcs, hos, tim = GetHigherOf(src, dst, _head, _header[$h.TITLE]);
		if (_head) {
			h = _header[$h.HEAD].lastChild;
			hcs = h.style;
			hos = _head.style;

			hcs.opacity = 1;
			hos.opacity = 0;
			TranslateX(h, "0", 1);
			TranslateX(_head, (g * -20) + "%", 1);
			TranslateX(_header[$h.TITLE], (g == $d.R2L ? 60 : -20) + "%", 1);
		}

		setTimeout(function() {
			AdjustLayer(dst);

			TranslateX(dst, "0");
			TranslateX(src, (g * 100) + "%");

			if (h) {
				hcs.opacity = 0;
				hos.opacity = 1;
				TranslateX(h, (g * 30) + "%");
				TranslateX(_head, "0");
				TranslateX(_header[$h.TITLE], "0");
			}

			setTimeout(function() {
				if (h) { DelItem(_header[$h.HEAD], h); }
				DelClass(w, "__ani");
				b.style.height = "";
//				src.style.height="";
//				dst.style.height="";

				EndSlide(src, dst, dir);
			}, tim);
		}, 0);
	}

	function EndSlide(src, dst, dir) {
//		Unlock();
		Cleanup();
		Layer(src, 0);

		/*	Workaround for a bug with translate3d(...) and GoogleMaps.
			If a map parent node has translate3d transformation, the GoogleMaps drag animation will not work well.
			Works fine with translate/translateX but cannot use them because of a Safari bug which make the animation not smooth.
		*/
		if (_wkt) {
			ClearTransform(dst);
			ClearTransform(src);
			ClearTransform(_head);
			ClearTransform(_header[$h.TITLE]);
		}

		_.CallListeners("endslide", SlideInfo(dir));

		_._sliding = 0;
		_prev = -1;

		Resizer();
//TODO		setTimeout(AdjustView, 0, dir == $d.L2R ? _.next(2) : null);
//		setTimeout(ImagesShow, 0);
	}

	function SetTitle(title) {
		var o;
		if (o = _header[$h.TITLE]) {
			o.innerHTML = title || GetTitle(_.getActiveLayer()) || _baseTitle;
		}
	}

	function HideHeader() {
		if (_dialog) { $pc.Form(_dialog); }
		Display(_headView, 0);
	}

	function ShowHeader() {
		Buttons(1);
	}


	function AdjustView(to) {
		var h = to ? to : Math.min(50, WIN().y);
		var s = to ? Math.max(1, to - 50) : 1;
		var d = to ? -1 : +1;

		while (s <= h) {
//			if (_scrolling) console.log("ok");
			var z = CalcEaseOut(s, h, d, 6, 2);
			s = z[0]; _win.scrollTo(0, z[1]);
		}
		if (!to) { $pc.HideBar(); }
	}
	
	_.explode = function(loc) {
		// WARNING: with classic anchors the returned value of this function will be wrong
		if (loc) {
			var p = loc.indexOf("#_");			
			if (p != -1) {
				loc = loc.substring(p + 2).split("/");
				var id = "wa" + loc[0];
				for (var i in loc) {
					loc[i] = decodeURIComponent(loc[i]);
				}
				loc[0] = id;
				if (_o_acl && !$(id)) {
					_.createLayer(id);
				}
				return $(id) ? loc : [];
			}
		}
		return [];
	}

	_.getLayers = GetLayers;

	function GetLayers() {
//		return document.getElementsByClassName("iLayer");	// TODO
		var lay = [];
//		var src = $$("div", _group)[0].childNodes;
		var src = _group.childNodes;
		for (var i in src) {
			if (src[i].nodeType == 1 && HasClass(src[i], "iLayer")) {
				lay.push(src[i]);
			}
		}
		return lay;
	}
	
	_.createLayer = function(i) {
		var n = NewItem("div");
		n.id = i;
		n.className = "iLayer";
		_group.appendChild(n);
		return n;
	}

	function GetTitle(o) {
		return (!_.position() && _baseTitle) ? _baseTitle : o.title;
	}

/*
	_.getActiveLayer = function() {
		return GetActive();
	}

	function GetActive() {
// FIXME: should always return the active layer even if the hash is incorrect or use a classic anchor?
		var h = location.hash;
		return $(!h ? _def : _.explode(h)[0]);
	}
*/

/*
	function BasicAsync(item, cb, q) {
		var h, o, u, i;

		i = (typeof item == "object");
		u = (i ? item.href : item);
		o = GetParent(item, "li");	// get loader

		if (!cb) { cb = DefaultCallback(u, HasToken(item.rev, "async:np")); }
		$pc.Request(u, q, cb, true, o, (i ? item : null));
	}
	
	_.getAsyncContent = function(item, cb, q) {
		BasicAsync(item, cb, q);
	}*/


// TODO: optimize this!!!!
/*	function DefaultCallback(i, np) {
//		var c = 
		return function(o) {
			var u = i ? ParseParams(i, np) : null;
			var g = ShowAsync(o);

			if (g && (g[1] || u)) {
				Forward(g[1] || u);
			} else {
				Cleanup(); //setTimeout(Cleanup, 250);
			}
			return null;
		};

//		c.toString = function() { return "[WebApp.Net AJAX Callback]" };
//		return c;
	}
*/
	function ReadTextNodes(o) {
		var nds = o.childNodes;
		var txt = "";
		for (var y = 0; y < nds.length; y++) {
			txt += nds[y].nodeValue;
		}
		return txt;
	}

	_.Forward = function(l) {
		Forward(l);
	}
	
	function Forward(l) {
		_lastScroll = WIN().y;
		AdjustView();
		_.open(l);
	}
	
	function Go(g) {
		return "#_" + g.substr(2);
	}
	
/*
	function ResetScroll(i) {
		if (i.substr(0, 2) == "wa") {
			var p = _historyPos;

			if (p && i == _history[0][0]) {
				_history[1][2] = 0;
			}
			while (p && _history[--p][0] != i){};
			if (p) { _history[p + 1][2] = 0; }
		}
	}
*/
	_.ShowAsync = function (o) {
		return ShowAsync(o);
	}

	function ShowAsync(o) {
		if (o.responseXML) {
			o = o.responseXML.documentElement;

			var s, t, k, a = _.getActiveLayer();

			/* force jump to a given layer */
			var g = $$("go", o);
			g = (g.length != 1) ? null : $A(g[0], "to");

			/* get all parts to update */
			var f, p = $$("part", o);
			if (p.length == 0) { p = [o]; }

			for (var z = 0; z < p.length; z++) {
				var dst = $$("destination", p[z])[0];
				if (!dst) { break; }

				var mod = $A(dst, "mode");
				var txt = ReadTextNodes($$("data", p[z])[0]);

				var i = $A(dst, "zone");
				if (($A(dst, "create") == "true" || _o_acl) &&
					i.substr(0, 2) == "wa" && !$(i)) {
					
					_.createLayer(i);
				}

				f = f || i;
				g = g || $A(dst, "go");		// For compatibility with older version
				i = $(i || dst.firstChild.nodeValue);	// For compatibility with older version

//				if (!CallListeners("contentchange", [mod, txt], i))
//					continue;

				/* if we target the active layer, remove buttons */
				if (!k && a && a.id == i.id) {
					HideHeader();			// TODO: Ajouter un hook avec passage de K?
					DelLayerButtons(i);
					k = i;					// enregistre le fait que le layer actif est modifiŽ
				}
				
				/* Rset scroll if we modify a previous layer */
				_.resetScroll(i.id);

				/* update content */
				SetContent(i, txt, mod);
			}

			/* Custom title for the given layer */
			t = $$("title", o);	// TODO: hook custom XML content ?
			for (var n = 0; n < t.length; n++) {
				var s = $($A(t[n], "set"));
				s.title = ReadTextNodes(t[n]);
				if (a == s) { SetTitle(); }
			}

			/* active layer is targeted? show new header */
			if (k) {
				AddLayerButtons(k); // TODO: Ajouter un hook avec passage de K?
				ShowHeader();
			}

			/* script to execute */
			var e = $$("script", o)[0];
			if (e) { NewScript(ReadTextNodes(e)); }

			/* initialize stuff if required */
			InitForms(a);
			SetBackButton();

			if (g == a) { g = null; }	// let ImagesShow work properly
//			if (!g) { ImagesShow(); }

			return [f, g ? Go(g) : null];
		}

		throw "Invalid asynchronous response received.";
	}

	function SetContent(o, c, m) {
//		c = _.contentPreProcessing(c);
		c = _.Hook.call("contentPreProcessing", c);

		// Store content in a temp <DIV> to prepare script execution
		c = NewItem("div", c);
		// Clone the <DIV> so that Safari properly recognize <SCRIPT> tags
		c = c.cloneNode(true);
		// replace images with blank content to speed up loading!
//		_.contentPostProcessing(c);
		_.Hook.call("contentPostProcessing", c);

		// Append content to webapp
		if (m == "replace" || m == "append") {
			if (m != "append") {
				o.innerHTML = "";
//				while (o.hasChildNodes()) {	// TODO: o.innerHTML = ""; ??
//					DelItem(o, o.firstChild);
//				}
			}
			while (c.hasChildNodes()) {
				o.appendChild(c.firstChild);
			}
		} else {
			var p = o.parentNode,
				w = (m == "before") ? o : o.nextSibling;

			if (m == "self") {
				DelItem(p, o);
			}
			while (c.hasChildNodes()) {
				p.insertBefore(c.firstChild, w);
			}
		}
	}
/*
	function __callback(o, cb, lr) {
		if (o.readyState != 4) {
			return;
		}
		var er, ld, ob;

		if (ob = _ajax.filter(function(a) { return o == a[0] })[0]) {
			CallListeners("endasync", ob.pop(), ob[0]);
			Remove(_ajax, ob);
//			_ajax.splice(_ajax.indexOf(ob), 1);
		}

		er = (o.status != 200 && o.status != 0); // 0 for file based requests
		if (!er && !o.responseXML) {
			o.responseJSON = JSON(o.responseText);
		}

		try { if (cb) { ld = cb(o, lr, DefaultCallback()); } } 
		catch (ex) { er = ex; console.error(er); }

		if (lr) {
			$pc.loader(lr, 0);
			if (er) { DelClass(lr, "__sel", "__tap"); }
		}
	}
*/
/* Render */
	function InitHeader() {
		var hd = _header[$h.HEAD];
		if (hd) {
			var dv = NewItem("div");
			dv.style.opacity = 1;
			while (hd.hasChildNodes()) {
				dv.appendChild(hd.firstChild);
			}
			hd.appendChild(dv);
			_head = dv;

			Display(dv, 1);
			Display(_header[$h.TITLE], 1);
		}
	}

	function InitTab() {
		var o = $$("ul");
		for(var i = 0; i < o.length; i++) {
			var p = o[i].parentNode;
			if (p && HasClass(p, "iTab")) {
				Display(o[i].id + "-loader", 0);
				ShowTab(o[i], $$("li", o[i])[0]);
			}
		}
	}

	function InitObj(i) {
		var o = NewItem("div");
		o.id = i;
		_webapp.appendChild(o);
		return o;
	}

	_.isViewable = function(o) {
		var x11, x12, y11, y12;
		var x21, x22, y21, y22;

		var p = _.objInfo(o);

		x11 = p.x;
		y11 = p.y;
		x12 = x11 + o.offsetWidth - 1;
		y12 = y11 + o.offsetHeight - 1;

		p = _.winInfo();
		x21 = p.x;
		y21 = p.y;
		x22 = x21 + p.w - 1;
		y22 = y21 + p.h - 1;

		return !(x11 > x22 || x12 < x21 || y11 > y22 || y12 < y21);
	}

/* Form custom elements */
	function InitForms(l) {
		l = $(l) || _.getActiveLayer();
//		InitCheck(l);
//		InitRadio(l);
	}


	function JSON(s) {
		if (/^[\s\t\n\r{}\[\]:,eE\-+falr-un.0-9]*$/.test(s.replace(/\\./g, '').replace(/"[^"\\\n\r]*"/g, '')))
		{ try { return eval('(' + s + ')'); } catch(e) {} }
		return null;
	}

/* PreLoad */
//	FindLocation();
//	if (_v2 && IsDefined(_win.orientation)) {
//		_win.addEventListener("orientationchange", Resizer, false);
//		setTimeout(Resizer, 500);
//	}else {
//		setInterval(Resizer, 500);
//	}
/*
	function obsolete(m, a) {
		console.log("Method [" + m + "] is obsolete.");
		this[m].apply(this, a);
	}
*/
	function DocumentTracker(s) {
		addEventListener(s, Resizer, false);		
	}

	addEventListener("load", Init, true);
//	addEventListener("click", ListenClick, true);

/* Static */
	return $pc;
};

var WA = WebApp;

//alert(isAsync);