jsPlumbToolkit.ready(function() {

	var application = "urn:example:app:hello", my = factcore.boot({"this": application});

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}

	my.on("booted", function(bootstrap) {
		console.log("Booted: %o %o", this, bootstrap);

		var $root = $("#demo");

		var log = function(node) {
			console.log("Log node: %o", node);
			$("#log")[0].innerHTML = "<pre>" + (syntaxHighlight(JSON.stringify(node.data.obj ,undefined, 4))) + "</pre>";
		},
		render = function(rootId) {
			return window.renderer = toolkit.render({
				container: $root,
				templateRenderer:function(templateId, data) {
					var html = $(Mustache.to_html(templateId, data)).get();
					console.log("Template: %o %o %o", templateId, data, html);
					return html;
				},
				palette:{
					nodes:{
						"default":{
							template: "<div>{{label}}</div>",
							events:{
								click:function(params) {
									console.log("click: %o", params)
									refocus(params.node.id);
								}
							}
						}
					},
					edges:{
						"default":{
							overlays:[
								["Label", { label: "{{label}}" }]
							]
						}
					}
				},
				//draggable:false,
				layout:{
					type:"Hierarchical",
					padding:[50, 80],
					root:rootId
				},
				jsPlumb:{
					Endpoint:"Blank",
					Anchor:"Center",
					Connector:"Straight",
					PaintStyle:{
						lineWidth:2,
						strokeStyle:"#456"
					}
				}
			});
		},
		query_nodes = {
			"this": 	"urn:factcore:ux:query:model:nodes#",
			from: my["this"],
			"where": [
				{
					"this"	: "?that",
					"has"	: "?has",
					"that"	: "?this"
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
				}
			],
		},
		query_node_edges = {
			"this": 	"urn:factcore:ux:query:model:edges#",
			from: my["this"],
			"where": [
				{
					"this"	: "<urn:factcore:ux:query:model:edges#this>",
					"has"	: "rdfs:label",
					"that"	: "?label"
				},
				{
					"this"	: "<urn:factcore:ux:query:model:edges#this>",
					"has"	: "rdfs:comment",
					"that"	: "?comment", optional: true
				}
			],
		},

		refocus = function(focusURI) {
			$root.empty();
			$(".tooltip").remove();
			$root.addClass("loading");
			setTimeout(function() {
				var toolkit = window.toolkit = jsPlumbToolkit.newInstance();
				var models = my.fact.Models( query_nodes, { that: focusURI } );
				console.log("Found models: %o -> (%s models) %o", focusURI, models.length, models);
				var things = {};
				models.each( function(model) {
					console.log("Model", model, model.toJSON())
					var id = model.get("this");
					things[id] = true;
					var node = {id: id, obj: model.toJSON(), label: model.get("label"), text: model.get("comment") || model.get("label"), clazz: "resource" }
					console.log("adding: %o", node);
					toolkit.addNode( node );
				})
				console.log("Modelled graph: %o -> %o", toolkit, focusURI);
				render(focusURI);
				console.log("Rendered");
//				renderer.zoomToFit();

			}, 0);
		}

		refocus(application);
	});

	my.start();
	console.log("Started: %o %o", my, my.core() );

});
