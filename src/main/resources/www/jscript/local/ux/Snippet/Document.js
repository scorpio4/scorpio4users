(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:snippet:Document"] = function(options) {
		var requiredOptions = ["this", "label", "collection"];
		options = my.scorpio4.UX.checkOptions(options, requiredOptions);

		var BlankItem = Backbone.Marionette.ItemView.extend({ tagName: "li", template: "<span about='{{this}}' class='ux_document_section' title='{{comment}}'>{{template}}</span>"});
		var HTML = my.scorpio4.UX.View["urn:scorpio4:ux:HTML"];

		var List = Backbone.Marionette.CollectionView.extend( _.extend({
			itemView: HTML, tagName: "ul", className: my.scorpio4.UX.stylize("ux_list nav-list", options),
			events: {
				'click [about]': 'doEventSelect',
				'dragstart': 'doEventDrag',
			},
			initialize: function() {
				my.scorpio4.UX.model(options, this);
				this.listenTo(this.collection, "change", this.render);
			},
			onShow: function () {
				var self = this;
				setTimeout(function() {
					var $facts = my.scorpio4.UX.factualize(self, options.factualizer);
					var $drags = self.initializeDraggable(options.draggable);
				})
				return this;
			},
			getItemView: function(model) {
				var itemOptions = model.toJSON();
				var HTML = my.scorpio4.UX.View["urn:scorpio4:ux:HTML"](itemOptions);
/*
				var template = "<div about='{{this}}' class='ux_document_section'>"+model.get("template")+"</div>";
				if (template) {
					var View = Marionette.ItemView.extend({tagName: "li", template: template});
					return View;
				} else {
					return this.itemView;
				}
*/
				return HTML;
			},
			selectItem: function(model) {
				this.$el.find(".active").removeClass("active");
				var $item = this.$el.find("[about='"+model.id+"']");
console.debug("Select Item:", model, $item);
				$item.addClass("active");
			}
		}, my.scorpio4.UX.mixin.Common, my.scorpio4.UX.mixin.Draggable),
		{
			requiredOptions: requiredOptions,
			sample: "<div class='ux_sample'><label>{{label}}</label><ul class='ux_toggled ux_list'><li>List Item 1</li><li>List Item 2</li></ul></div>"
		});

		return List;
	}

})(jQuery, window);
