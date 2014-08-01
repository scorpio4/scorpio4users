(function($, my){

    my.factcore.ASQ.Core = my.factcore.ASQ.RDF = function(options) {
		options = options | {};
		this.base = options.base;
		this.DEBUG = false;

        // Inherit common ASQ utility methods
		_.extend(this, my.factcore.ASQ.Common);

        // Implement concrete query execution
		_.extend(this, {

			where: function(spec, from, model) {
				return from.where( this.pattern(spec, from, model) );
			},

			pattern: function(spec, from, model) {
				if (!spec["this"]||!spec["has"]||!spec["that"]) throw "urn:iq;ux:oops:missing-pattern-terms";
				var t_this = this.term(spec["this"]), t_has = this.term(spec["has"]), t_that = this.term(spec["that"]);
				var s = this.bindURI( t_this, model);
				var p = this.bindURI( t_has, model);
				var o = this.bindObject( t_that, model);
				$matcher = $.rdf.pattern( s, p, o , { namespaces: from.databank.namespaces, optional: spec.optional?true:false } );
this.DEBUG && console.debug("Pattern From: %o %o %o -> %o %o %o -> %o %o", s, p, o, t_this, t_has, t_that, model, $matcher);
				return $matcher;
			},

		});
		return this;
	}
})(jQuery, window);
