(function($, my) {

	// Extend our namespace
	_.extend(my.factcore.fact.finder, { Remote: {} });

	// Implement Backbone.Collection factory
	my.factcore.fact.finder.Remote.Models = function(options, bindings) {
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
		models.sync = my.factcore.fact.finder.Remote.Sync(options)

		// locate $from (RDF databank)
		var that = options["this"];
		var from = options["from"];
		if (from) {
			models.$from = my.factcore.fact.Finder(from);
			if (!models.$from) throw "urn:factcore:fact:finder:oops:unknown-finder#"+from;
		}

		// configure Collection to support re-fetching
		models.bindings = bindings || {};
		models["this"] = that;
		// lazy load fact Finder graph
		if (!options.lazy && models.$from) {
			models.$from.on("reload", function(result) {
my.factcore.DEBUG && console.debug("[Remote]%s Models Reloaded: %o %o %o %s %o %o", models.length, models.$from, that, models, (bindings?"not bound":"bindings"), bindings, result)
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
	my.factcore.fact.finder.Remote.Model = function(options, model) {
		// dynamic configuration
		if ( _.isString(options) ) options = my.factcore.fact.asq[options]; // retrieve query by reference
		if ( !_.isObject(options) ) throw "urn:factcore:fact:model:oops:invalid-options";

		// sanity check
		if (!options["this"]) throw "urn:factcore:fact:model:oops:missing-this";
		var identity = options["this"];
console.debug("[Remote] Model %s Factory: %o %o", identity, options, model );

		// refocus on new bindings
		var bindings  = _.extend( {}, options.bindings, { that: model?model.get("that"):options.this } );

		var pagingState = { firstPage: 0, currentPage:0, pageSize: 50, sortKey: "updated", order: 1 };

		if (options.paging && _.isObject(options.paging)) {
			_.extend(pagingState, options.paging);
		}
		// create a Paged Collection
		var FactModel = my.factcore.fact.factory.FactModel
//			var FactCollection = Backbone.Collection.extend( { model: factModel }, options );
		var FactCollection = Backbone.Collection.extend( { model: FactModel,   mode: "server", state: pagingState }, options );
		var models = new FactCollection();
console.debug("[Remote] Collection: ", models, options);
		models.sync = my.factcore.fact.finder.Remote.Sync(options);
/*
		models.url = function(_options) {
console.debug("[Remote] URL: ", options, _options);
		}
*/
        var model = new FactModel();
console.debug("[Remote] Model:", identity, model );
		model.set( identity, models );

console.debug("[Remote] Fetch:", identity, bindings );
        if (!options.lazy) {
            bindings.reset = true;
            models.fetch(bindings);
        }
		return model;
	}

	// Implement Backbone.Collection.sync
	my.factcore.fact.finder.Remote.Sync = function(options, bindings) {
		return function(method, models, actions) {
my.factcore.fact.DEBUG && console.debug("[Remote] Sync:", method, models, actions);
			my.factcore.fact.finder.Remote[method](models, options, actions, bindings);
			return false;
		}
	}

	// Implement 'read' method of a Backbone.Collection.sync
	my.factcore.fact.finder.Remote.read = function(root, query, actions, bindings) {
my.factcore.fact.DEBUG && console.debug("[Remote] Read:", root, query, actions, bindings);
        query.bindings = bindings || {};
        var promise = $.ajax( { url: "/rest/crud/"+query.this , data: query, datatype: "json", async: true }).done( function(reply) {
            var models = reply[query.this];
            root.add(models);
            my.factcore.DEBUG && console.debug( "[Remote] READ DONE: ", query, reply, models, root);
			root.trigger("fetch", bindings);
        });
        return root;
	}

})(jQuery, window);

