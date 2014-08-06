$(document).ready(function() {

	var application = "urn:example:app:hello";
	var my = scorpio4.boot({"this": application});

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}
	var _default_factualizer = { "this": "urn:example:app:factualizer", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}}</span>" }) }

	my.on("booted", function() {
		console.log("Booted IQ:", this, my.core() );

		var model_finder = "urn:example:app:hello";

		var query_list =  my.fact.asq.register( {
			"this": 	"urn:example:model:classes:list:", lazy: true,
			"from":		model_finder,
			"where": [
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "<http://www.w3.org/2000/01/rdf-schema#Class>" //
				},
				{
					"this"	: "<urn:example:model:classes:list:this>",
					"has"	: "rdfs:label",
					"that"	: "<urn:example:model:classes:list:label>",
				}
			]
		});

		var model_list = my.fact.Model( query_list );
		var models_list = model_list.get( query_list );
		console.log("List Model: %o %o found: %s", model_list, models_list, models_list?models_list.length:"empty" );

		var ux_list = my.UX.Widget({ "this": "urn:example:ux:list", type: "urn:scorpio4:ux:List", label: "List", collection: models_list, selectable: true,
//	 		factualizer: _default_factualizer
		});

		var ux_dropzone = my.UX.Widget({ "this": "urn:example:ux:dropzone", type: "urn:scorpio4:ux:Dropzone", label: "Drop Zone" });

		var layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:scorpio4:ux:Layout", label: "Layout", views: { "center": ux_list, "north": ux_dropzone }, el: $("#my_scorpio4") });

		model_list.on("select", function(that) {
			console.log("SELECTED:", this, that)
		})

		layout.show();
		models_list.fetch();
		ux_dropzone.on("drop model", function(model){
			console.log("Dropped:", this, model);
		})
/*
		setInterval(function() {
			models_list.each(function(model) {
				var count = model.get("count") || 0;
				model.set( {"count": count+1} );
//				ux_list.render();
			})
		}, 5000)
*/
	})
	my.start();
});
