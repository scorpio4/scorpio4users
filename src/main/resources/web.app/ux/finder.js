$(document).ready(function() {

	var application = "urn:factcore:application:factcore:";
	var models_finder = application+"finder:models";
	var emails_finder = application+"finder:emails";

	var my = factcore.boot({"this": application});

	Backbone.Marionette.Renderer.render = function(template, data){
		return Mustache.to_html(template, data);
	}

	my.on("booted", function() {

		var asq_apps = {
			"this": 	application+"facts:models",
			"from":		models_finder, finderType: "Remote",
			"where": [
				{
					"this"	: "<urn:factcore:model:apps#this>",
					"has"	: "a",
					"that"	: "fact:Model"
				},
				{
					"this"	: "<urn:factcore:model:apps#this>",
					"has"	: "rdfs:label",
					"that"	: "?label"
				}
			]
		}

		var apps_model = my.fact.Model( asq_apps );
		var apps_models = apps_model.get(asq_apps.this);
        console.log("[Found] Model: ", apps_model, apps_models );

		var myQueries = my.UX.Widget({ "this": "urn:factcore:ux:list:models", type: "urn:factcore:ux:List", label: "Queries", collection: apps_models, selectable: true });

		var myResults = my.UX.Widget({ "this": "urn:factcore:ux:grid:instances", type: "urn:factcore:ux:List", label: "Instances", collection: new Backbone.Collection(), selectable: true,
		    meta: [
                { "this": "this", "label": "#", visible: false, editable: false },
                { "this": "label", "label": "Label", editable: false },
            ]
		 });

		var layout = my.UX.Widget({ "this": "urn:factcore:ux:layout", type: "urn:factcore:ux:Layout", label: "Layout", el: $("#my_factcore"),
		    views: { "west": myQueries, "center": myResults }
		});

        myQueries.on("select", function(selected) {
            console.log("Query Selected: ", selected);
            var modelURI = selected.get("this");
            var query = { "this": modelURI, from: emails_finder, finderType: "Remote" };
            var apps_model = my.fact.Model( query );
            var apps_models = apps_model.get(query.this);
            apps_models.on("fetch", function(fetched) {
                console.log("Fetched: ", this, fetched);
                myResults.collection.reset(apps_models.toJSON(), {});
            })
        })
        layout.show();
	})
	my.start();
});
