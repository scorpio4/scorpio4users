(function($, my) {

	// Extend our namespace
	_.extend(my.factcore.fact.finder, { Local: {} });

	// Implement Backbone.Collection factory
	my.factcore.fact.finder.Local.Models = function(options, bindings) {
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
		} else {
			pagingState = { firstPage: 0, currentPage:0, pageSize: 25, sortKey: "updated", order: 1 };
		}
		// create a Paged Collection
		var FactModel = my.factcore.fact.factory.FactModel
//			var FactCollection = Backbone.Collection.extend( { model: factModel }, options );
		var FactCollection = Backbone.PageableCollection.extend( { model: FactModel,   mode: "client", state: pagingState }, options );

		// create a collection of factModels
		var models = new FactCollection();
		models.sync = my.factcore.fact.finder.Local.Sync(options)

		// locate $from (RDF databank)
		var that = options["this"];
		var from = options["from"];
		if (from) {
			models.$from = this.Finder(from);
			if (!models.$from) throw "urn:factcore:fact:finder:oops:unknown-finder#"+from;
		}

		// configure Collection to support re-fetching
		models.bindings = bindings || {};
		models["this"] = that;
		// lazy load fact Finder graph
		if (!options.lazy && models.$from) {
			models.$from.on("reload", function(result) {
my.factcore.DEBUG && console.debug("[Local]%s Models Reloaded: %o %o %o %s %o %o", models.length, models.$from, that, models, (bindings?"not bound":"bindings"), bindings, result)
				// fetch from lazy-loaded $finder
				models.fetch( bindings );
				models.trigger("fetch", bindings); // notify
			})
			// fetch - iff pre-loaded $finder
			if (models.$from.tripleStore && models.$from.tripleStore.length>0) {
				models.fetch( bindings );
			}
		}

		return models;
	}

	// Implement Backbone.Model factory
	my.factcore.fact.finder.Local.Model = function(options, model) {
		// dynamic configuration
		if ( _.isString(options) ) options = my.factcore.fact.asq[options]; // retrieve query by reference
		if ( !_.isObject(options) ) throw "urn:factcore:fact:model:oops:invalid-options";

		// sanity check
		if (!options["this"]) throw "urn:factcore:fact:model:oops:missing-this";
		var identity = options["this"];

		// create the root Backbone.Model
		var factModel = my.factcore.fact.factory.FactModel
		if (!model || !model.set) {
			// ensure we have a root Model, if not explicit, then by reference, alternatively create a new one
			model = my.factcore.fact.space[identity] = my.factcore.fact.space[identity] || new factModel(model);
		}
		// refocus on new bindings
		var bindings  = _.extend( {}, options.bindings, { that: model.get("that") } );
		// attach collection to model
		var models = my.factcore.fact.finder.Local.Models(options,bindings);
console.debug("[Local]Build Model:", model, models, options, bindings );
		model.set( identity, models );

		return model;
	}

	// Implement Backbone.Collection.sync
	my.factcore.fact.finder.Local.Sync = function(options, bindings) {
		return function(method, models, actions) {
my.factcore.fact.DEBUG && console.debug("[Local]Local Finder:", method, models, actions);
			var options = { "this": my.factcore.fact.urn("urn:factcore:dummy"), "from": "urn:factcore:dummy" }
			var models = my.factcore.fact.finder.Local.Models(options);
			return models;
		}
	}

	// Implement 'read' method of a Backbone.Collection.sync
	my.factcore.fact.finder.Local.read = function(root, query, actions, bindings) {
		return root;
	}

})(jQuery, window);

