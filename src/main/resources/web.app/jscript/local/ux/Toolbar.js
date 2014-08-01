(function($, my) {


	my.factcore.UX.View["urn:factcore:ux:Toolbar"] = function(options) {
		options = my.factcore.UX.checkOptions(options, ["this", "label", "collection"]);
		var DEBUG = true && my.factcore.UX.DEBUG; // master DEBUG kill-switch

		var ToolButton = Backbone.Marionette.ItemView.extend({
			tagName: "span",
			template: "<button class='btn' about='{{this}}' title='{{comment}}'><i class='icon-{{icon}}'></i></button>",
		});

		var ToolBar = Backbone.Marionette.CollectionView.extend( _.extend({
			itemView: ToolButton, tagName: "div",
			className: my.factcore.UX.stylize("ux_toolbar btn-group",options),
			events: {
			  'click [about]': 'doEventSelect'
			},
			initialize: function() {
				var self = this;
				my.factcore.UX.model(options, this);
DEBUG && console.debug("Init Toolbars:", this, options);
			},
			selectItem: function(selection, event) {
				if (!selection) throw "urn:factcore:ux:oops:missing-selection";
				this.triggerMethod(selection.id, selection, event);
				var localName = my.factcore.fact.localName(selection.id);
				if (localName) this.triggerMethod(localName, selection, event);
DEBUG && console.debug("ToolButton Selected:", localName, this, selection, event);
				this.render();
				return this;
			},
			onRender: function() {

				$('.dropdown-toggle', this.$el).dropdown();
DEBUG && console.debug("onRender Toolbars:", this, options);
			},
			onShow: function () {
				my.factcore.UX.factualize(this, options.factualizer);
DEBUG && console.debug("onShow Toolbars:", this, options);
				return this;
			}
		}, my.factcore.UX.mixin.Common, options ));

		return ToolBar;
	}

})(jQuery, window);
