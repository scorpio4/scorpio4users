(function($, my){
	my.RoutePlanner = function(options, events) {
		if (!options) throw "urn:factcore:ux:oops:no-options";

		this.destination = options.destination || options.to || events;
		if (!this.destination) throw "urn:factcore:ux:oops:no-destination";
		this.DEBUG = options.DEBUG || false;
		this.source = options.source || options.from || this.destination;

		var self = this;
		this.base = options["this"] || ( this.source.getIdentity && this.source.getIdentity() ) || this.source["this"] || this.source.options["this"] ;
		if (!this.base) {
			console.error("Missing Base URI: %o %o", this.source, options)
			throw "urn:factcore:ux:oops:no-base-uri";
		}

		this.localize = function(uri) {
			var local = uri;
			if (uri && this.base && uri.indexOf(this.base)==0) local = uri.substring(this.base.length).replace(/\W+/g,"");
			this.DEBUG && console.debug("Localize: %s @ %s -> %s", uri, this.base, local)
			return local;
		}

		this.plan = function(route, meta) {
			if (!route.from) throw "urn:factcore:ux:oops:missing-from";
			if (!route.to) throw "urn:factcore:ux:oops:missing-to";
			var self = this;

			var compile_fn = function(route) {
				if (route.then) {
					var fn = null;
					if (_.isFunction(route.then)) {
						fn = route.then;
					} else if (_.isString(route.then)) {
						try {
//							console.log("fn: %o %o", route, route.then)
							// 'compile' custom script into a Function
							fn = new Function("that", route.then);
						} catch(e) {
							// generate an error function
							fn = function(that) { console.error("Broken Function: %o %o", that, e); alert("Broken Function: "+e); }
						}
					}
					// register specific-event custom function "fn"
					self.destination.on(route.to, fn);
					this.DEBUG && console.debug("Attached IQ: %o", route.to);
					return fn;
				}
				return null;
			}

			// ignore circular routes
			if (route.from == route.to) {
				compile_fn(route);
				return self;
			}


			// internal function to create new routes
			var plan_route = function(route, meta) {
				var from = route.from;
				var to = route.to;
				compile_fn(route);
				this.DEBUG && console.debug("Routing: %s -> %s [ %o -> %o ]", from, to, self, route);
				self.destination.on( from, function(model) {
					self.DEBUG && console.debug("Re-routing: %o [ %s -> %s ] %o", self, from, to, model);
					self.destination.trigger(to, model);
				}, meta);
				return self;
			}
			// resolve our destination
			if (typeof(route.to) == "string") {
				// map local events to global event aggregator
				var from = self.localize(route.from);
				if ( from != route.from ) {
					self.DEBUG && console.log("Globalizing: %o %o -> %o %o", from, self.source, route.from, self.destination);
					self.source.on(from, function(that) {
						self.DEBUG && console.log("Globalized: %o %o %o", from, route, that);
						self.destination.trigger(route.from, that);
					})
				}
				plan_route( route, meta);
				return self;
			}

			if (typeof(route.to) == "object") {
				// complex route
				if (!route.to.to) throw "urn:factcore:ux:oops:missing-next-to";
//				route.to.from = route.to.from || route.from;
				self.plan( { from: route.from, to: route.to.to, then: route.to.then }, meta );
//				self.plan(route.to);
			} else if (typeof(route.to) == "function") {
				// dynamic (model-based) route
				var reroute  = route.to;
				var from = route.from;
				self.DEBUG && console.debug("Dynamic Routing: [ %s -> %s ] -> %o", from, to, model);
				self.destination.on(from, function(model) {
					var to  = reroute.apply(meta, [model]);
					if (to) {
						self.DEBUG && console.debug("Re-routed: %s -> %s -> %o", from, to, model);
						self.destination.trigger( to, model );
					} else {
						console.warn("Un-planned route: %o %o", meta, model);
					}
				}, meta);
			} else {
				throw "urn:factcore:ux:oops:unknown-destination: "+route.to;
			}
		}
		return self;
	}
})(jQuery, window);
