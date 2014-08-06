$(document).ready(function() {

	var application = "urn:snippets:application";
	var core_finder = "urn:snippets:fact:finder:core";
	var snippet_collection = "urn:snippets:example:c1";

	var my = scorpio4.boot({"this": application, core: { from: core_finder, reload: false } } );

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}
	var _default_factualizer = { "this": "urn:snippets:app:factualizer", trigger: "hover", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}}</span>" }) }

	my.on("booted", function() {

		var model_finder = application;

		var query_pages =  my.fact.asq.register( {
			"this": 	"urn:snippets:model:pages:", lazy: true,
			"from":		model_finder,
			"where": [
				{
					"this"	: "?that",
					"has"	: "a",
					"that"	: "<urn:scorpio4:ux:Container>",
				},
				{
					"this"	: "?that",
					"has"	: "ux:contains",
					"that"	: "?this",
				},
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "<urn:scorpio4:ux:Snippet>", // <http://www.w3.org/2000/01/rdf-schema#Class>" //
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

		var query_library =  my.fact.asq.register( {
			"this": 	"urn:snippets:model:library:", lazy: false,
			"from":		model_finder,
			"where": [
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "<urn:scorpio4:ux:Widget>",
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

		var model_pages = my.fact.Model( query_pages );
		var models_pages = model_pages.get( query_pages );

		var model_library = my.fact.Model( query_library );
		var models_library = model_library.get( query_library );

		console.debug("[Snippet] %s Pages: %o %o found: %s", query_pages, model_pages, models_pages, models_pages?models_pages.length:"empty" );
		console.debug("[Snippet] %s Library: %o %o found: %s", query_library, model_library, models_library, models_library?models_library.length:"empty" );

		var pages = my.UX.Widget({ "this": "urn:snippets:ux:pages", type: "urn:scorpio4:ux:List", label: "Table of Contents", collection: models_pages, selectable: true });

		var library = my.UX.Widget({ "this": "urn:snippets:ux:library", type: "urn:scorpio4:ux:List", label: "Library", collection: models_library, selectable: true });

		var document = my.UX.Widget({ "this": "urn:snippets:ux:document", type: "urn:scorpio4:ux:snippet:Document", label: "Document", collection: models_pages, selectable: true });

		var layout = my.UX.Widget({ "this": "urn:snippets:ux:layout", type: "urn:scorpio4:ux:Layout", label: "Layout",
			views: { "west": pages, "center": document, "east": library }, el: $("#my_scorpio4"),
		});

		models_library.on("drag", function(that) {
			console.log("Dragging! ", this, that);
		})

		document.on("drop", function(that, event, ui) {
			var documentModel = { "this": my.fact.urn(that.id), "widget": that.id, label: that.get("label"), template: that.get("template") };
			console.log("Dropped! ", documentModel, that, event, ui);
			models_pages.add(documentModel);

		})
		document.on("activate", function(that) {
			console.log("Facet Activated: ", this, that);
		})

		layout.show();
		models_pages.fetch({ "that": snippet_collection });

	})
	my.start();
});
