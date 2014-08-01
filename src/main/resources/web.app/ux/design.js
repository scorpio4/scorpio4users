$(document).ready(function() {

	var application = "urn:example:app:hello";

	var my = factcore.boot({"this": application, core: { reload: false } } );

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}
	var _default_factualizer = { "this": "urn:example:app:factualizer", trigger: "hover", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}}</span>" }) }

	my.on("booted", function() {

		var model_finder = application;

		var query_design =  my.fact.asq.register( {
			"this": 	"urn:example:model:concepts:", lazy: false,
			"from":		model_finder,
			"where": [
				{
					"this"	: "?this",
					"has"	: "rdfs:subClassOf",
					"that"	: "<urn:factcore:ux:Widget>", // <http://www.w3.org/2000/01/rdf-schema#Class>" //
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:label",
					"that"	: "?label",
				},
				{
					"this"	: "?this",
					"has"	: "ux:template",
					"that"	: "?template_uri",
					optional: true
				},
				{
					"this"	: "?template_uri",
					"has"	: "ux:body",
					"that"	: "?template",
					optional: true
				},
			]
		});

		var model_design = my.fact.Model( query_design );
		var models_design = model_design.get( query_design );
		var models_designed = new Backbone.Collection();

		console.log("Facet Model: %o %o found: %s", model_design, models_design, models_design?models_design.length:"empty" );

		var design = my.UX.Widget({ "this": "urn:example:ux:design", type: "urn:factcore:ux:Design", label: "Designer", collection: models_designed, selectable: true,
	 		factualizer: _default_factualizer,
	 		droppable: { selector: ".ux_design", accept: ".ui-draggable" }
		 });

		var selector = my.UX.Widget({ "this": "urn:example:ux:selector", type: "urn:factcore:ux:List", label: "MenuButton", collection: models_design, selectable: true,
	 		factualizer: _default_factualizer, draggable: {
	 			x_view: Backbone.Marionette.ItemView.extend({template: "<div class='ux_sample ux_dragging'><label about='{{this}}'>Drag: {{label}}</label></div>"})
	 		}
		 });

		var grid = my.UX.Widget({ "this": "urn:example:ux:widgets", type: "urn:factcore:ux:Grid", label: "UX Widgets", collection: models_design, selectable: true, paging: false,
			columns: [
				{ name: "this", editable: false, renderable: false, cell: "string" },
				{ name: "label", editable: false, cell: "string" },
				{ name: "template_uri", editable: false, cell: "string" },
				{ name: "template", editable: false, cell: "string" },
			]
		 });

		var layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:factcore:ux:Layout", label: "Layout",
			views: { "west": selector, "center": design, "east": grid }, el: $("#my_factcore"),
		});

		design.on("select", function(that) {
console.log("Design Select: ", selector, selector2, that)
			selector.select(that);
		})

		selector.on("drag", function(that) {
			console.log("Dragging! ", this, that);
		})

		design.on("drop", function(that, event, ui) {
			var designedModel = { "this": my.fact.urn(that.id), "widget": that.id, label: that.get("label") };
			console.log("Dropped! ", designedModel, that, event, ui);
			models_designed.add(designedModel);

		})
		design.on("activate", function(that) {
			console.log("Facet Activated: ", this, that);
		})

		layout.show();
		models_design.fetch();

		models_designed.add({ "this": "urn:example:designed:buttons:1", "widget": "urn:factcore:ux:List", "label":"Buttons #1" });


	})
	my.start();
});
