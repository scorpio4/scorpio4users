$(document).ready(function() {

	var application = "urn:example:app:hello";
	var my = factcore.boot({"this": application});

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}

	$(".dropdown").dropdown();


	my.on("booted", function() {
		console.log("Booted IQ: %o %o", Perspective, my.core() );

		var model_finder = "urn:example:app:hello";

		var query_navs =  my.fact.asq.register( {
			"this": 	"urn:example:model:navs:",
			"from":		model_finder,
			"where": [
				{
					"this"	: "<urn:example:model:navs:this>",
					"has"	: "a",
					"that"	: "<http://www.w3.org/2000/01/rdf-schema#Class>"
				},
				{
					"this"	: "<urn:example:model:navs:this>",
					"has"	: "rdfs:label",
					"that"	: "<urn:example:model:navs:label>",
				}
			],
			"follow": {
				"this": 	"urn:example:model:navs:has",
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

		var model_nav = my.fact.Model( query_navs );
		var models_nav_views = model_nav.get(query_navs);
		console.log("Button Model: %o %o found: %s", model_nav, models_nav_views, models_nav_views?models_nav_views.length:"empty" );

		var viewTree = my.UX.Widget({ "this": "urn:example:ux:button:menu", type: "urn:factcore:ux:ButtonBar", label: "Menu", selectable: true, follow: "urn:example:model:navs:has", collection: models_nav_views });
//		var workspace = my.UX.WorkSpace({ "this": "urn:example:ux:workspace", label: "Layout", autoRender: true, views: { "center": viewTree } });

$("#my_factcore").append( viewTree.render().el );

	})
	my.start();
});
