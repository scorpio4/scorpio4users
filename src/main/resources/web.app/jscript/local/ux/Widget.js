(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:demo:Widget"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var DEBUG = my.factcore.UX.DEBUG && true; // master DEBUG kill-switch

		var Widget = Backbone.Marionette.ItemView.extend({
			template: "<label about='{{this}}'>{{label}}</label>"
			className: "ux_widget",
			initialize: function() {
				my.factcore.UX.model(options, this);
			},
			override_render: function() {
				var rendered = Marionette.ItemView.prototype.render.apply(this, {} );
				my.factcore.DEBUG && console.log("Rendered Widget: %o %o -> %o", this, this.$el rendered);
				this.$el = rendered;
				return this;
			}


		});
		return Widget;
	}

})(jQuery, window);

