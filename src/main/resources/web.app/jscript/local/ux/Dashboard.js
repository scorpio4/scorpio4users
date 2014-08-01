(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:Dashboard"] = function(options) {
		options = my.factcore.UX.checkOptions(options, ["this", "label"]);
		var follow_this = options.follow;
		var DEBUG = false;

		/** Gizmo **/
		var Gizmo = Backbone.Marionette.CompositeView.extend({
			initialize: function(_options) {
				this.collection = this.model.get(follow_this);
				var View = my.factcore.UX.View[options.widget];
				var view_options = _.extend(options.gizmo,_options)
				this.view = new View(view_options);
				DEBUG && console.debug("Init Dash Gizmo", this, _options);
			},
			initialize: function(_options) {
				DEBUG && console.debug("Init Gizmo", this, _options)
			},
			appendHtml: function($el,iv) {
				DEBUG && console.debug("Append Gizmo", this, $el, iv)
				$el.$("li:first").append(iv.el);
			},
			onRender: function() {

			},
			tagName: "li", className: my.factcore.UX.stylize("ux_gizmo", options),
			template: "<span class='ux_gizmo_header selectable' about='{{this}}' title='{{comment}}'><i class='pull-right icon icon-minus'></i>{{label}}<div class='ux_gizmo_body'></div></span>"
		});

		var Dashboard = Backbone.Marionette.CompositeView.extend( _.extend({
			itemView: Gizmo, className: my.factcore.UX.stylize("ux_dashboards", options),
			tagName: "div", template: "<span about='{{this}}' title='{{comment}}'>{{label}}<ul class='ux_dashboard'></ul></div>", itemViewContainer: "ul",
			events: {
			  'click .selectable': 'doEventSelect'
			},
			initialize: function(_options) {
				DEBUG && console.debug("Init Dash Root", this, _options);
			},
			onItemviewShow: function () {
				var $nodes = my.factcore.UX.factualize(this, options.factualizer );
				$( ".ux_dashboard", this.$el ).sortable( _.extend({
					connectWith: ".ux_dashboard"
				}, options.sortable) );
   //				$( ".ux_dashboard", this.$el ).resizable();

				$( ".icon-menu", this.$el ).click(function() {
					$( this ).toggleClass( "icon-minus" ).toggleClass( "icon-plus" );
					$( this ).parents( ".ux_gizmo" ).find( ".ux_gizmo_body" ).toggle();
				});

				$( ".ux_dashboard" ).disableSelection();

				return this;
			}
		}, my.factcore.UX.mixin.Common ) );

		return Dashboard;
	}


})(jQuery, window);
