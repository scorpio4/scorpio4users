$(document).ready(function() {

	var application = "urn:example:app:hello";
	var my = scorpio4.boot({"this": application, core: { reload: false } } );

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

		var editor = my.UX.Widget({ "this": "urn:example:ux:html", type: "urn:scorpio4:ux:HTML", label: "Edit Me", selectable: false,
	 		factualizer: _default_factualizer, editable: true, editing: true,
	 	});

		var selector = my.UX.Widget({ "this": "urn:example:ux:selector", type: "urn:scorpio4:ux:List", label: "List", collection: models_facet, selectable: true,
	 		factualizer: _default_factualizer
		 });

		var layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:scorpio4:ux:Layout", label: "Layout", views: { "west": selector, "center": editor }, el: $("#my_scorpio4") });


		selector.on("select", function(that) {
			editor.select(that);
		})
		editor.on("toolbar", function(method, self, dom, ui, event) {
			console.log("TOOLBAR: ", method, self, dom, ui, event);
		})

		layout.show();

		models_facet.fetch();
	})
	my.start();
});
