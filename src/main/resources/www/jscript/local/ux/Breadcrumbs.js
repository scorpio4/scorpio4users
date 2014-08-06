(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:Breadcrumbs"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var DEBUG = true && my.scorpio4.UX.DEBUG; // master DEBUG kill-switch

		var CrumbItem = Backbone.Marionette.ItemView.extend({ template: "<span><a class='selectable' about='{{this}}' title='{{comment}}'>{{label}}</a></span>"});

		var Crumbs = Backbone.View.extend( _.extend({
			className: my.scorpio4.UX.stylize("ux_breadcrumbs breadcrumb", options),
			tagName: "span",
			itemView: CrumbItem,
			x_events: { 'click [about]': 'onSelect' },
			initialize: function() {
//				this.collection.on("change", this.render);
			},
			render: function() {
				var self = this;
				var $ul = $("<ul class='breadcrumb'/>");
				if (this.$el) {
					this.$el.empty();
					this.$el.append($ul);
					this.$el.addClass(self.options.className);
				}
				var $li = null, last_model = null;
				this.collection.each(function(model) {
DEBUG && console.log("LI: %o %o", model, $li);
					if ($li) {
						var $a = $("<a/>").appendTo($li);
						$li.appendTo($ul);
						$a.attr("about", last_model.get("this"));
						$a.attr("title", last_model.get("comment"));
						$a.text(last_model.get("label"));
					}
					$li = $("<li/>");
					last_model = model;
				});
				if (last_model) {
					$li.addClass("active");
					$li.appendTo($ul);
					$li.attr("title", last_model.get("comment"));
					$li.text(last_model.get("label"));
				}
				if (this.$el) this.$el.html($ul);
				return this;
			},
			onRender: function () {
				var $crumbs = $("[about]", this.$el);
				my.scorpio4.UX.factualize($crumbs);
DEBUG && console.log("Crumbs: onRender: %o %o %o", this, $crumbs , this.model);
				return this;
			}
		}, my.scorpio4.UX.mixin.Common, options ));

		return Crumbs;
	}


})(jQuery, window);
