/*global window, document */
/*global WebApp */

/* Isolate to prevent conflicts */
(function() {
	var _, W = WebApp,
		_def,
		_hold = 0,
		_lastScroll,
		_history = [],
		_historyPos	= -1,
		_initialNav	= history.length;


	function locator() {
		if (_._sliding || _hold == location.href) {	// TODO: sliding
			return;
		}
		_hold = 0;

		var act = _.getActiveLayer();
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
					pos = parseInt(i, 10);
					break;
				}
			}
			if (pos != -1 && pos < _historyPos) {
// TODO: check this, seems it is useless and make URL based change to an invalid history position, should fix back madness
// Locator redefini _historyPos ? = erreur de position quand # (_historyPos = pos + 1)
//				_historyPos = pos + 1;
				_.returnFrom(cur, act);
			} else {
				_.slideTo(act);
			}
		}
	}
	
	function extenderBack() {
		if (_hold) {
			return (_hold = 0);
		}
		if (history.length - _initialNav == _historyPos) {
			history.back();
		} else {
			_.open(_history[_historyPos - 1][1]);
		}
		return false;
	}
	
	function extenderHome() {
		if (history.length - _initialNav == _historyPos) {
			history.go(-_historyPos);
		} else {
			_.open("#");
		}
		return (_hold = 0);
	}
	
	// Externder Go()
	// Externder Forward()

	W.extend("back", extenderBack);
	W.extend("home", extenderHome);
	W.extend("Back", extenderBack, true);
	W.extend("Home", extenderHome, true);
	W.append(function(core) {
		_ = core;
		
		// Sync with browsing history
		_.isSync = function() {
			return (history.length - _initialNav == _historyPos);
		}
		
		_.Hook.add("eventPreOnClick", function(p, e) {
			if (p !== true) {
				var o  = e.target,		// currentTarget ???
					a  = _.getLink(o);

				/* Common button */
				if (a && ["waBackButton", "waHomeButton"].indexOf(a.id) != -1) {
					if (a.id == "waBackButton")	{ extenderBack(); }
					else						{ extenderHome(); }
					return true;
				}
			}
			return p;
		});
	});

	_.hold = function(url) {
		_hold = url;
	}

	_.position = function() { return _historyPos; }

	_.getActiveLayer = function() {
// FIXME: should always return the active layer even if the hash is incorrect or use a classic anchor?
		var h = location.hash;
		return _.$(!h ? _def : _.explode(h)[0]);
	}

	_.resetScroll = function(i) {
		if (i.substr(0, 2) == "wa") {
			var p = _historyPos;

			if (p && i == _history[0][0]) {
				_history[1][2] = 0;
			}
			while (p && _history[--p][0] != i){};
			if (p) { _history[p + 1][2] = 0; }
		}
	}
	
	_.current = function(x) {
		return _history[_historyPos][x || 0];
	}

	_.first = function(x) {
		return _history[0][x || 0];
	}

	_.prev = function(x) {
		return _history[_historyPos - 1][x || 0];
	}

	_.next = function(x) {
		return _history[_historyPos + 1][x || 0];
	}
	
	_.history = function(x, y) {
		return _history[x][y];
	}
	
	_.set = function(dir, id) {
		if (dir == -1) {
			_.historize(id);
		} else {
			while (_historyPos && _history[--_historyPos][0] != id){};
		}
	}


	_.historize = function(o, l) {	// l = isDefault
		if (o) {
			//TODO: fix endless toggle when using same layer in different level of navigation
			
			// TODO: push an array with [o, l ? location.hash : null, _lastScroll]
			// then use _history[x][0]...[x][2]
			_history.splice(++_historyPos, _history.length);
			_history.push([o, !l ? location.hash : ("#_" + _def.substr(2)), _lastScroll]);
/*			_history.splice(++_historyPos, _history.length);
			_history.push(o);

			_location.splice(_historyPos, _location.length);
			_location.push(l ? location.hash : null);

			_scrPos.splice(_historyPos, _scrPos.length);
			_scrPos.push(_lastScroll);*/
		}		
	}

	/* Initialization */
	_.Hook.add("onInit", function() {
		// Get the default layer
		_def = _.getLayers()[0].id;
		_.historize(_def, 1);

		var a = (_.getActiveLayer() || "").id;
		if (a != _def)	{ _.historize(a); }				// FIXME: should historize extra params too if any (?)
		if (!a)			{ a = _def; _.open("#"); }
		
		_.layer(a, 1);

		window.setInterval(locator, 250);
	});
})();
