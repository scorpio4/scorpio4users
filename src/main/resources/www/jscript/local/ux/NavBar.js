(function($, my) {

	// Navigation Bar

	my.scorpio4.UX.View["urn:scorpio4:ux:NavBar"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options); // sanity check ('this', 'label')
		options = _.extend( { DEBUG: false }, options ); // defaults
		var DEBUG = options.DEBUG && my.scorpio4.UX.DEBUG; // master DEBUG kill-switch

		var MenuTree = Backbone.Marionette.CompositeView.extend( _.extend({
			itemViewContainer: "ul", tagName: "li", className: "dropdown-submenu",
			template: "<a class='selectable ' about='{{this}}' title='{{comment}}'>{{label}}</a><ul></ul>",
		}, options ));

		var MenuToggle = Backbone.Marionette.CompositeView.extend( _.extend({
			initialize: function(_options) {
DEBUG && console.log("MenuToggle", this, _options);
			},
			itemView: MenuToggle,
			itemViewContainer: "ul.dropdown-menu", className: "dropdown",
			events: { "click [about]": "onSelect"},
			tagName: "li", template: "<a class='selectable dropdown-toggle' data-toggle='dropdown' about='{{this}}' title='{{label}}'>{{label}}</a><ul class='dropdown-menu'></ul>"
		}, my.scorpio4.UX.mixin ) );

		var MenuBar = Backbone.Marionette.CollectionView.extend({ itemView: MenuToggle, tagName: "ul", className: "nav" });


		var NavBar = Backbone.Marionette.ItemView.extend({
			tagName: "div",
			className: my.scorpio4.UX.stylize("ux_navbar navbar",options),
			template: "<div class='navbar-inner'><b class='brand'>{{label}}</b><span class='ux_menu'></span><span class='ux_search'></span></div>",
			searchTemplate: "<div class='navbar-search pull-right'><input id='search-query' class='search-query' type='text' placeholder='search' size='8'/></div>",
			initialize: function() {
				var self = this;

				my.scorpio4.UX.model(options, this);
DEBUG && console.log("NavBar:", this, options);
				this.menuView = new MenuBar( { model: this.model, collection: this.collection } );
				this.listenTo(this.menuView, "all", function(event, that, x, y, z) {
DEBUG && console.log("On NavBar:", this, event, that);
                    this.triggerMethod("menu:"+event, that, x, y, z);
				})
			},
			onRender: function() {
				var self = this;

    			var css = my.scorpio4.UX.stylize("ux_navbar navbar",options);
			    this.$el.addClass( css );

				var $menu = this.$el.find(".ux_menu");
				$menu.replaceWith( this.menuView.render().el );

				this.$el.find(".ux_search").replaceWith(Mustache.to_html(this["searchTemplate"], options));

DEBUG && console.log("Searching:", options.search)
				if (options.search) {
					var source_labels = _.pluck(options.search.toJSON(), "label");
					$('#search-query', self.$el).typeahead({ source: source_labels });
DEBUG && console.debug("Search:", self.$el, source_labels );
				}
//				this.$el.css( { position: "fixed" } );
			},
			doSelectMenu: function(that) {
DEBUG && console.log("menu select", this, that)
				this.trigger("select", that)
			}
		}, options);

		return NavBar;
	}


})(jQuery, window);
