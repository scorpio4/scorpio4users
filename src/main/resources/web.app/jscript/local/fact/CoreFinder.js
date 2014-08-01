    (function($, my) {

// Extend our namespace
_.extend(my.factcore.fact.finder, { Core: {
    DEBUG: true,

    // add triple to {}
    toObject: function(that, map) {
        var self = this;
        map = map || {};
        _.each(that, function(other, id) {
            if (other.value)  {
//self.DEBUG && console.log("toObject: ", other)
                map[id] = other.value.toString();
            }
            else  map[id] = other.toString();
        })
        return map;
    },

    // turn triple results in to [{},{}] - used by CoreFinder
    toArray: function(that, models) {
        var self = this;
self.DEBUG && console.debug("toArray: %o %o %o", that, this, models);
        models = models || [];
        that.each(function(id, rdf) {
            var map = self.toObject(rdf, {} );
            if (map) models.push(map);
        })
        return models;
    },

	// Implement Backbone.Collection factory

    Models: function(options, bindings) {
		if (!options) throw "urn:factcore:fact:finder:oops:missing-options";
		// sanity check
		if (_.isString(options)) options = my.factcore.fact.asq[options];
		if (_.isFunction(options)) options = options(bindings);
		if (!options["this"]) throw "urn:factcore:fact:finder:oops:missing-this";
		if (!options["from"]) throw "urn:factcore:fact:finder:oops:missing-from";
		var self = this;

		var pagingState = null;
		if (options.paging && _.isObject(options.paging)) {
			pagingState = options.paging;
		} else if (options.paging) {
			pagingState = { firstPage: 0, currentPage: 0, pageSize: 10, sortKey: "label", order: 1 };
		} else {
			pagingState = { firstPage: 0, currentPage:0, pageSize: 999, sortKey: "label", order: 1 };
		}

        var bb_default_url = function(that) {
my.factcore.fact.finder.Core.DEBUG && console.log("[Core] fetch URL:", this, that)
            return "dummy";
		}
		// create a Paged Collection
		var FactModel = my.factcore.fact.factory.FactModel.extend({
		    url: bb_default_url
		})
//			var FactCollection = Backbone.Collection.extend( { model: factModel }, options );
		var FactCollection = Backbone.PageableCollection.extend( { model: FactModel,   mode: "client", state: pagingState, url: bb_default_url }, options );

		// create a collection of factModels
		var models = new FactCollection(options);
		models.sync = my.factcore.fact.finder.Core.Sync(options)

		// locate $from (RDF databank)
		var that = options["this"];
		var from = options["from"];
		if (from) {
			models.$from = my.factcore.fact.Finder(from);
			if (!models.$from) throw "urn:factcore:fact:finder:oops:unknown-finder#"+from;
		}

		// configure Collection to support re-fetching
		bindings = bindings || {};
		if (bindings.attributes) bindings = bindings.attributes;

		models.bindings = bindings;
		models["this"] = that;
		// lazy load fact Finder graph
		if (!options.lazy && models.$from) {
			models.$from.on("reload", function(result) {
my.factcore.fact.finder.Core.DEBUG && console.debug("[Core] %s onReload: %o %o %o %s %o %o", models.models.length, models.$from, that, models, (bindings?"bound":"UN-bound"), bindings, result)
				// fetch from lazy-loaded $finder
				models.fetch(  );
				models.trigger("fetch", bindings); // notify listeners
			})
			// fetch - iff pre-loaded $finder
			if (models.$from.tripleStore && models.$from.tripleStore.length>0) {
my.factcore.fact.finder.Core.DEBUG && console.debug("[Core] Pre-fetch: ", models, bindings)
				models.fetch();
			}
		}

		return models;
	},

	// Implement Backbone.Model factory
	Model: function(query, model) {
my.factcore.fact.finder.Core.DEBUG && console.debug("[Core] Model: ", query, model);

		// dynamic configuration
		if ( _.isString(query) ) query = my.factcore.fact.asq[query]; // retrieve query by reference
		if ( !_.isObject(query) ) throw "urn:factcore:fact:finder:oops:invalid-query";

		// sanity check
		if (!query["this"]) throw "urn:factcore:fact:finder:oops:missing-this";
		var identity = query["this"];

		// create the root Backbone.Model
		var FactModel = my.factcore.fact.factory.FactModel
		if (!model || !model.set) {
			// ensure we have a root Model, if not explicit, then by reference, alternatively create a new one
			model = my.factcore.fact.space[identity] = my.factcore.fact.space[identity] || new FactModel(model);
		}

		// default refocus - returns a simple Object binding from a Model
		var fn_refocus = function(model) {
    		return { that: model.get("that") || model.get("this") }
		}
		if (query.refocus) {
		    if (_.isString(query.refocus)) fn_refocus = my.fact.IQ[query.refocus];
		    if (_.isFunction(query.refocus)) fn_refocus = query.refocus;
		    throw "urn:factcore:fact:finder:oops:invalid-refocus";
		}

		// refocus on new bindings
		var bindings  = _.extend( {}, query.bindings, model, fn_refocus(model) );
		// attach collection to model
		var models = this.Models(query, bindings);
my.factcore.fact.finder.Core.DEBUG && console.debug("[Core] Initialize Model:", model, models, query, bindings );
		model.set( identity, models );

		return model;
	},

	// Implement Backbone.Collection.sync
	Sync: function(options, bindings) {
        var self = this;
		return function(method, models, actions) {
			var crud = self[method];
			if (!crud) throw "urn:factcore:fact:finder:oops:missing-method#"+method;
			crud(models, options, actions, _.extend({ that: actions.that||null }, bindings ) );
			return models;
		}
	},

	// Implement 'read' method of a Backbone.Collection.sync
	read: function(root, query, actions, bindings) {
		if (!query) throw "urn:factcore:ux:oops:missing-query-plan";
		if (!root) throw "urn:factcore:ux:oops:missing-root-model";
		if (!root.$from) throw "urn:factcore:ux:oops:missing-from-finder";

		root.trigger("before:query");
		var $core = $.rdf({databank: root.$from});
		var idAttribute = my.factcore.idAttribute;

my.factcore.fact.finder.Core.DEBUG && console.debug("Reading %s -> %s: $:%o r:%o q:%o a:%o b:%o", (query.follow?"TREE":"TABLE"), query["this"], $core,  root, query, actions, bindings)

		var asq = new my.factcore.ASQ.Core();

		var fn_root_query = asq.build(query);
		var results = fn_root_query( $core, bindings );
		root.reset();
		var models = my.factcore.fact.finder.Core.toArray(results);
// my.factcore.fact.finder.Core.DEBUG && console.debug("Root Results", root, results, models)

		if (!query.follow) {
			root.add(models);
			root.trigger("query");
			root.trigger("change", bindings);
			return root;
		}

		// recursive query
		var childAttribute = asq.raw(query.follow["this"]) || "has";
		if (!childAttribute) throw "urn:factcore:ux:oops:missing-follow-this";
		var follow_query = _.extend( { "this": query[my.factcore.idAttribute] , where: [] } );
		follow_query.where.push.apply( follow_query.where, query.follow.where );
		var fn_follow = asq.build(follow_query);
my.factcore.fact.finder.Core.DEBUG && console.debug("Tree Follow: %o %o -> %o %o", childAttribute, follow_query, root, models);
		var NestedCollection = Backbone.Collection.extend({ idAttribute: idAttribute });

		var SimpleModel = Backbone.Model.extend({idAttribute: idAttribute});
		var AllChildren = Backbone.Collection.extend({ idAttribute: idAttribute, model: SimpleModel });

		root.$from.models = new AllChildren();
		root._all = new AllChildren();

		var TreeNode = Backbone.Model.extend({
			idAttribute: idAttribute,
			initialize: function(record) {
//DEBUG && console.debug("Branch: %o", record);
				if (record) {
					var self = this;
					var focus = {that: record.get?record.get(idAttribute):record[idAttribute] };
					var $core = $.rdf({databank: root.$from});
					var results = focus && fn_follow($core, focus );
//DEBUG && console.debug("Tree Record: %o %o %o -> %o", focus.that, record, focus, results);
					if (results) {
						// DEBUG && console.debug("Tree Branch:", focus.that , this, record, results);
						var has = new NestedCollection();
						has.model = TreeNode;
						self.set( childAttribute , has);
//						self.set(childAttribute, has);
						_.each(results, function(result, result_id) {
// DEBUG && console.debug("model: %o %o", result_id, result, model);
							var _model = {}
							_.each(result, function(other, other_id) {
// DEBUG && console.debug("other: %o %o", other_id, other);
								if (other.value) {
									_model[other_id] = other.value.toString();
// my.factcore.fact.finder.Core.DEBUG && console.debug("other: %o %o", other_id, other);
								} else _model[other_id] = other.toString();
							})
							var model = new TreeNode(_model);
							has.add(model);
							root._all.add(model);
							root.$from.models.add(model);
						})
					}
				}
			}
		});
		root.model = TreeNode;
my.factcore.fact.finder.Core.DEBUG && console.debug("Tree Add: ", root, models);
/*
		_.each(models,function(model) {
			root._all.add(model);
			root.$from.models.add(model);
		})
*/
		root.add(models);
		root.trigger("query");
		root.trigger("change", bindings);
my.factcore.fact.finder.Core.DEBUG && console.debug("Tree Changed:", root);

		return root;
	}
	}});

})(jQuery, window);

