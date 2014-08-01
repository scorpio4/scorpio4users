$(document).ready(function() {

	var application = "urn:example:app:hello";
	var my = factcore.boot({"this": application, core: { reload: false } } );

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}
	var _default_factualizer = { "this": "urn:example:app:factualizer", trigger: "hover", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}}</span>" }) }

	my.on("booted", function() {

		var model_finder = application;

		var query_facet =  my.fact.asq.register( {
			"this": 	"urn:example:model:concepts:", lazy: false,
			"from":		model_finder,
			"where": [
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "?type", // <http://www.w3.org/2000/01/rdf-schema#Class>" //
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:label",
					"that"	: "?label",
				},
				{
					"this"	: "?type",
					"has"	: "rdfs:label",
					"that"	: "?comment",
					optional: true
				}
			]
		});

		var model_facet = my.fact.Model( query_facet );
		var models_facet = model_facet.get( query_facet );
		console.log("Facet Model: %o %o found: %s", model_facet, models_facet, models_facet?models_facet.length:"empty" );

		// UX: Views

		var grid = my.UX.Widget({ "this": "urn:example:ux:grid", type: "urn:factcore:ux:Grid", label: "Grid", follow: "urn:example:model:child", collection: models_facet, selectable: true,
	 		factualizer: _default_factualizer
		 });

		var facetFilter = my.UX.Widget({ "this": "urn:example:ux:facetFilter", type: "urn:factcore:ux:FacetFilter", label: "Facets", collection: models_facet, selectable: true,
	 		factualizer: _default_factualizer
		 });

		var selector = my.UX.Widget({ "this": "urn:example:ux:selector", type: "urn:factcore:ux:List", label: "List", collection: models_facet, selectable: true,
	 		factualizer: _default_factualizer
		 });

		var layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:factcore:ux:Layout", label: "Layout", views: { "north": facetFilter, "center": grid, "east": selector }, el: $("#my_factcore") });

		// IQ: Logic
		selector.on("select", function(that) {
			grid.select(that);
		})

		facetFilter.on("search", function(that) {
			console.log("Facet Searched: ", this, that);
		})

		layout.show();
		models_facet.fetch();
	})
	my.start();
});
