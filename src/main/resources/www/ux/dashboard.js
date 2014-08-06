$(document).ready(function() {

	var application = "urn:example:app:hello";
	var my = scorpio4.boot({"this": application});

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}
	var _default_factualizer = { "this": "urn:example:app:factualizer", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}}</span>" }) }

	my.on("booted", function() {

		var model_finder = "urn:example:app:hello";

		var query_dashboard =  my.fact.asq.register( {
			"this": 	"urn:example:model:concepts:", lazy: true,
			"from":		model_finder,
			"where": [
				{
					"this"	: "<urn:example:model:concepts:this>",
					"has"	: "a",
					"that"	: "<http://www.w3.org/2000/01/rdf-schema#Class>"
				},
				{
					"this"	: "<urn:example:model:concepts:this>",
					"has"	: "rdfs:label",
					"that"	: "<urn:example:model:concepts:label>",
				}
			],
			"follow": {
				"this": 	"urn:example:model:child",
				"where": [
					{
						"this"	: "?this",
						"has"	: "a",
						"that"	: "?that",
					},
					{
						"this"	: "?this",
						"has"	: "rdfs:label",
						"that"	: "?label",
					}
				]
			}
		});

		var model_dashboard = my.fact.Model( query_dashboard );
		var models_dashboard = model_dashboard.get( query_dashboard );
		console.log("Tree Model: %o %o found: %s", model_dashboard, models_dashboard, models_dashboard?models_dashboard.length:"empty" );

//		var ux_grid = my.UX.Widget({ "this": "urn:example:ux:dashboard:grid", type: "urn:scorpio4:ux:Grid", label: "Grid"});
/*
		var ux_dashboard = my.UX.Widget({ "this": "urn:example:ux:dashboard:form", type: "urn:scorpio4:ux:Widget", label: "Widget",
			follow: "urn:example:model:child", collection: models_dashboard, selectable: true,
	 		factualizer: _default_factualizer, gizmo: {
	 			view: ux_gizmo
	 		}
		 });
*/
		var ux_dashboard = my.UX.Widget({ "this": "urn:example:ux:dashboard", type: "urn:scorpio4:ux:Dashboard", label: "Dashboard", collection: models_dashboard, selectable: true,
	 		factualizer: _default_factualizer, gizmo: {
	 			view: "urn:scorpio4:ux:Widget", follow: "urn:example:model:child"
	 		}
		 });
		var ux_layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:scorpio4:ux:Layout", label: "Layout", views: { "center": ux_dashboard }, el: $("#my_dashboard") });

		model_dashboard.on("select", function(that) {
			console.log("SELECTED:", this, that)
		})

		ux_layout.render();
		models_dashboard.fetch();
	})
	my.start();
});
