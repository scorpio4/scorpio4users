(function($, my){

    my.scorpio4.ASQ.JSON = function(options) {
		options = options | {};
		this.base = options.base;
		this.DEBUG = false;

        // Inherit common ASQ utility methods
		_.extend(this, my.scorpio4.ASQ.Common);

        // Implement concrete query execution
		_.extend(this, {

			where: function(spec, from, model) {
			    throw "urn:scorpio4:asq:oops:JSON-not-implemented";
			},
		});

		return this;
	}

})(jQuery, window);
