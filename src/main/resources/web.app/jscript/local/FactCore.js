(function($, my) {

	/* *****************************************************************************************************************
		Prototype Inheritance
	**************************************************************************************************************** */

	jQuery.curCSS = jQuery.css; // back-port jQuery 1.8+

//	Array.prototype.add = function(x) { this.push(x) }
//	Object.prototype.get = function(n) { return this[n] }
//	Object.prototype.set = function(n,v) { this[n] = v }

	/* *****************************************************************************************************************
		Perspective
	**************************************************************************************************************** */

	my.factcore = {
		DEBUG: true,
		idAttribute: "this", labelAttribute: "label",
		I: {
			"this": "urn:factcore:user:anonymous", "label": "Anonymous", can: {}
		}, UX: {
			DEBUG: true,
			i18n: new I18N( { "urn:factcore:ux:welcome": "Welcome", "urn:factcore:ux:initializing": "Initializing", "urn:factcore:ux:loading": "Loading" } ),
			types: {}, mixin: {},
			View: {}
		}, IQ: {
			DEBUG: true,
			"urn:factcore:ux:query:Application"	: function(that) { return that.where("?this a iq:Application").where("?this rdfs:label ?label") },
			"urn:factcore:ux:query:Workspaces"	: function(that) { return that.where("?this a ux:Workspace").where("?this rdfs:label ?label") },
			"urn:factcore:ux:query:Views"		: function(that) { return that.where("?this a ux:View").where("?this rdfs:label ?label") },
			"urn:factcore:ux:query:Templates"	: function(that) { return that.where("?this ux:template ?t").where("?t ux:body ?template") },
			"urn:factcore:ux:query:Behaviours"	: function(that) { return that.where("?this ux:script ?then") },
			"urn:factcore:ux:query:GlobalRoutes": function(that) { return that.where("?this a ux:Plan").where("?this ux:from ?from").where("?this ux:to ?to") },
			"urn:factcore:ux:query:LocalRoutes"	: function(that) { return that.where("?this ?from ?to").where("?from rdfs:subPropertyOf ux:onEvent") },
			"urn:factcore:ux:query:Attributes"	: function(that) { return that.where("?this rdfs:domain ?type").where("?this rdfs:range ?range") },
			"urn:factcore:ux:query:has:Views"	: function(that, from) { return that.where( "<"+from+"> ux:views ?this" ).where("?this rdfs:label ?label").optional("?this ux:id ?id").optional("?this fact:model ?model") },
			"urn:factcore:ux:query:has:Types"	: function(that, type) { if (!type) return that; else return that.filter("type", new RegExp(type) ) },
			"urn:factcore:ux:query:has:Options"	: function(that, from) { return that.where( "<"+from+"> ux:option ?this" ).where("?this ux:name ?name").where("?this ux:value ?value") },
			"urn:factcore:fact:query:Finders"	: function(that, from) { return that.where( "<"+from+"> fact:core ?this" ).where("?this fact:id ?id").where("?this rdfs:label ?label") },
		}, NS: {
			"owl": 	"http://www.w3.org/2002/07/owl#",
			"rdf": 	"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
			"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
			"xsd":	"http://www.w3.org/2001/XMLSchema#",
			"ux":   "urn:factcore:ux:",
			"iq":   "urn:factcore:iq:",
			"fact": "urn:factcore:fact:",
			"asq":  "urn:factcore:asq:",
		}, fact: {
			DEBUG: true,
		},
		ASQ: { }
	}

	/* *****************************************************************************************************************
		Bootable IQ:ware
	**************************************************************************************************************** */

	my.factcore = _.extend( my.factcore, {

		boot: function(options) {
			var self = this;
			if (!options || !options["this"]) throw "urn:factcore:oops:missing-options";

			// inherit application identity
			this["this"] = options["this"];

			// activate the event-driven architecture
			_.extend( my.factcore.UX , Backbone.Events );
			_.extend( my.factcore.IQ , Backbone.Events );
			_.extend( my.factcore.fact , Backbone.Events );

			// initialize fact.factory
			var FactModel = my.factcore.fact.factory.FactModel = Backbone.Model.extend( { idAttribute: "this" } );
			my.factcore.fact.factory.FactModels = Backbone.Collection.extend( { model: FactModel } );

			// start paying attention - aka: application state
			this.attention = new my.factcore.fact.factory.FactModel( options );

			// default to Moustache renderer
			Backbone.Marionette.Renderer.render = function(template, data) { return Mustache.to_html(template, data); }

			// attach an event router
			this.planner = new RoutePlanner(options, this);

			// obtain state from Browser's URL
			self.state = {}
/*
			var params = recline.View.parseQueryString(decodeURIComponent(my.location.search));
			if (params) {
				_.each(params, function(value, key) {
					try {
						value = JSON.parse(value);
						self.state[key] = value;
					} catch(e) {}
				});
			}
*/
			// create a new instance-of Marionette.Application
			var newApp = new Marionette.Application();
			my.factcore.DEBUG && console.debug("IQ Perspective: %o -> %o", newApp, this);

			// Boot the Application
			newApp.on("initialize:after", function(that) {

				// Local Routing
				var locals = new my.factcore.IQ["urn:factcore:ux:query:LocalRoutes"]( self.core() );
				my.factcore.DEBUG && console.debug("Application Local Event Routing: %o", locals);
				locals.each( function() {
					var reroute = this["from"].value.toString();
					var from = self.planner.localize( this["from"].value.toString() );
					var to = this["to"].value.toString();
					if (from != "onEvent") {
						var route = { from: from , to: { from: reroute, to: to} }; // indirect (re)routing
						self.planner.plan( route );
					}
				});

				// Global Routing
				var globals = new my.factcore.IQ["urn:factcore:ux:query:GlobalRoutes"]( self.core() );
				my.factcore.DEBUG && console.debug("Application Global Event Routing: %o", globals);
				globals.each( function() {
					var from = this["from"].value.toString();
					var to = this["to"].value.toString();
					var route = { from: self.planner.localize( from ) , to:  to  };
					self.planner.plan( route );
				});

				// Custom Behaviours
				var behaviours = new my.factcore.IQ["urn:factcore:ux:query:Behaviours"]( self.core() );
				my.factcore.DEBUG && console.debug("Compile Custom Behaviour IQ: %o", behaviours);
				behaviours.each( function() {
					var that = this["this"].value.toString();
					var then = this["then"].value.toString();
					var script  = this["then"];
					var isECMA = script.datatype.toString() == "http://www.iana.org/assignments/media-types/application/ecmascript";
					if (isECMA) {
						var route = { from: that, to: that, then: then };
						self.planner.plan( route );
						my.factcore.IQ[that] = function(data) {
							newApp.trigger(that, data);
						}
					} else throw "urn:factcore:ux:oops:unknown-script#"+script.datatype.toString();
				} )

				// Cache View Templates: - Marionette.TemplateCache
				var templates = new my.factcore.IQ["urn:factcore:ux:query:Templates"]( self.core() );
				my.factcore.DEBUG && console.debug("Compile UX Templates: %o", templates);
				templates.each( function() {
					var that = this["this"].value.toString();
					var template = this["template"].value.toString();
					Marionette.TemplateCache(that, template);
				} )

				if (options.core && options.core.finder) {
					// Locate Finders:
					var finders = new my.factcore.fact["urn:factcore:fact:query:Finders"]( self.core(), options['this'] );
					my.factcore.DEBUG && console.debug("Available Finders: ", finders);
				}

				// TODO: Configure BackBone Router?

				// Activate Browser history
				if (Backbone.history) {
					Backbone.history.start()
					my.factcore.DEBUG && console.debug("History: %o", Backbone.history);
				}
				// execute a fact Model query by triggering IQ events
my.factcore.DEBUG && console.debug("IQ Initialized: %o", this);
				self.isBooted = true;
				this.triggerMethod("booted", that);
			})

			// initializer to load user and core
			newApp.addInitializer(function() {
my.factcore.DEBUG && console.debug("Initializing: ", options);
				self._loadSelf(options);
my.factcore.DEBUG && console.debug("Initializing Core: ", self);
				self._loadCore(options);
			})

			_.extend( this, newApp);
			my.factcore.DEBUG && console.debug("Booting:", this, this["this"], newApp);
			return this;
		},

		self: function() {
			return { knows: this.attention, core: core() }
		},

		core: function() {
			var dbank = my.factcore.fact.Finder(this["this"]);
			var $core = $.rdf({databank: dbank});
			my.factcore.DEBUG && console.debug("Fact Core:", this, $core, dbank);
			return $core;
		},

		getUser: function() {
console.err("getUser: ", my.factcore);
			return my.factcore.identity.am;
		},

		isGuest: function() {
console.err("isGuest: ", my.factcore);
			return !("login" in my.factcore.I.can) || this.getUser()==null;
		},

		// Load user from server
		_loadSelf: function(options) {
			var self = this;
			var application = options["this"];
			if (!application) throw "urn:factcore:fact:oops:unknown-application";

            var queryParams = { "application": application };
my.factcore.DEBUG && console.debug( "Loading user: ", queryParams );

			var promise = $.ajax( { url: "/rest/self" , data: queryParams, datatype: "json", async: false }).done( function(reply) {
				if (!reply.I || !reply.I.am || !reply.I.can || !reply.I.can.login )  throw "urn:factcore:login:failed";
				self.identity = new my.factcore.fact.factory.FactModel(reply.I);
				self.application = reply.application;
				my.factcore.DEBUG && console.debug( "Loaded user: ", reply, self.identity );
				if (reply['this']!=application) throw "urn:factcore:fact:oops:mismatched-application";
			});
			return promise;
		},

		// Load Core (UX, fact, IQ meta) for this factcore.
		// quite opinonated
		_loadCore: function(options) {
			if (!options) throw "urn:factcore:ux:oops:missing-options";
			var app = options["this"];
			if (!app) throw "urn:factcore:ux:oops:missing-application";
			var core_app = this.application[app];
			if (!core_app) throw "urn:factcore:ux:oops:unknown-application";
			var core_finder = core_app.core;

			var finder_options = _.extend({ "this": "urn:factcore:rq:ux", "application": app, "from": core_finder, reload: false, async: false  }, options.core );
my.factcore.DEBUG && console.debug("Loading %s UX:Core: %o %o", core_finder, options, finder_options);

			var $finder = jQuery.rdf.databank([], {namespaces: { "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdfs":"http://www.w3.org/2000/01/rdf-schema#"}, base: app+"#" } )
			my.factcore.fact.from[app] = $finder;
			return my.factcore.fact._loadfacts( $finder , finder_options );
		},


	});

	/* *****************************************************************************************************************
		fact
	**************************************************************************************************************** */

	_.extend(my.factcore.fact, {
		finder: {
		}, asq: {}, from: {}, space: { models: {} }, factory: {}, datatype: {},

		uuid: function() {
			function _id() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); };
			return (_id()+"-"+_id()+"-"+_id()+"-"+_id()+"-"+_id()+"-"+_id()+"-"+_id()+"-"+_id());
		},

		urn: function(prefix) {
			return (prefix || my.factcore["this"])+"#"+this.uuid();
		},

		localName: function(globalName) {
//			if(!globalName) return throw "urn:factcore:fact:missing-localname";
			if(!globalName) return null;
			var ix = globalName.lastIndexOf("#");
			if (ix<0) ix = globalName.lastIndexOf("/");
			if (ix<0) ix = globalName.lastIndexOf(":");
			return ix>=0?globalName.substring(ix+1):globalName;
		},

		// ensure fact Model is Event-driven and aware of it's environment (Controller)
		aware: function(options, source) {
			// TODO: wire-up Backbone.Model events
		},

		// refocus : pick 1st model. transpose 'this' into 'that'. optional callback
		refocus: function(models, onRefocus) {
			if (!models) throw "urn:factcore:fact:oops:missing-models";
			else if (models.length) {
				var model = models.models[0];
				var refocus = { that: model.get("this") };
				if (onRefocus) onRefocus(refocus);
				return refocus;
			} else if (models.get && models.get("this")) {
				var refocus = { that: models.get("this") };
				if (onRefocus) onRefocus(refocus);
				return refocus;
			} else throw "urn:factcore:fact:oops:missing-focus";
		},

    	// Implement the Model(s) factory

		Model: function(query, _binding) {
            // sanity check
            if (!query) throw "urn:factcore:fact:finder:oops:missing-query";
            // resolve query
            if (_.isString(query)) query = my.factcore.fact.asq[query];
            if (_.isFunction(query)) query = query(_binding);
            // query sanity check
            if (!query["this"]) throw "urn:factcore:fact:finder:oops:missing-this";
            if (!query["from"]) throw "urn:factcore:fact:finder:oops:missing-from";
            if (!query["finderType"]) throw "urn:factcore:fact:finder:oops:missing-type";
            finderType = query["finderType"];
            query.application = query.application || my.factcore.this;
console.debug("Model '%s' %s from: %o", finderType, query, my.factcore.fact.finder, _binding);
			return my.factcore.fact.finder[finderType].Model(query,_binding);
		},

		xModels: function(_options, _binding) {
            // sanity check
            if (!query) throw "urn:factcore:fact:finder:oops:missing-query";
            // resolve query
            if (_.isString(query)) query = my.factcore.fact.asq[query];
            if (_.isFunction(query)) query = query(_binding);
            // query sanity check
            if (!query["this"]) throw "urn:factcore:fact:finder:oops:missing-this";
            if (!query["from"]) throw "urn:factcore:fact:finder:oops:missing-from";

			var finderType = "Core"; // TODO: make this configurable (using _options.from)
console.debug("Models %s from: %o", finderType, my.factcore.fact.finder);
			return my.factcore.fact.finder[finderType].Models(_options,_binding);
		},

		asq: {
			register: function(query) {
				if (!query && !query["this"]) throw "urn:factcore:fact:query:oops:missing-this";
				var that = query["this"];
				my.factcore.fact.asq[that] = query;
				return that; // return the model identity
			}
		},

		Finder: function(from, options) {
			if (!from) throw "urn:factcore:fact:oops:missing-from";
			// indirect resolution of $from
			if (_.isFunction(from)) return from(options);
			if (_.isObject(from) && from.baseURI) return from;
			if (!_.isString(from)) throw "urn:factcore:fact:oops:invalid-from"

			// resolve $from by reference
			var $from = my.factcore.fact.from[from];
			if ($from) {
//console.debug("Found Finder:", from, $from, $from.id );
				return $from;
			}
			my.factcore.fact.from[from] = $from = jQuery.rdf.databank([], {namespaces: { "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdfs":"http://www.w3.org/2000/01/rdf-schema#"}, base: from} )
//console.debug("Finding Finder:", from, $from, $from.id, my.factcore.fact.from );

			var finder_options = _.extend( { "this": "urn:factcore:rq:fact" , async: true }, options, { from: from, application: my.factcore.this} );
console.debug("Finder: ", $from, finder_options );
			this._loadfacts( $from , finder_options );
			return $from;
		},

		_loadfacts: function($from, options) {
		    console.debug("Load Facts: ", $from, options);
			if (!$from) throw "urn:factcore:fact:oops:missing-databank";
			if (!options) throw "urn:factcore:fact:oops:missing-options";
			if (!options["this"]) throw "urn:factcore:fact:oops:missing-this";
			if (!options["application"]) throw "urn:factcore:fact:oops:missing-application";
			var self = this;
			$from = _.extend($from, Backbone.Events); // Finders
			var queryParams = { "this": options["this"], from: options.from, application: options.application || self['this'] };


			// keys for local storage
			var query_id = options["this"];
			var from_id = options["from"];

			if (options.reload) {
				// clear local storage
				$.jStorage.deleteKey( from_id );
my.factcore.DEBUG && console.debug("Local cache cleared:", from_id)
			}

			var local_cache = $.jStorage.get( from_id );
			if (local_cache && !options.force) {
				// TODO: fix namespaces
				var cached = local_cache[query_id];
				if (cached && cached.namespaces) {
					$from.namespaces = _.extend($from.namespaces, cached.namespaces);
my.factcore.DEBUG && console.debug("Un-cached: %s %s %o", from_id, query_id, local_cache)
					$from.load(cached.triples);
					$from.trigger("uncached", local_cache[query_id] );
					$from.trigger("reload");
					return $from;
				}
			}

			my.factcore.DEBUG && console.debug("Loading Finder:", queryParams, options, $from);
			var promise = $.ajax({ url: "/rest/facts", datatype: "json", data: queryParams, async: options.async?true:false })
			.error( function(error, x, y, z) {
my.factcore.DEBUG && console.error("FINDER LOAD ERROR: %o %o %o %o %o", this, error, x, y, z);
				$from.trigger("error", error, x, y, z);
				my.factcore.UX.alert("urn:factcore:fact:oops:api-error", error.statusText);
			})
			.done( function(result) {
				// insert our results into knowledge base
				$from.namespaces = _.extend($from.namespaces, result.namespaces);
my.factcore.DEBUG && console.debug("Loaded facts:", options.from||"core()", result, my.factcore.fact);

				var count = self._insertTriples(result.triples, $from);
my.factcore.DEBUG && console.debug("Inserted %s into %o: ", count, $from );

				// cache in local storage
				if (!local_cache) { local_cache = {}; $.jStorage.set( from_id, local_cache ) }
				local_cache[query_id] = { namespaces: $from.namespaces, triples: $from.dump(), timestamp: result.timestamp|| new Date().getTime()  };
				$from.trigger("cached", local_cache[query_id] );
				$.jStorage.set( from_id, local_cache  );
				$.jStorage.setTTL(from_id, result.ttl || (1000*60*60) ); // default 1 hour
				// notify interested parties (models) that finder has reloaded
				$from.trigger("reload", result, options);
			})
			return $from;

		},

		_insertTriples: function(triples, databank, mapper) {
			var self = this;
			var count = 0;
			var errors = new Array();
			mapper = mapper || my.factcore.fact.datatype.rq2rdf;
			_.each(triples, function(that) {
                try {
                    var s = mapper.toURI(that.s, that)
                    var p = mapper.toURI(that.p, that)
                    var o = mapper.to(that.o, that);
                    if (o!=null) {
                            var $triple = $.rdf.triple(s,p,o);
                            databank.add($triple);
                            count++;
                    }
                } catch(e) {
                    that.e=e;
                    errors.push( that );
                }
			})
my.factcore.DEBUG && console.debug("Inserted %s, errors %o", count, errors);
			return count;
		},

		helpers: {
			// add triple to {}
			_model: function(that, map) {
				map = map || {};
				_.each(that, function(other, id) {
					if (other.value)  map[id] = other.value.toString();
					else  map[id] = other;
				})
				return map;
			},

			// turn triple results in to [{},{}] - used by CoreFinder
			// TODO: refactor
			_models: function(that, models) {
				var self = this;
				// my.factcore.DEBUG && console.debug("_models: %o %o %o", that, this, models);
				models = models || [];
				that.each(function(id, rdf) {
					var map = self._model(rdf);
					if (map) models.push(map);
				})
				return models;
			},

			_tree: function(query, from, root_model) {
				if (!query) throw "urn:factcore:ux:oops:missing-query-plan";
				var self = this;
				from = from || my.factcore.core();
				root_model = root_model || {};
				var rqb = new my.factcore.ASQ.RDF();
				var fn_root_query = rqb.build(query);
				var results = fn_root_query(from, root_model );
				var models = my.factcore.fact.helpers._models(results);
my.factcore.DEBUG && console.debug("Tree Root: %o %o", query, models);
				var idAttribute = "this", childAttribute = rqb.raw(query.follow["this"]);
				if (!childAttribute) throw "urn:factcore:ux:oops:missing-follow-this";
				var seen = {}

				var recurse = function(next_query, models) {
					if (!next_query.follow) return models;
					var follow_query = _.extend( { "this": next_query.get(idAttribute) , where: [] } );
					follow_query.where.push.apply( follow_query.where, next_query.follow.where );
//					if (next_query.follow.has) {
//						follow_query.where.push( { "this": "?that", "has": next_query.follow.has, "that": "?this" } );
//					}
					my.factcore.DEBUG && console.debug("RDF Recurse: %o %o", next_query, follow_query);
					var fn_follow = rqb.build(follow_query);
					_.each(models, function(model) {
						var focused = model.get( idAttribute );
						if (focused && !seen[focused]) {
							var refocus = {};
							if (focused) {
								refocus.that = focused;
							}
my.factcore.DEBUG && console.debug("Following: %o %o %o", model, refocus, follow_query);
							seen[focused] = true;
							var followed = fn_follow(from, refocus );
							var children  = recurse(next_query, my.factcore.fact.helpers._models( followed ) );
//							my.factcore.DEBUG && console.debug("RDF refocused: %o %o -> %o %o", model, focused, children, followed);
							if (children&&children.length>0) {
								model.set( childAttribute, children)
							}
						}
					})
					return models;
				}

				return recurse( query, models );
			}
		}
	});

	/* *****************************************************************************************************************
		IQ
	**************************************************************************************************************** */

	_.extend(my.factcore.IQ, {

        fn: function(thisFN) {
            var _fn = null;
            if (_.isString(thisFN)) {
                _fn = my.factcore.IQ[thisFN]
            } else if (_.isFunction(thisFN)) {
                _fn = thisFN;
            }
            if (!_fn) throw "urn:factcore:iq:oops:missing-function";
            return _fn;
        },

		// ensure IQ behaviour is Event-driven and aware of it's environment
		aware: function(options, source) {
			// TODO: inject Backbone.Events & wire-up EventPlanner
		},

	})

	/* *****************************************************************************************************************
		UX
	**************************************************************************************************************** */

	my.factcore.UX.mixin.Auto = {
		initializeAuto: function(options) {
			var self = this;
			_.each(self, function(v, k, l) {
				if (k.indexOf("is")==0) {
					var method = k.substring(2);
					var _mixin = my.factcore.UX.mixin[method];
					if (_mixin) {
						_.extend(self,_mixin);
						var initializer = _mixin["initialize"+method] || self["initialize"+method];
						if (initializer) {
						console.debug("Mix: ", this, _xmixin, method, arguments)
							_mixin.prototype.apply(this,arguments);
						}
					}
				}
			});
		}
	}

	my.factcore.UX.mixin.Attachable = {
		DEBUG: false,
		initializeAttachable: function() {
		},
		doAttachEvent: function(event) {
		},
		doDetachEvent: function(event) {
		},
		doAttach: function(that) {
		},
		doDetach: function(that) {
		}
	}

	my.factcore.UX.mixin.Droppable = {
		DEBUG: true,
		initializeDroppable: function(options) {
console.warn("initializeDroppable: ", this, options)
			if (options.droppable) {
				var self = this;
				var $facts = null;

				if (options.droppable.selector) {
					$facts = $(this.$el).closest(options.droppable.selector);
console.warn("Droppable Items: ", this.$el, $facts)
				} else if (this.children && this.children._views) {
					var _values = _.values(this.children._views);
					var _views = _.pluck( _values, "$el");
					$facts = $( _views );
console.warn("Droppable Children: ", _views, $facts)
				} else $facts = this.$el;

				$facts.droppable({
					activeClass: "ui-state-highlight", hoverClass: "ux_drop_hover",
					accept: options.droppable.accept || "*",
					drop: function(event,ui) {
						self.doEventDrop(event,ui);
					}
				});
my.factcore.UX.mixin.Droppable.DEBUG && console.debug("Initialize Droppable:", options, $facts);
			}
		},
		doEventDrop: function(ui, event) {
			var model = $(event.helper).data("urn:factcore:ux:model:drag");
my.factcore.UX.mixin.Droppable.DEBUG && console.debug("Event Drop:", this, ui, event, model);
			this.triggerMethod("drop", model, this, ui, event);
		}
	}

	my.factcore.UX.mixin.Draggable = {
		DEBUG: true,
		initializeDraggable: function(options) {
			options = _.extend({selector: "li" }, options);
			var self = this;
			var $facts = $(options.selector,this.$el);
			var templateKey = "template";
			$facts.draggable({
				appendTo: "body",
				revert: false,
				hoverClass:"ux_hovering",
				helper: function (e,ui) {
					var $about = $("[about]", this);
					var about = $about.attr("about");
					var model = null;
					if (self.collection) {
						model = self.collection.get(about);
					} else {
						model = self.model;
					}
					if (!model) {
my.factcore.UX.mixin.Draggable.DEBUG && console.log("Missing Draggable Model: ", $(this), self.collection, self.model);
						throw "urn:factcore:ux:oops:missing-model";
					}
					var $helper = null;
					var View = options.view || my.factcore.UX.View[ model.id || model.get("widget") || model.get("type") ];

//console.log("Drag Model: ", model.id, model);
					if (model.has(templateKey)) {
						var template = model.get(templateKey);
						View = Backbone.Marionette.ItemView.extend({ "template": template, model: model });
						var view = new View();
						view.render();
						$helper = $(view.el);
my.factcore.UX.mixin.Draggable.DEBUG && console.log("Render Drag Template: ", model.id, model, $helper);
					} else if (View) {
//console.warn("View FROM:", options.view, my.factcore.UX.View[ model.id || model.get("widget") || model.get("type") ], self.itemView);
                        var dummyCollection = new Backbone.Collection([ { "this": "urn:example:1", "label": "Example One"}, { "this": "urn:example:2", "label": "Example Two"}]);
						var view_options = { "this": model.id, "type": model.id, "model": model, label: model.get("label"), styleName: "popover-content", collection: dummyCollection }
my.factcore.UX.mixin.Draggable.DEBUG && console.log("Render Drag Widget: ", model.id);
						var Widget = View(view_options)
						var view = new Widget(view_options);
//my.factcore.UX.mixin.Draggable.DEBUG && console.debug("Drag View: %o %o %o %o %o", model.id, Widget, view, model, $helper );
						view.render();
						$helper = $(view.el);
					} else $helper = $(this).clone();

					$helper.data("urn:factcore:ux:model:drag", model);
					$helper.addClass("ux_draggable")
					return $helper;
				}
			})
//			$facts.disableSelection();
my.factcore.UX.mixin.Draggable.DEBUG && console.debug("Initialized Draggables:", this.$el, $facts);
			return $facts;
		},
		doEventDrag: function(ui, event) {
			var model = $(event.helper).data("urn:factcore:ux:model:drag");
my.factcore.UX.mixin.Draggable.DEBUG && console.debug("Event Drag:", this, ui, event, model);
			this.trigger("drag", model, ui, event);
		},
		onDrag: function(that) {
my.factcore.UX.mixin.Draggable.DEBUG && console.debug("onDrag:", this, that);
		}
	}

	my.factcore.UX.mixin.Hideable = {
		hide: function() {
			if (this.is_hidden) return;
my.factcore.UX.DEBUG && console.debug("Hide", this)
			var $html = $(".fade", this.$el);
			$html.removeClass('in');
			this.$el.fadeOut();
			this.is_hidden = true;
			return this;
		},
		reveal: function() {
			if (this.is_hidden==false) return;
			var $html = $(".fade", this.$el);
my.factcore.UX.DEBUG && console.debug("Reveal", this, $html)
			$html.addClass('in');
			this.$el.fadeIn();
			this.delegateEvents(this.options.events);
			this.is_hidden = false;
			return this;
		}
	}

	my.factcore.UX.mixin.Affixed = {
		affix: function(options) {
			options = _.extend({
				offset: {
					top: 100,
					bottom: function () {
						return (this.bottom = $('.bs-footer').outerHeight(true))
					}
				}
			}, options || this.options);
			this.$el.affix(options);
			return this;
		}
	}

	my.factcore.UX.mixin.Selectable = {
		DEBUG: true,
		initializeSelectable: function() {},

		select: function(selected, event) {
			if (!selected) throw "urn:factcore:ux:oops:missing-selection";
			var model = null;
			if (_.isFunction(selected)) {
				model = selected(this, event);
			}
			if (_.isString(selected)) {
				model = this.collection.get(selected);
			}
			if (selected instanceof Backbone.Model) {
				model = selected;
			}
			if (selected instanceof Backbone.Collection) {
				model = selected.models[0];
			}
			if (model && this.selectItem) this.selectItem(model, event)
			else if (!model) {
				my.factcore.UX.mixin.Selectable.DEBUG && console.log("** Unknown model for selection: ", selected, event);
				throw "urn:factcore:ux:oops:unknown-selection";
			}
		},

		// default event-handler for model selections
		doEventSelect: function(event) {
			if (!event) throw "urn:factcore:ux:oops:select:event-missing";
			var $abouts = $(event.currentTarget).closest("[about]");
			if (!$abouts.length) throw "urn:factcore:ux:oops:select:event-model-missing";
			var focus = $abouts.attr("about");
			if (focus && this.collection) {
				// handle flat and nested (via _all) collections
				var model = this.collection._all?this.collection._all.get(focus):this.collection.get(focus);
				my.factcore.DEBUG && console.debug("onSelect Collection: %o %o -> %o %o %o ", this, event, this.collection, focus, model );
				if (model) {
					this.doSelect(model, event);
				} // else throw "urn:factcore:ux:oops:select:model:not-found";
			} else if (focus && this.model) {
my.factcore.UX.mixin.Selectable.DEBUG && console.debug("onSelect Item:", this, event, focus, this.model );
				this.doSelect(this.model, event);
			} else {
				console.error("event: %o $abouts :%o focus: %o", event, $abouts, focus)
				throw "urn:factcore:ux:oops:select:not-found";
			}
		},

		// Fire select/deselect events on source model and create/update a Selection model
		doSelect: function(model, event) {
			if (!model) throw "urn:factcore:ux:oops:select:model-missing";
			if (this.selection) {
				this.triggerMethod("deselect", model, event);
				this.triggerMethod("deselection", this.selection, event);
				if (model.collection) model.collection.trigger("deselect", this.selection, event );
				this.selection.reset();
			} else this.selection = new Backbone.Collection();
			this.selection.add(model);
			this.triggerMethod("select", model, event );
			this.triggerMethod("selection", this.selection, event );
			if (model.collection) model.collection.trigger("select", this.selection, event );
my.factcore.UX.mixin.Selectable.DEBUG && console.debug("doSelect:", this, model, this.selection, event);
			this.select(model, event); // visualise the selection
			return this.selection;
		}
	}

	my.factcore.UX.mixin.Common = $.extend({

		_initialize:function(options) {
			options = my.factcore.UX.checkOptions(options, ["this"]);
			this["this"] = options['this'];
			this.domEvents = options.events;
			console.debug("Default UX Initializer:", this)
		},
		templateHelpers: {
			test: function(that) {
				console.debug("Template Test:", this, that);
				return "TEST";
			},
			uid: function(that) {
				console.debug("Template UUID:", this, that);
				return my.factcore.UX.urn(that);
			},
		},
        doEventTrigger: function(event) {
            if (!event || !event.currentTarget) throw "urn:factcore:ux:oops:missing-action-event"
            var action = $(event.currentTarget).attr("data-ux-trigger");
            if (!action) throw "urn:factcore:ux:oops:missing-action";
            console.log("Event Action: ", this, event)
            this.triggerMethod(action, event);
        },
		position: function(event) {
			if (this.show) this.show();
			else console.warn("Can't show new position: ", this, event);
			if (!event) throw "urn:factcore:ux:oops:missing-position";
            var x = event.screenX?event.screenX:event.pageX;
            var y = event.pageY?event.pageY:event.screenY;
            if (!x || !y) throw "urn:factcore:ux:oops:invalid-position";

			var halfHeight =  (this.$el.height()/2);
			var width = this.$el.width();
			var offsetX = x+width>$(document).width()?x-width:0;
			var offsetY = y-halfHeight<0?0:-halfHeight;

   			this.$el.css({ position: "absolute", top: y+offsetY, left: x+offsetX, "margin-left": 0 });

            if (offsetX) {
                this.$el.removeClass("right");
                this.$el.addClass("left");
            } else {
                this.$el.removeClass("left");
                this.$el.addClass("right");
            }
			console.log("Positioned", this, event, this.$el.position());
		},
		triggerMethod: Marionette.triggerMethod,

		getIdentity: function() { return this["this"] || this.options["this"]; },

		_select: my.factcore.UX.mixin.Selectable

	}, my.factcore.UX.mixin.Selectable, my.factcore.UX.mixin.Hideable);

	_.extend(my.factcore.UX, {

		// sanitize a string into an HTML id
		uid: function(id) {
			if (!id) throw "urn:factcore:ux:oops:missing-id";
			return id.replace(new RegExp("[^A-Za-z0-9]", 'g'),"_");
		},

		// bind models (and optional collections) by reference (string), Backbone.Model or from default options
		model: function(options, modelled) {
			if (!options) throw "urn:factcore:ux:oops:missing-options"
			var fact = my.factcore.fact;
			modelled = modelled || _.extend({},options);
			if (!options.model) {
				modelled.model = new fact.factory.FactModel( { "this": options["this"], label: options.label, comment: (options.comment || ""), icon: (options.icon || "") } );
			} else if (_.isString(options.model)) {
				modelled.model = fact.space[options.model];
			} else if (_.isObject(options.model) && options.model instanceof Backbone.Model ) {
				modelled.model = options.model;
			} else throw "urn:factcore:ux:oops:invalid-model"

			if (_.isString(options.collection)) {
				modelled.collection = modelled.model.get(collection);
			} else if (_.isArray(options.collection)) {
				modelled.collection = new my.factcore.fact.factory.FactModels(options.collection);
			} else if (_.isObject(options.collection) && options.collection instanceof Backbone.Collection ) {
				modelled.collection = options.collection;
			}
			return modelled;
		},

		// ensure UX component is Event-driven and aware of it's environment
		aware: function(options, source) {
			// TODO: wire-up Backbone.View events
		},

		// add type-specific defaults to UX options
		decorate: function(options) {
			if (options && options.type) {
				// lookup global settings by Widget type
				var settings = my.factcore.UX.types[options.type];
				if (settings) {
					options.className?(options.className+" "+settings.className):settings.className;
				}
			}
			return options;
		},

		// augment CSS with optional styles
		stylize: function(css, options) {
			css = css || "";
			if (options && options.styleName) css = css + " " + options.styleName;
			return css;
		},

		// attach 'this' attributes as HTML 'id' and RDFA 'about'
		identify: function($html, options) {
			var that = options.get?options.get("this"):options["this"];
			id = this.uid(that);
			$html.attr("id", id);
			$html.attr("about", that);
		},

		// enforce required options, throw an exception if undefined
		checkOptions: function(options, required) {
			if (!options) throw "urn:factcore:ux:oops:missing-options";
			required = required || ["this", "label"];
			for (var i = 0; i < required.length; i++) {
				var key = required[i];
				if (_.isUndefined(options[key])) {
					console.error("Missing '%s' options: %s -> %o", key, options['this'], options);
					throw new TypeError("urn:factcore:ux:oops:missing-option-"+key);
				}
			}
			return options;
		},

		// attach pop-overs
		factualize: function(that, options) {
			if (!options) return;
			var self = this;
			// defaults
			options = _.extend({
			    selector: "[about]", trigger: "hover", placement: "right", html: true,
				title: function() {
					var about = $(this).attr( "about");
					var label = options.label || $(this).text() || about;
					return label;
				},
				content: function() {
					var about = $(this).attr( "about");
					if (options.view) {
						var view = new options.view(options);
						// if we have a model, use it. if view has a collection, lookup the model & use it. otherwise use our options
						view.model = options.model?model:(that.collection?that.collection.get(about):new Backbone.Model(options));
						// return the rendered HTML for the popover content
						return view.render().el;
					}
					var comment = $(this).attr("title") || "";
					return comment;
				},
			}, options);

			setTimeout(function() {
    			var $facts = $(options.selector,that.$el).addClass("ux_factualized");
				$facts.popover(options);
my.factcore.DEBUG && console.debug("Factualized: %o %o %o", self, options, $facts);
			},10)
			return this;
		},

		alert: function(type, message) {
		    alert(type+" "+message);
		}
	});

	/* *****************************************************************************************************************
		UX factories
	**************************************************************************************************************** */

	my.factcore.UX.Widget = my.factcore.UX.View["urn:factcore:ux:Widget"] = function(options) {
		if (options['this']=="urn:factcore:ux:Widget" || options.type =="urn:factcore:ux:Widget") {
			return null;
		}
		// functional options
	  if (_.isFunction(options)){ options = options.call(this); }
	  // sanity check
		options = my.factcore.UX.checkOptions(options, ["this", "label", "type"]);
		// obtain a Backbone.View from global UX namespace
		var fnWidget = my.factcore.UX.View[options.type];
		if (!fnWidget) throw "urn:factcore:ux:oops:unknown-widget#"+options.type;
		// instantiate our widget
		var Widget = fnWidget(options);
		if (!Widget || !_.isFunction(Widget)) throw "urn:factcore:ux:oops:invalid-widget#"+options.type;
		var widget = new Widget(options);
//		my.factcore.UX.DEBUG && console.debug("New UX Widget:", options.type, options, widget);
		return widget;
	}

	my.factcore.UX.Panel = my.factcore.UX.View["urn:factcore:ux:Panel"] = function(options) {
		var self = this;
		var DEBUG = true; //  && my.factcore.UX.DEBUG
		options = _.extend({ modal: true, dialog: false }, options);

		// wrap our widget in a (modal) panel
		var Panel = Backbone.Marionette.ItemView.extend( _.extend({
			className: my.factcore.UX.stylize("ux_panel modal popover right", options),
			tagName: "div",
			template: "<div id='{{_this_}}' about='{{this}}'><div class='arrow'></div><div class='popover-title'><span class='ux_toolbar icon-bar pull-right'><i class='icon btn icon-remove' data-ux-trigger='close'></i></span><label  title='{{comment}}'>{{label}}</label></div></div><div class='ux_panel_content popover-content'></div>",
            events: {
                "click [data-ux-trigger]": "doEventTrigger"
            },
			initialize: function(_options) {
				// de-reference and instantiate our widget
				this.widget = my.factcore.UX.Widget(_options);
				// we wrap a widget ... so it's data bindings are ours
				this.model = this.widget.model;
				this.collection = this.widget.collection;
			},
			onShow: function() {
				$("body").append(this.$el);
				this.widget.render();
				var $panel = this.$el.find(".ux_panel_content");
				if (!$panel || !$panel.length) throw "urn:factcore:ux:oops:missing-widget";
DEBUG && console.debug("Panel onShow: %o %o %o", options, this, this.widget);

				$panel.append(this.widget.$el);
				if (options.dialog) this.$el.dialog( { title: options.label, appendTo: "body", modal: options.modal, width: "700" });
/*
				this.$el.popover({
					title: function() {
						return this.$el.find("label").html();
					},
					content: function() {
						return this.widget.$el.html();
					},
					show: true

				});
*/
				return this;
			},
			show: function() {
				this.render();
				this.onShow();
				this.reveal();
			}
		}, my.factcore.UX.mixin.Common) )

		// instantiate Panel widget

		var panel = new Panel( options );
		if (options.collection) options.collection.on("reset", panel.render, panel);

		DEBUG && console.debug("UX Panel: %o %o %o", options, panel, panel.widget);
		return panel;
	}

	_.extend(my.factcore.fact.datatype, {
		rq2rdf: {
			toURI: function(that, source) {
				if (_.isObject(that) && that.ID) {
// handle blank nodes - ensure they are globalized
//console.log("BLANK: %o", that, source);
					return "<urn:local:"+that.ID+">";
				} else return "<"+that+">";
			},
			to: function(that, source) {
				if (_.isString(that)) {
					return "\""+that+"\"";
				} else if (that.label) {
					// LITERAL
					try {
						return "\""+that.label+"\""+(that.datatype?"^^<"+that.datatype.namespace+that.datatype.localName+">":"");
					} catch(e) {
my.factcore.DEBUG && console.warn("Parse Error:", that, e);
						return "\""+that.label+"\"^^xsd:simpleType";
					}
				} else if (that.namespace || that.localName) {
					// CNAME / URI
					return "<"+that.namespace+that.localName+">";
				} else if (that.ID) {
					// BNODE
// handle blank nodes - ensure they are globalized
//console.log("BNODE: ", that, that.ID, source);
					return "<urn:local:"+that.ID+">";
				}

			}
		},
		xsd2json: {
			to: function(that) {
				return that;
			}
		}
	});

