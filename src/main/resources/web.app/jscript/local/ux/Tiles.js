(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:Tiles"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var spanSize = options.columns?(12 / options.columns):3;
		var TileItem = Backbone.Marionette.ItemView.extend({ template: "<li class='selectable span"+spanSize+"' about='{{this}}' title='{{comment}}'>{{label}}</li>"});

		var Tiles = Backbone.Marionette.CollectionView.extend( _.extend({
			itemView: TileItem, template: "<ul class='tiles row'></ul>",
			events: {
			  'click [about]': 'onSelect'
			},
			initialize: function(_options) {
				my.factcore.UX.model(options,this);
			},
			onShow: function () {
				my.factcore.UX.factualize(this, options.factualizer);
				return this;
			}
		}, my.factcore.UX.mixin.Common , options));

		return Tiles;
	}

})(jQuery, window);
