(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:asq"] = function(options, query) {
		options = my.scorpio4.UX.checkOptions(options);
		if (!query && options.query) query = options.query;
		var WhereCollection = Backbone.Collection.extend({});
		var whereModels = new WhereCollection(query.where);

		var WhereClauseView = Backbone.Marionette.ItemView.extend({
			tagName: "div",
			template: "<div class='query'><input size='20' name='this' value='{{this}}'/><input name='has' value='{{has}}'/><input name='that' value='{{that}}'/></div>",
			initialize: function() {
				this.collection = whereModels;
			}
		});
		var WhereView = Backbone.Marionette.CollectionView.extend({ itemView: WhereClauseView });
		return WhereView;
	}


})(jQuery, window);