/*
				try {
//				my.factcore.DEBUG && console.debug("Import: %o", that);
					if (that.o.label) {
						// LITERAL
						// TODO: functional datatype jumptable
						$triple = $.rdf.triple("<"+that.s+">", "<"+that.p+">", "\""+that.o.label+"\""+(that.o.datatype?"^^<"+that.o.datatype.namespace+that.o.datatype.localName+">":"") );
					} else if (that.o.namespace || that.o.localName) {
						// CNAME / TRIPLE
						$triple = $.rdf.triple("<"+that.s+">", "<"+that.p+">", "<"+that.o.namespace+that.o.localName+">");
					} else if (that.o.ID) {
						// BNODE
console.log("BNODE: %o %s",that.o, ""+that.o._string)
						$triple = $.rdf.triple("<"+that.s+">", "<"+that.p+">", "_:"+that.o);
					} else {
						throw "urn:factcore:fact:rdf:triple:failed";
//					$triple = $.rdf.triple("<"+that.s+">", "<"+that.p+">", "\""+that.o.toString()+"\"" );
//						my.factcore.DEBUG && console.error("Faulty Triple: %o --> %o", that, that.o);
//					throw "urn:factcore:ux:oops:unknown-triple-type#"+that.o;
					}
				} catch(e) {
					$triple = $.rdf.triple("<"+that.s+">", "<"+that.p+">", "\""+that.o.label+"\"");
//					my.factcore.DEBUG && console.debug("Parse Error: %o -> %o %o", that, e, $triple);
				}
*/
	return my.factcore;

})(jQuery, window);
