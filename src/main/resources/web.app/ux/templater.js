$(document).ready(function() {

	var application = "urn:factcore:application:factcore:";
	var models_finder = application+"finder:models";
	var emails_finder = application+"finder:emails";

	var my = factcore.boot({"this": application});

	my.on("booted", function() {

        var templateModel = new Backbone.Model({ test: "TEST", hello: "WORLD", template: "<div>This is a {{test}}. Hello {{hello}}</div>" });
		var templateEditor = my.UX.Widget({ "this": "urn:factcore:ux:templater", type: "urn:factcore:ux:HTML", label: "Template",
		    model: templateModel
		});
        console.debug("Templater: ", templateModel, templateEditor)

        var workspace1 = my.UX.WorkSpace({
            "this": "urn:factcore:ux:workspace:1", label: "Workspace One", el: $("#my_factcore"),
            views: { "center": templateEditor }
        });
        console.debug("Workspace #1: ", workspace1)

	})
	my.start();
});
