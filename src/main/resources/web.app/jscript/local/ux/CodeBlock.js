(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:CodeBlock"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var DEBUG = true;

		var CodeBlock = Backbone.Marionette.ItemView.extend({
			template: "<label about='{{this}}'>{{label}}</label>",
			className: "ux_codeblock",
			initialize: function() {
				my.factcore.UX.model(options, this);
				console.debug("CodeBlock model:", this );
			},
			onShow: function() {
//				var rendered = Marionette.ItemView.prototype.render.apply(this, {} );
//				this.$el.empty().append(rendered);
				var dom = this.$el.get();
				console.debug("Show CodeBlock:", this, $(dom) );
				setTimeout(function() {
		            Blockly.inject( dom, {path: '../jscript/vendor/blockly/'});
				},100)

//				my.factcore.DEBUG && console.log("Rendered CodeBlock: %o %o -> %o", this, this.$el rendered);
				return this;
			}

		});
		return CodeBlock;
	}

})(jQuery, window);

