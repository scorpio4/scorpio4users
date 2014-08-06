$(document).ready(function() {

	var application = "urn:scorpio4:application:scorpio4:";
	var models_finder = application+"finder:models";
	var emails_finder = application+"finder:emails";

	var my = scorpio4.boot({"this": application});

	my.on("booted", function() {

        var templateModel = new Backbone.Model({ test: "TEST", hello: "WORLD", template: "<div>This is a {{test}}. Hello {{hello}}</div>" });
		var templateEditor = my.UX.Widget({ "this": "urn:scorpio4:ux:templater", type: "urn:scorpio4:ux:HTML", label: "Template",
		    model: templateModel
		});
        console.debug("Templater: ", templateModel, templateEditor)

        var workspace1 = my.UX.WorkSpace({
            "this": "urn:scorpio4:ux:workspace:1", label: "Workspace One", el: $("#my_scorpio4"),
            views: { "center": templateEditor }
        });
        console.debug("Workspace #1: ", workspace1)

	})
	my.start();
});
