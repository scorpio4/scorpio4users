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

		var ViewFinder = Backbone.Marionette.ItemView.extend( {
			className: "ux_finder step",
			template: "<div class='slide' about='{{this}}' title='{{comment}}'><h1>{{label}}</h2><h3>{{comment}}</h3></div>"
		} );

		var facet = my.UX.Widget({ "this": "urn:example:ux:facet", type: "urn:factcore:ux:Dashboard3D", label: "Facets", follow: "urn:example:model:child", collection: models_facet, selectable: true,
	 		factualizer: _default_factualizer,
	 		viewable: {
	 			"urn:factcore:fact:Finder": ViewFinder
	 		}
		 });

		var selector = my.UX.Widget({ "this": "urn:example:ux:selector", type: "urn:factcore:ux:MenuButton", label: "MenuButton", collection: models_facet, selectable: true,
	 		factualizer: _default_factualizer
		 });

		var selector2 = my.UX.Widget({ "this": "urn:example:ux:selector2", type: "urn:factcore:ux:List", label: "List", collection: models_facet, selectable: true,
	 		factualizer: _default_factualizer
		 });

		var layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:factcore:ux:Layout", label: "Layout", views: { "west": selector, "center": facet, "east": selector2 }, el: $("#my_facet") });


		facet.on("select", function(that) {
console.log("Facet Select: ", selector, selector2, that)
			selector.select(that);
			selector2.select(that);
		})
		selector.on("select", function(that) {
			facet.select(that);
			selector2.select(that);
		})

		selector2.on("select", function(that) {
			facet.select(that);
			selector.select(that);
		})

		facet.on("activate", function(that) {
			console.log("Facet Activated: ", this, that);
		})

		layout.show();
		models_facet.fetch();
	})
	my.start();
});
