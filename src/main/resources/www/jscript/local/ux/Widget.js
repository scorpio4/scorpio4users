(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:demo:Widget"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var DEBUG = my.scorpio4.UX.DEBUG && true; // master DEBUG kill-switch

		var Widget = Backbone.Marionette.ItemView.extend({
			template: "<label about='{{this}}'>{{label}}</label>"
			className: "ux_widget",
			initialize: function() {
				my.scorpio4.UX.model(options, this);
			},
			override_render: function() {
				var rendered = Marionette.ItemView.prototype.render.apply(this, {} );
				my.scorpio4.DEBUG && console.log("Rendered Widget: %o %o -> %o", this, this.$el rendered);
				this.$el = rendered;
				return this;
			}


		});
		return Widget;
	}

})(jQuery, window);

