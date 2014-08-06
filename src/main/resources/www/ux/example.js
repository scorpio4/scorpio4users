$(document).ready(function() {

	var my = scorpio4.boot({"this": "urn:example:app:hello"});

	my.on("booted", function() {

		var query1 = {
			"this": 	"urn:scorpio4:ux:query:model:Example#",
			"where": [
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "a",
					"that"	: "<urn:scorpio4:ux:View>"
				},
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "rdfs:label",
					"that"	: "?label"
				},
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "rdfs:comment",
					"that"	: "?comment", optional: true
				}
			],
			"follow": {
				"has"	: "<urn:scorpio4:ux:contains>",
				"where": [
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "rdfs:label",
					"that"	: "?label"
				},
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "rdfs:comment",
					"that"	: "?comment", optional: true
				}],
			}
		}

		var query2 = {
			"this": 	"urn:scorpio4:ux:query:model:Example#",
			"where": [
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "rdfs:label",
					"that"	: "?label"
				},
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "rdfs:comment",
					"that"	: "?comment", optional: true
				}
			],
			"follow": {
				"has"	: "<http://www.w3.org/2000/01/rdf-schema#subClassOf>",
				"where": [
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "rdfs:label",
					"that"	: "?label"
				},
				{
					"this"	: "<urn:scorpio4:ux:query:model:Example#this>",
					"has"	: "rdfs:comment",
					"that"	: "?comment", optional: true
				}],
			}
		}

		var about_query1 = new RDFQueryBuilder().describe(query1, my.core());
		console.log("About Query 1: %o", about_query1);

		var model = my.fact.core.find( query1 );
		console.log("Found Module: %o -> %o", model, model.records);

		console.log("Finding Tree: %o", query2);
		var treeModel = my.fact.core.tree( query2);
		console.log("Found Tree: %o %o", treeModel, treeModel.toJSON());

		var $el = $('<div>Grid goes here</div>').height(400).appendTo(".ux_body");
		// el: $el
		var grid = new recline.View.SlickGrid({ model: model, state: {fitColumns: true, gridOptions: {multiSelect: false}} });
		grid.on("select", function(selection) {
			console.log("On Selection: %o", selection);
		})
		grid.on("deselect", function(selection) {
			console.log("On De-selection: %o", selection);
		})
//		grid.visible = true;
//		grid.render();

		Backbone.Marionette.Renderer.render = function(template, data){
			return Mustache.to_html(template, data);
		}

		my.UX["urn:scorpio4:ux:TreeView"] = Backbone.Marionette.CompositeView.extend({
			initialize: function(){
				this.collection = this.model.nodes;
			},
			appendHtml: function(cv,iv) {
				cv.$("ul:first").append(iv.el);
			},
			onRender: function() {
//				if(_.isUndefined(this.collection)){
//					this.$("ul:first").remove();
//				}
				$(".ux_treenode", $(this.$el)).popover({trigger: "hover", content: function(x) {
					console.log("Popover: %o %o", this, x);
				}});
			},
			tagName: "li",
			template: "<a href='#' class='ux_treenode' about='{{this}}' title='{{comment}}'>{{label}}</a><ul></ul>"
		});
		my.UX["urn:scorpio4:ux:Tree"] = Backbone.Marionette.CompositeView.extend({
			itemView: my.UX["urn:scorpio4:ux:TreeView"], template: "<ul class='node'></ul>",
			events: {
			  'click .ux_treenode': 'onSelect'
			},
			onSelect: function(event) {
				var self = this;
				event.stopImmediatePropagation();
				var focus = $(event.currentTarget).attr("resource");
				if (focus) {
					var model = this.collection.get(focus);
					if (model) {
						if (self.selection) self.trigger("deselect", self.selection);
						self.selection = new Backbone.Collection();
						self.selection.add(model);
						this.trigger("select", self.selection );
					}
				}
			},
			onRender: function () {
				console.log("onRender: %o %o %o", this, this.$el, this.model);
//				$("ul:first",this.$el).dcVerticalMegaMenu();
				return this;
			},
		});

		var treeView = new my.UX["urn:scorpio4:ux:Tree"]( { collection: treeModel });
//		treeView.render();
		treeView.on("select", function(focus) {
			console.log("Selected: %o %o", this, focus);
		})

		var workspace = my.UX["urn:scorpio4:ux:WorkSpace"]({
			"this": "urn:example:app:hello", "label": "My WorkSpace",
			"models": [],
			"views": { "center": grid, "west": treeView }
		});
		console.log("Workspace: %o", workspace);
//		workspace.addView("center", grid);
//		workspace.addView("west", treeView);

	})

	my.start();
	console.log("Started: %o %o", Perspective, my.core() );
});
