$(document).ready(function() {

	var application = "urn:scorpio4:application:factbox:";
	var model_finder = application+"fact:finder:model";
//
	var my = scorpio4.boot({"this": application, core: { reload: false } } );



	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}
	var _default_factualizer = { "this": "urn:scorpio4:application:factbox:factualizer", trigger: "hover", selector: "[about]", view: Marionette.ItemView.extend({ template: "<span>About: {{label}} - {{comment}}</span>" }) }

	my.on("booted", function() {
		var self = this;
console.debug("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ")
console.debug("Booted IQ: %o %o", scorpio4, my.core() );

        // Declare the ASQ queries that describe our models

		var query_grid_columns =  my.fact.asq.register( {
			"this":	"urn:scorpio4:application:factbox:model:concepts:columns:", lazy: false,
			"from":	model_finder, localize: true, finderType: "Remote",
			"where": [
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "skos:Concept"
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:label",
					"that"	: "?label",
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:comment",
					"that"	: "?comment",
					optional: true
				}
			]
		});

		var query_list_views =  my.fact.asq.register( {
			"this":	"urn:scorpio4:application:factbox:model:concepts:views:", lazy: false,
			"from":		model_finder, localize: true, finderType: "Remote",
			"where": [
				{
					"this"	: "?this",
					"has"	: "a",
					"that"	: "ux:Renderer"
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:label",
					"that"	: "?label",
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:comment",
					"that"	: "?comment",
					optional: true
				},
			]
		});

		var query_grid =  my.fact.asq.register( {
			"this":	"urn:scorpio4:application:factbox:model:concepts:", lazy: false,
			"from":		model_finder, localize: false, finderType: "Remote",
			"where": [
				{
					"this"	: "?this",
					"has"	: "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>",
					"that"	: "<http://www.w3.org/2000/01/rdf-schema#Class>"
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:label",
					"that"	: "?label",
				},
				{
					"this"	: "?this",
					"has"	: "rdfs:comment",
					"that"	: "?comment",
					optional: true
				}
			],
			"xfollow": {
				"this":	"urn:scorpio4:application:factbox:model:concepts:child",
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

        console.debug("Instantiate the Models");

		var model_grid = my.fact.Model( query_grid );
		var models_grid = model_grid.get( query_grid );

		var model_grid_columns = my.fact.Model( query_grid_columns );
		var model_list_view = my.fact.Model( query_list_views );

		console.debug("Grid %s Model: %o %o found: %s", query_grid, model_grid, models_grid, models_grid?models_grid.length:"empty" );

		var models_grid_columns = model_grid_columns.get( query_grid_columns );
		console.debug("Grid %s Column Model: %o %o found: %s", query_grid_columns, model_grid_columns, models_grid_columns, models_grid_columns?models_grid_columns.length:"missing" );

		var models_list_views = model_list_view.get( query_list_views );
		console.debug("Views %s: %o %o found: %s", query_list_views, model_list_view, models_list_views );
/**
		var grid_cols = new my.fact.factory.FactModels([
			{ "this": "this", "label": "#", visible: false, editable: false },
			{ "this": "label", "label": "Label", editable: true },
			{ "this": "date", "label": "Date", editable: true, type: "http://www.w3.org/2001/XMLSchema#date" },
		])
**/

		var toolbar_menu = new my.fact.factory.FactModels([
			{ "this": "urn:scorpio4:application:factbox:ux:toolbar#create", label: "Create", comment: "Create entry", icon: "plus"},
			{ "this": "urn:scorpio4:application:factbox:ux:toolbar#delete", label: "Delete", comment: "Delete entry", icon: "minus"},
			{ "this": "urn:scorpio4:application:factbox:ux:toolbar#edit", label: "Edit", comment: "Edit entry", icon: "edit"}
		]);

        // Instantiate the UI

		var grid = my.UX.Widget({ "this": "urn:scorpio4:application:factbox:ux:grid", type: "urn:scorpio4:ux:Grid", label: "My Fact Sheet", collection: models_grid,
		    selectable: false, paging: false,
			factualizer: _default_factualizer,
			meta: models_grid_columns
		});

		var toolbar = my.UX.Widget({ "this": "urn:scorpio4:application:factbox:ux:toolbar", type: "urn:scorpio4:ux:Toolbar", label: "Toolbar", collection: toolbar_menu });

		var filter = my.UX.Widget({ "this": "urn:scorpio4:application:factbox:ux:filter", type: "urn:scorpio4:ux:FacetFilter", label: "Filter", meta: models_grid_columns })

		var list = my.UX.Widget({ "this": "urn:scorpio4:application:factbox:ux:list", type: "urn:scorpio4:ux:Tree", label: "List", collection: models_grid_columns,
		    selectable: true,
		    factualizer: _default_factualizer, follow: "urn:scorpio4:application:factbox:model:concepts:child"
		});

		var form = my.UX.Panel({ "this": "urn:scorpio4:application:factbox:ux:form", type: "urn:scorpio4:ux:Form", label: "My Form",
		    selectable: false,
			factualizer: _default_factualizer, meta: models_grid_columns,
		    dialog: false, modal: false
		});

		var navbar = my.UX.Widget({ "this": "urn:scorpio4:application:factbox:ux:navbar", type: "urn:scorpio4:ux:NavBar", label: "Demo", collection: models_grid,
		    selectable: false,
			factualizer: _default_factualizer,
			el: $("#my_navbar")
		}).render();

        // root widget

		var layout = my.UX.Widget({ "this": "urn:scorpio4:application:factbox:ux:layout", type: "urn:scorpio4:ux:Layout", label: "Layout", el: $("#my_scorpio4"),
		    views: { "north": toolbar, "west": list, "center": grid, "east": filter }
		});

		var listViews = my.UX.Panel({ "this": "urn:scorpio4:application:factbox:ux:views", type: "urn:scorpio4:ux:List", label: "List of views", collection: models_list_views, dialog: true });
        listViews.show();

        // Handle the events

		grid.on("select", function(that) {
			list.select(that);
		})
		form.on("close", function() {
			form.hide();
			form.$el.remove();
		})

        navbar.on("all", function(that) {
//            console.log("NavBar: ", that);
        })

		toolbar.on("create", function(that,event) {
			var that_urn = my.fact.urn("urn:example");
			models_grid_columns.add( { "this": that_urn , "label": "Woot: "+that_urn } );
console.debug("CREATED: ", models_grid_columns, form, form.widget, event);

			form.widget.model = models_grid_columns.get(that_urn);
			form.position(event)
			form.show();
		})
		toolbar.on("delete", function(that, event) {
			if (list.selection) {
				list.selection.each(function(item) {
					list.collection.remove(item);
				})
				form.hide();
			}
		})
		toolbar.on("edit", function(that, event) {
			if (list.selection) {
console.debug("LIST EDIT", that, event, list.selection);
				list.selection.each(function(item) {
					form.widget.model = item;
					form.position(event);
				})
			 }
		})

		list.on("select", function(that, event) {
console.debug("LIST SELECT", that, event);
			form.widget.model = that;
			if (form.is_hidden==false) form.position(event);
		})

		layout.show();
		models_grid.fetch();
	})
	my.start();
});
