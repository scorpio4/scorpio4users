(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:FacetFilter"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var DEBUG = my.factcore.UX.DEBUG && true; // master DEBUG kill-switch

		var FacetFilter = Backbone.Marionette.ItemView.extend({
			template: "<div about='{{this}}'>{{label}}<span class='ux_facet_filters'></span></div>",
			className: "ux_facet_filter",
			initialize: function() {
				my.factcore.UX.model(options, this);
			},
			onShow: function() {
				var self = this;
				var $html = $(".ux_facet_filters", this.$el);
				if (!$html.length) {
DEBUG && console.debug("HTML FacetFilter - missing $html", this, $html);
					throw "urn:factcore:ux:oops:missing-html";
				}
DEBUG && console.debug("HTML FacetFilter", this, $html);
				var visualSearch = VS.init({
					container: $html, query: "",
					callbacks : {
						search : function(query, searchCollection) {
DEBUG && console.debug("FacetFilter Search: %o %o", query, searchCollection);
							self.triggerMethod("search", query, searchCollection);
						},
						facetMatches : function(fn_return) {
							var matches = []
							_.each(options.meta.models, function(v,k,l) {
DEBUG && console.debug("FacetFilter facet: %o", v,k,l);
								if (!v.has("renderable") || v.get("renderable")) {
									matches.push({ category: options.label, "label": v.get('label'), "value": v.get('this') });
								}
							});
DEBUG && console.debug("FacetFilter facets: %o", matches);
							fn_return(matches);
						},
						valueMatches : function(facet, searchTerm, value, fn_return) {
DEBUG && console.debug("FacetFilter value: %o %o %o", facet, searchTerm || "-", value || "~");
							fn_return([
								{ value: '1-amanda', label: facet+' Amanda' },
								{ value: '2-aron',   label: facet+' Aron' },
								{ value: '3-eric',   label: facet+' Eric' },
								{ value: '4-jeremy', label: facet+' Jeremy' },
								{ value: '5-samuel', label: facet+' Samuel' },
								{ value: '6-scott',  label: facet+' Scott' }
							]);
						}
					}
				});
			}


		});
		return FacetFilter;
	}

})(jQuery, window);

