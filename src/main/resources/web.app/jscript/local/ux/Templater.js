(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:Templater"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var DEBUG = true;

		var TemplateEditor = Backbone.Marionette.ItemView.extend({
			template: "<div about='{{this}}'>{{body}}</div>",
			className: "ux_templater",
			initialize: function() {
				my.factcore.UX.model(options,this);
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
