(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:Layout"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var DEBUG = true && my.scorpio4.UX.DEBUG; // master DEBUG kill-switch
		_.extend({ views: [], models: [], routes: [] }, options);

		// compute regions & sizes
		options.spans = options.spans || {}
		var spanSize = options.spanSize || (options.spans&&options.spans.north) || 12;
		var regions = {}, spans = { north: 0, south: 0, east: 0, west: 0, center: 0 };
		if (options.views) {
			if (options.views.north) { regions.north = ".ui-layout-north"; spans.north = options.spans.north || spanSize; }
			if (options.views.south) { regions.south = ".ui-layout-south"; spans.south = options.spans.south || spanSize; }
			if (options.views.west) { regions.west = ".ui-layout-west"; spans.west = options.spans.west || Math.round(spanSize/4); }
			if (options.views.east) { regions.east = ".ui-layout-east"; spans.east = options.spans.east || Math.round(spanSize/4); }
		}
		// center layout
		regions.center = ".ui-layout-center";
		spans.center = spanSize - spans.east - spans.west;

		var Layout = Backbone.Marionette.Layout.extend( _.extend({
			template: "<div class='ux_layout row-fluid'><span class='ui-layout ui-layout-north'></span><span class='ui-layout ui-layout-west'></span><span class='ui-layout ui-layout-center'></span><span class='ui-layout ui-layout-east'></span><span class='ui-layout ui-layout-south'></span></div>",
			regions: regions,
			spans: spans,
			views: {},
			initialize: function(_options) {
				var self = this;
				my.scorpio4.UX.model(_options, this);
				this.$el = $(_options.el);

DEBUG && console.debug("initialize Layout:", this, _options);
				_.each(_options.views, function(view,key,views) {
					self.addView(key, view);
				})
			},
			addView: function(key, view) {
				this.views[key] = view;
				return view;
			},
			onRender: function() {
				var self = this;
DEBUG && console.debug("onRender Layout:", this, regions, spans, self.views);
				_.each(spans, function(span,key) {
					if (span) $(regions[key], self.$el).addClass("span"+span);
				});
			},
			onShow: function() {
				this.initializeDroppable(options);
			},
			show: function() {
				if(!this._isRendered) this.render();
				var self = this;
				_.each(self.views, function(view,key,views) {
DEBUG && console.debug("Render/Show:", key, self[key], view);
					if (self[key]) self[key].show(view);
				});
				this._activateLayout();
			},
			_activateLayout: function() {
DEBUG && console.debug("Activate Layout:", this);
//				$(".ux_layout", this.$el).layout({ applyDefaultStyles: true });
			}

		}, my.scorpio4.UX.mixin.Droppable) )

		return Layout;
	}

})(jQuery, window);
