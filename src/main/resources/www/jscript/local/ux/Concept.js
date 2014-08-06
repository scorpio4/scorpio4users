	(function($, my) {

	// Concept Viewer - Layout
	my.scorpio4.UX.View["urn:scorpio4:ux:ConceptLayout"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var ConceptLayout = Backbone.Marionette.Layout.extend( _.extend( {
			template: "<div class='row-fluid'><span class='ui-layout-west span2'>LEFT</span><span class='ui-layout-center span8'>MIDDLE</span><span class='ui-layout-east span2'>RIGHT</span></div>",
			regions: {
				west: ".ui-layout-west",
				center: ".ui-layout-center",
				east: ".ui-layout-east",
			},
			onRender: function() {
				if (this.options.modal) {
					this.$el.dialog( {title: this.options.label || "Unknown", "width": this.options.width || 500 } )
				}
			}
		}, options) );
		return ConceptLayout;
	}

	my.scorpio4.UX.View["urn:scorpio4:ux:Concepts"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);

		var ConceptItem = Backbone.Marionette.ItemView.extend({ template: "<div class='ux_concept_item selectable' about='{{this}}'>{{label}}</div>" });

		my.DEBUG && console.log("Concepts: %o %o", this, options);

		var Concepts = Backbone.Marionette.CollectionView.extend( _.extend({
			className: my.scorpio4.UX.stylize("ux_concept", options), itemView: ConceptItem, template: "<ul></ul>",
			events: { "click [about]": "onSelect" },
			initialize: function() {
				my.scorpio4.UX.model(options, this);
			},
		}, my.scorpio4.UX.mixin.Common, options ) );

		return Concepts;
	}

})(jQuery, window);
