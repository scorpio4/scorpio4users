$(document).ready(function() {

	var application = "urn:factcore:application:factcore:";
	var models_finder = application+"finder:models";
	var my = factcore.boot({"this": application});

	var _default_factualizer = { "this": "urn:example:app:factualizer", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}}</span>" }) }

	my.on("booted", function() {

		var query_asqs =  my.fact.asq.register( {
			"this": 	"urn:example:model:classes:asq:", lazy: true,
			"from":		models_finder, finderType: "Core",
			"where": [
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "asq:Query"
				},
				{
					"this"	: "<urn:example:model:classes:asq:this>",
					"has"	: "rdfs:label",
					"that"	: "<urn:example:model:classes:asq:label>",
				}
			]
		});
		var model_asq = my.fact.Model( query_asqs );
		var models_asqs = model_asq.get(query_asqs);
		console.log("ASQ Queries: ", models_asqs)

		var query_list =  my.fact.asq.register( {
			"this": 	"urn:example:model:classes:list:",
			"from":		models_finder, finderType: "Core",
			"where": [
				{
					"this"	: "<urn:factcore:ux:exampleView1>",
					"has"	: "a",
					"that"	: "?this"
				},
				{
					"this"	: "<urn:example:model:classes:list:this>",
					"has"	: "rdfs:label",
					"that"	: "<urn:example:model:classes:list:label>",
				}
			],
			"follow" : {
				"this": 	"urn:example:model:classes:range:",
				"where": [
					{
						"this"	: "?this",
						"has"	: "rdfs:domain",
						"that"	: "?that"
					}
				]
			}
		});

		var query_ranges =  my.fact.asq.register( {
			"this": 	"urn:example:model:classes:ranges:", lazy: true,
			"from":		models_finder, finderType: "Core",
			"where": [
				{
					"this"	: "?this",
					"has"	: "rdfs:domain",
					"that"	: "?that"
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:label",
					"that"	: "?label"
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:comment",
					"that"	: "?comment", optional: true
				},
				{
					"this"	: "?that",
					"has"	: "rdfs:label",
					"that"	: "?domain_label"
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:range",
					"that"	: "?range"
				},
				{
					"this"	: "?range",
					"has"	: "rdfs:label",
					"that"	: "?range_label"
				}
			]
		});

		var model_ranges = my.fact.Model( query_ranges );
		var models_ranges = model_ranges.get(query_ranges);
//		models_ranges.fetch( { "that": "urn:factcore:ux:View"} );
//		console.debug("ASQ Range Model:", models_ranges );

		var model_list = my.fact.Model( query_list );
		var models_list = model_list.get( query_list );


		var model_asq = new Backbone.Model();
		model_asq.set("label", "ASQ test:");
		model_asq.set("urn:factcore:asq:query", my.fact.asq[query_ranges] );

		console.debug("ASQ Model: ", model_asq );


		var ux_list = my.UX.Widget({ "this": "urn:example:ux:list", type: "urn:factcore:ux:List", label: "List", collection: models_list, selectable: true,
	 		factualizer: _default_factualizer, follow: "urn:example:model:classes:range:"
		});

		var ux_asq = my.UX.Widget({ "this": "urn:example:ux:asq", type: "urn:factcore:ux:ASQ", label: "ASQ", model: model_asq, collection: models_ranges });

		var layout = my.UX.Widget({ "this": "urn:example:ux:layout", type: "urn:factcore:ux:Layout", label: "Layout", views: { "west": ux_list, "east": ux_asq }, el: $("#my_factcore") });

		layout.show();
		models_list.fetch();
		console.debug("List Model: %o %o found: %s", model_list, models_list, models_list?models_list.length:"empty" );

	})
	my.start();
});
