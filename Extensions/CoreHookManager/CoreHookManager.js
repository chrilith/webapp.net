/*global window, document */
/*global WebApp */

// DONE //

/*	CoreHookManager
 	---------------
 	Add hook functionality to WebApp.Net Core
 	
	Level: MANDATORY
	Usage: this.Hook.[func](...)
	
	Hooks:
		- contentPreProcessing
		- contentPostProcessing
		- eventPreOnClick
		- eventPostOnClick
*/

/* Isolate to prevent conflicts */
(function() {
	var _hooks = {};
		
	function get(name) {
		return (_hooks[name] || []);
	}
	
	WebApp.append(function(core) {
		core.Hook = {
			/* The last return value is always passed as first parameter */
			call: function(name) {
				var a = [],
					h = get(name);
				a.push.apply(a, arguments);
				a.splice(0, 1);
				for (var i = 0; i < h.length; i++) {
					a[0] = h[i].apply(core, a);
				}
				return a[0];			
			},

			add: function(name, func) {
				var h = get(name);
				h.push(func);
				_hooks[name] = h;
			},
	
			remove: function(name, func) {
				var h = get(name),
					i = h.lastIndexOf(func);
				if (i != -1) {
					h.splice(i, 1);
				}
			},
	
			contains: function(name, func) {
				return (get(name).lastIndexOf(func) != -1);
			},

			toString: function() {
				return "[Hook Manager]";
			}
		};
	});
})();
