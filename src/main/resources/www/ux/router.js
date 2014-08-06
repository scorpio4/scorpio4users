jQuery(function() {

	var router = new EventRouter({ "router:started": new Date() });

	router.on("some:event", function(model){
		console.log("some:event: %o -> %o", this, model);
	});

	router.on("other:event", function(model){
		console.log("other:event: %o -> %o", this, model);
	});

	router.on("another:event", function(model){
		console.log("another:event: %o -> %o", this, model);
	});

	router.on("hidden:event", function(model){
		console.log("hidden:event: %s -> %o", this["router:running"], model);
	}, { "router:running": new Date()});

	var route1 = { from: "other:event", to: "unknown:event"};
	console.log("ROUTE 1: %o", route1)
	router.plan(route1);
	router.trigger("some:event", { "hello": "World"});

	var route2 = {
		from: "some:event",
		to: {
			"other:event": {
				from: "other:event",
				then: "function(that) { that.triggered['other:event']=true; console.log('anotherZ:event'); }z"
			}
		}
	}
	console.log("ROUTE 2: %o", route2)
	router.plan(route2);
	router.trigger("other:event", { "hello": "Everyone"});

	var route3 = {
		from: "unknown:event",
		to: function(model) {
			console.log("TO DECIDE: %o -> %o", this, model);
			return model.hidden?"hidden:event":null;
		}
	}
	console.log("ROUTE 3: %o", route3)
	router.plan(route3);
	router.trigger("some:event", { "hidden": "World"});

	console.log("ROUTE 3.1")
	router.trigger("some:event", { "greetings": "Earthling"});
})
