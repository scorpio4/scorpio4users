(function($, my) {

	my.scorpio4.fact.Facet = function(models, options) {

		this.initialize = function(models, options) {
			if (!options) throw "urn:scorpio4:fact:missing-options";
			if (!options.domain) throw "urn:scorpio4:fact:missing-domain";

			_.extend(this, Backbone.Collection.extend( { idAttribute: "this" } ) );

			this.FacetSet = Backbone.Collection.extend( { idAttribute: "this" } );
			_.extend(this.FacetSet, Backbone.Model);

			this.models = new Facet();
			this._addModels(models, options);
		}

		this._addModels = function(models, options) {
			var self = this;
			var facetType = options.domain;
			models.each(function(model) {
				var facet = self.get(facetType);
				if (!facet) {
					facet = new self.FacetSet({"this": facetType});
					self.add( facet );
				}
				facet.add(model);
			})
		}


		this.initalize(models, options);
		return this;
	}

})(jQuery, window);

