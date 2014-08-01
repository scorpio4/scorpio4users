$(document).ready(function() {

	var application = "urn:example:app:hello";
	var my = factcore.boot({"this": application});

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}
	var _default_factualizer = { "this": "urn:example:app:factualizer", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}}</span>" }) }

	my.on("booted", function() {

		var model_finder = "urn:example:app:hello";

		var query_tree =  my.fact.asq.register( {
			"this": 	"urn:example:model:concepts:", lazy: true,
			"from":		model_finder,
			"where": [
				{
					"this"	: "<urn:example:model:concepts:this>",
					"has"	: "a",
					"that"	: "<urn:factcore:fact:Field>", // <http://www.w3.org/2000/01/rdf-schema#Class>" //
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

		var model_tree = my.fact.Model( query_tree );
		var models_tree = model_tree.get( query_tree );
		console.log("Tree Model: %o %o found: %s", model_tree, models_tree, models_tree?models_tree.length:"empty" );

		var tree = my.UX.Widget({ "this": "urn:example:ux:tree", type: "urn:factcore:ux:Tree", label: "Tree", follow: "urn:example:model:child", collection: models_tree, selectable: true,
	 		factualizer: _default_factualizer
		 });
		var layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:factcore:ux:Layout", label: "Layout", views: { "center": tree }, el: $("#my_tree") });

		model_tree.on("select", function(that) {
			console.log("SELECTED:", this, that)
		})

		layout.render();
		models_tree.fetch();
	})
	my.start();
});
