$(document).ready(function() {

	var application = "urn:snippets:application";
	var core_finder = "urn:snippets:fact:finder:core";
	var snippet_collection = "urn:snippets:example:c1";

	var my = factcore.boot({"this": application, core: { from: core_finder, reload: false } } );

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}
	var _default_factualizer = { "this": "urn:snippets:app:factualizer", trigger: "hover", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}}</span>" }) }

	my.on("booted", function() {

		var model_finder = application;

		var query_snippet =  my.fact.asq.register( {
			"this": 	"urn:snippets:model:concepts:", lazy: true,
			"from":		model_finder,
			"where": [
				{
					"this"	: "?that",
					"has"	: "ux:contains",
					"that"	: "?this",
				},
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "<urn:factcore:ux:Snippet>", // <http://www.w3.org/2000/01/rdf-schema#Class>" //
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:label",
					"that"	: "?label",
				},
				{
					"this"	: "?this",
					"has"	: "ux:renders",
					"that"	: "?this_template",
				},
				{
					"this"	: "?this_template",
					"has"	: "ux:body",
					"that"	: "?template",
				},
			]
		});

		var model_snippet = my.fact.Model( query_snippet );
		var models_snippet = model_snippet.get( query_snippet );

		console.log("Snippet Models: %o %o found: %s", model_snippet, models_snippet, models_snippet?models_snippet.length:"empty" );

		var grid = my.UX.Widget({ "this": "urn:snippets:ux:widgets", type: "urn:factcore:ux:Grid", label: "UX Widgets", collection: models_snippet, selectable: true, paging: false,
			columns: [
				{ name: "this", label:"#", editable: false, renderable: false, cell: "string" },
				{ name: "label", label:"Page", editable: false, cell: "string" },
				{ name: "this_template", label:"URI", editable: false, cell: "string" },
				{ name: "template", label:"Template", editable: false, cell: "string" },
			]
		 });

		var layout = my.UX.Widget({ "this": "urn:snippets:ux:layout", type: "urn:factcore:ux:Layout", label: "Layout",
			views: { "center": grid }, el: $("#my_factcore"),
		});

		layout.show();
		models_snippet.fetch({ "that": snippet_collection });


	})
	my.start();
});
