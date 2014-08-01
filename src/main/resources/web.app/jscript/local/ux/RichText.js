(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:RichText"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var DEBUG = true;

		var RichText = Backbone.Marionette.ItemView.extend({
			template: "<div about='{{this}}'><label>{{label}}</label><div class='ux_content'>{{html}}</div></div>",
			className: "ux_rich_text",
			initialize: function() {
				my.factcore.UX.model(options,this);
			},
			onRender: function() {

			}
		});
		return RichText;
	}

})(jQuery, window);
