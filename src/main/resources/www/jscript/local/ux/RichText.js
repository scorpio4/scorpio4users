(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:RichText"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var DEBUG = true;

		var RichText = Backbone.Marionette.ItemView.extend({
			template: "<div about='{{this}}'><label>{{label}}</label><div class='ux_content'>{{html}}</div></div>",
			className: "ux_rich_text",
			initialize: function() {
				my.scorpio4.UX.model(options,this);
			},
			onRender: function() {

			}
		});
		return RichText;
	}

})(jQuery, window);
