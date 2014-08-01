(function($, my) {

	// Concept Viewer - Layout
	my.factcore.UX.View["urn:factcore:ux:Image"] = function(options) {
		options = my.factcore.UX.checkOptions(options, ["this", "label", "icon"]);

		var IconItem = Backbone.Marionette.ItemView.extend({
			template: "<img class='ux-image selectable' src='{{icon}}' about='{{this}}' title='{{label}}'/>",
			initialize: function() {
				my.factcore.UX.model(options, this);
			},
		});

		return IconItem;
	}

})(jQuery, window);
