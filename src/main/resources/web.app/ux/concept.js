$(document).ready(function() {

	var app_finder = "urn:example:app:hello";
	var my = factcore.boot({"this": app_finder });

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}

	my.on("booted", function() {
		var concept_finder = "urn:factcore:fact:finder:example:banking";
		var concept = "http://CAPSICUM.com/FIBO-DomainModel#Fund";

		var query_relations = my.fact.asq.register({
			"this": 	"urn:example:concept:model:relations:",
			"from":		concept_finder,
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
					"this"	: "?this",
					"has"	: "rdfs:range",
					"that"	: "?this_resource", optional: true
				},
				{
					"this"	: "?this_resource",
					"has"	: "rdfs:label",
					"that"	: "?resource", optional: true
				},
				{
					"this"	: "?this",
					"has"	: "owl:maxCardinality",
					"that"	: "?max", optional: true
				},
				{
					"this"	: "?this",
					"has"	: "owl:minCardinality",
					"that"	: "?min", optional: true
				},
				{
					"this"	: "?this",
					"has"	: "owl:inverseOf",
					"that"	: "?this_inverse", optional: true,
				}
			]
		});
		
		var model_relations = my.fact.Models( query_relations, { that: concept } );

		var view_concept = my.UX.Widget( { "this": "urn:example:concept:ux:concept:graph", type: "urn:factcore:ux:GraphCompass", label: "Concept Viewer", collection: model_relations,
			typeOf: "this_resource", viewOf: {
				"http://CAPSICUM.com/CAPSICUM-BV#RESOURCE": "west",
				"http://CAPSICUM.com/CAPSICUM-BV#CONDITION": "east"
			}
		 } )


		var workspace = my.UX.WorkSpace({ "this": "urn:example:app:hello", type: "urn:factcore:ux:WorkSpace", label: "My Concepts",
			views: {
				"center": view_concept,
			}
		});
		workspace.render();
		view_concept.on("select:node", function(that) {
			var focus = that.node.data.obj["this"];
			console.log("SELECTED:", this, that, view_concept.model);
			model_relations.fetch( { that: focus });
			view_concept.model.set("label", that.node.data.obj.label || "Unknown" );
		})

	})

	my.start();
	console.log("Started:", my );
});
