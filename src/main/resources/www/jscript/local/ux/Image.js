(function($, my) {

	// Concept Viewer - Layout
	my.scorpio4.UX.View["urn:scorpio4:ux:Image"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options, ["this", "label", "icon"]);

		var IconItem = Backbone.Marionette.ItemView.extend({
			template: "<img class='ux-image selectable' src='{{icon}}' about='{{this}}' title='{{label}}'/>",
			initialize: function() {
				my.scorpio4.UX.model(options, this);
			},
		});

		return IconItem;
	}

})(jQuery, window);
