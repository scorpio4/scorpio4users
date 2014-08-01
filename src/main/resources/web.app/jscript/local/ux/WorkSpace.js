(function($, my) {

	// WorkSpace instantiates and renders a Layout
	my.factcore.UX.WorkSpace = function(options) {
		options = my.factcore.UX.checkOptions(options);
		// auto-render, if an 'el' is defined
		options = _.extend( { autoRender: (options.$el || options.el)?true:false }, options );

		var DEBUG = false || my.factcore.DEBUG;
		if (!options.$el && !options.el) {
			var $body = $("<div class='ux_workspace container'></div>");
			$body.appendTo($("body"));
			options.el = $body;
			// disable browser text selection
			$(options.el).attr('unselectable','on').css('UserSelect','none').css('MozUserSelect','none');
		}

        var Layout = Backbone.Marionette.Layout.extend({
			template: "<div class='ux_layout row-fluid'><span class='ui-layout ui-layout-north'></span><span class='ui-layout ui-layout-west'></span><span class='ui-layout ui-layout-center'></span><span class='ui-layout ui-layout-east'></span><span class='ui-layout ui-layout-south'></span></div>",
            regions: { 'north': '.ui-layout-north', 'south': '.ui-layout-south', 'east': '.ui-layout-east', 'west': '.ui-layout-west', 'center': '.ui-layout-center'},
			initialize: function(_options) {
				var self = this;
				_options = _options || options;
				my.factcore.UX.model(_options, this);
				this.$el = $(_options.el);
                this.views = new Backbone.Model(_options.views);
                this.listenTo(this.views, "change", this.onViewsChange, this);

                this.models = new Backbone.Collection(_options.models||[]);
                this.routes = new Backbone.Collection(_options.routes||[]);

                if (_options.autoRender) this.render();
                this.onViewsChange();
			},
			onViewsChange: function(_x, _y) {
			    var self = this;
			    console.debug("[Workspace] onViewsChange: ", this, _x, _y);
			    _.each(self.views.attributes, function(view, _region) {
    			    console.debug("[Workspace] View Region: ", self, view, _region);
                    if (_region && self[_region]) {
                        self[_region].show(view)
                    } else {
    			        console.warn("[Workspace] Missing Region: ", view, _region );
                    }
			    });
			}
        }, Marionette.AppRouter );

        var layout = new Layout(options);
DEBUG && console.debug("UX WorkSpace:", options, layout);
        return layout;
	}

})(jQuery, window);
