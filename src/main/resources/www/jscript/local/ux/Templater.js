(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:Templater"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var DEBUG = true;

		var TemplateEditor = Backbone.Marionette.ItemView.extend({
			template: "<div about='{{this}}'>{{body}}</div>",
			className: "ux_templater",
			initialize: function() {
				my.scorpio4.UX.model(options,this);
				this.template = this.model.get("template") || options.template || this.template;
                console.debug("Init Templater: ", this.template );
			},
			onRender: function() {
                console.debug("Render Templater: ", this);
			}
		});
		return TemplateEditor;
	}

})(jQuery, window);
