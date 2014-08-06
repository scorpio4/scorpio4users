(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:Tiles"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var spanSize = options.columns?(12 / options.columns):3;
		var TileItem = Backbone.Marionette.ItemView.extend({ template: "<li class='selectable span"+spanSize+"' about='{{this}}' title='{{comment}}'>{{label}}</li>"});

		var Tiles = Backbone.Marionette.CollectionView.extend( _.extend({
			itemView: TileItem, template: "<ul class='tiles row'></ul>",
			events: {
			  'click [about]': 'onSelect'
			},
			initialize: function(_options) {
				my.scorpio4.UX.model(options,this);
			},
			onShow: function () {
				my.scorpio4.UX.factualize(this, options.factualizer);
				return this;
			}
		}, my.scorpio4.UX.mixin.Common , options));

		return Tiles;
	}

})(jQuery, window);
