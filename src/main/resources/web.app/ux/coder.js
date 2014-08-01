$(document).ready(function() {

	var app_finder = "urn:example:app:hello";
	var my = factcore.boot({"this": app_finder });

	my.on("booted", function() {

		var codeblock = my.UX.Widget({ "this": "urn:example:codeblock", type: "urn:factcore:ux:CodeBlock", label: "My Code" });
		var workspace = my.UX.WorkSpace({ "this": "urn:example:app:hello", type: "urn:factcore:ux:WorkSpace", label: "My Concepts", el: $("#codeblock"), views: { center: codeblock } });

		workspace.show();

		console.log("Started:", my, workspace, codeblock );
	})

	my.start();
});
