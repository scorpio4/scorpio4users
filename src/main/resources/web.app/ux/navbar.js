$(document).ready(function() {

	var application = "urn:example:app:hello";
	var my = factcore.boot({"this": application});

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}

	$(".dropdown").dropdown();


	my.on("booted", function() {

		var model_finder = "urn:example:app:hello";

		var query_navs =  my.fact.asq.register( {
			"this": 	"urn:example:model:navs:",
			"from":		model_finder,
			"where": [
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "<urn:factcore:ux:View>",
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:label",
					"that"	: "?label",
				}
			],
			"follow": {
				"this": 	"urn:example:model:navs:views",
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
		console.log("NavBar Model: %o %o found: %s", model_nav, models_nav_views, models_nav_views?models_nav_views.length:"empty" );

		var viewTree = my.UX.Widget({ "this": "urn:example:ux:navbar:view:tree", type: "urn:factcore:ux:Tree", label: "View", selectable: true, collection: models_nav_views });

		var navbar = my.UX.Widget({ "this": "urn:example:ux:navbar", type: "urn:factcore:ux:NavBar", label: "NavBar", selectable: true,
			menus: [
				{
					"this": "urn:example:ux:navbar:home",
					label: "Home",
				},
				{
					"this": "urn:example:ux:navbar:classes",
					label: "Views",
					follow: "urn:example:model:navs:views",
					menus: models_nav_views,
				}
			]
		});

		var layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:factcore:ux:WorkSpace", label: "Layout", autoRender: true, views: { "center": navbar }, el: $("#my_navbar") });
	})
	my.start();
});
