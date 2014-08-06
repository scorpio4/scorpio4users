(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:Tabs"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var DEBUG = false;

		var TabItem = Backbone.Marionette.ItemView.extend({ tagName: "li", template: "<a href='#tab_{{_id}}' about='{{this}}' data-toggle='tab' class='selectable' title='{{comment}}'>{{label}}</a>" });

		var Tabs = Backbone.Marionette.CompositeView.extend({
			className: my.scorpio4.UX.stylize("ux_tab_panel tabbable", options),
			tagName: "div", itemView: TabItem, itemViewContainer: ".nav-tabs",
			template: "<div class='well-small'><ul class='nav nav-tabs'></ul><div class='tab-content well-small'></div></div>",
			events: { "click .nav li a[about]": "selectTab" },
			initialize: function(_options) {
				var self = this;
				var TabCollection = Backbone.Collection.extend({});
DEBUG && console.log("Tab init", this, _options, this.collection);
				my.scorpio4.UX.model(_options,this);
				this.collection = this.collection || new TabCollection({idAttribute: "this"});
				this.tabs = this.tabs || {};
				_.each(options.tabs || options.views, self.add, this )
			},
			add: function(view) {
				if (!view.model) throw "urn:scorpio4:ux:oops:missing-model";
				var _id = my.scorpio4.UX.uid(view.model.get("this")); // sanitize for HTML id
				view.model.set("_id", _id );
				// add tabs and tab-views
				this.tabs[ _id ] = view;
				this.collection.add(view.model);
				return this;
			},
			onRender: function(that) {
				var self = this;
//				$('a', this.$el).click(function (e) { e.preventDefault(); $(this).tab('show'); })
				DEBUG && console.log("Tab onRender", this, that);
				var $panel = this.$el.find(".tab-content");
				$panel.empty();
				var activeClass = "active";
				this.collection.each(function(model) {
					var _id = model.get("_id");
					var view = self.tabs[ _id ];
					DEBUG && console.log("Tab on Render", self, view, model, _id)
					if (view) {
						var $pane = $("<div/>").addClass("tab-pane").addClass(activeClass).attr("id", "tab_"+_id).appendTo($panel);
 						$pane.append(view.el);
						view.render();
						activeClass = "";
					}
				})
			},
			onItemShow: function(that) {
				my.scorpio4.UX.factualize(this, options.factualizer);
			},
			selectTab: function(event) {
				event.preventDefault();
				$(event.currentTarget).tab('show');
				// TODO: trigger Widget "select" event
			}
		}, options);

		return Tabs;
	}

})(jQuery, window);
