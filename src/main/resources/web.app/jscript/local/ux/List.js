(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:List"] = function(options) {
		var requiredOptions = ["this", "label", "collection"];
		options = my.factcore.UX.checkOptions(options, requiredOptions);
		var DEBUG = true && my.factcore.UX.DEBUG; // master DEBUG kill-switch

		var ListItem = Backbone.Marionette.ItemView.extend({ tagName: "li", template: "<span class='selectable' about='{{this}}' title='{{comment}}'>{{label}}</span>"});

		var List = Backbone.Marionette.CollectionView.extend( _.extend({
			itemView: ListItem, tagName: "ul", className: my.factcore.UX.stylize("ux_list nav-list", options),
			events: {
				'click [about]': 'doEventSelect',
				'dragstart': 'doEventDrag',
			},
			initialize: function() {
				my.factcore.UX.model(options, this);
				this.listenTo(this.collection, "change", this.render);
			},
			onShow: function () {
				var self = this;
				setTimeout(function() {
					var $facts = my.factcore.UX.factualize(self, options.factualizer);
					var $drags = self.initializeDraggable(options.draggable);
				})
				return this;
			},
			selectItem: function(model) {
				this.$el.find(".active").removeClass("active");
				var $item = this.$el.find("[about='"+model.id+"']");
DEBUG && console.debug("Select Item:", model, $item);
				$item.addClass("active");
			}
		}, my.factcore.UX.mixin.Common, my.factcore.UX.mixin.Draggable),
		{
			requiredOptions: requiredOptions,
			sample: "<div class='ux_sample'><label>{{label}}</label><ul class='ux_toggled ux_list'><li>List Item 1</li><li>List Item 2</li></ul></div>"
		});

		return List;
	}

})(jQuery, window);
