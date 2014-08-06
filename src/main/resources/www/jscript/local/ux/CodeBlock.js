(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:CodeBlock"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var DEBUG = true;

		var CodeBlock = Backbone.Marionette.ItemView.extend({
			template: "<label about='{{this}}'>{{label}}</label>",
			className: "ux_codeblock",
			initialize: function() {
				my.scorpio4.UX.model(options, this);
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

//				my.scorpio4.DEBUG && console.log("Rendered CodeBlock: %o %o -> %o", this, this.$el rendered);
				return this;
			}

		});
		return CodeBlock;
	}

})(jQuery, window);

