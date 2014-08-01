(function($, my){

	my.factcore.ASQ.Common = {

        build: function(spec) {
            if (_.isFunction(spec)) return spec;
            var self = this;
            this.base = spec["this"] || this.base || "urn:factcore:ux:query#";
            if (!this.base) throw "urn:factcore:asq:oops:no-base-uri";
            if (!spec.where) throw "urn:factcore:asq:oops:missing-where";

            // build a query-executor function
            return function(from, model) {
self.DEBUG && console.debug("Run asq: ", spec["this"], spec, from, model)
                return self.execute(spec, from, model);
            }
        },

        describe: function(query, from) {
            if (!query.where) throw "urn:factcore:asq:oops:missing-where";
            this.base = query["this"] || this.base || "urn:factcore:asq:query:";
            var self = this;
            function _describe(specs, found) {
                _.each(specs, function(spec, key) {
                    if ( self.isBinding(spec["this"]) ) found[self.varname(spec["this"])] = { "this": spec["this"], types: [], query: spec["this"]+" a ?this" }
                    if ( self.isBinding(spec["has"]) ) found[self.varname(spec["has"])] = { "this": spec["has"], domains: [], ranges: [], types: [], type: "has" }
                    if ( self.isBinding(spec["that"]) ) found[self.varname(spec["that"])] = { "this": spec["that"], types: [], query: spec["has"]+" rdfs:range ?this" }
                    if ( spec.follow ) _describe(spec.follow.where, found);
                });
                return found;
            }
            var about = _describe(query.where, {} );
            if (!from) return about;
            // inspect graph to determine term types
            _.each(about, function(value,key,all) {
self.DEBUG && console.debug(">> %o -> %o %o", key, value.type, value);
                if (value.query=="that") {
                    from.where(value.query).each(function() {
self.DEBUG && console.debug("==> %o %o", value.query, this);
                    })
                }
            })
            return about;
        },

        getIdentity: function() {
            return this.base;
        },

        execute: function(spec, from, model) {
            var self = this;
            if (!from) throw "urn:factcore:asq:oops:no-from";
            if (!spec.where) throw "urn:factcore:asq:oops:no-where-clause";
self.DEBUG && console.debug("Executing QUERY: ", spec.where, from, model)
            if (_.isArray(spec.where)) {
                for(var i=0;i<spec.where.length;i++) {
self.DEBUG && console.debug("Executing WHERE[]: ", spec.where[i], from, model)
                    from = this.execute( { where: spec.where[i] }, from, model);
                }
                return from;
            } else if (_.isObject(spec.where)) {
self.DEBUG && console.debug("Executing WHERE: ", spec.where, from, model)
                return this.where(spec.where, from, model);
            } else if (_.isFunction(spec.where)) {
                return spec.where(from, model);
            } else {
self.DEBUG && console.debug("Invalid %s Where: %o", type, spec)
                throw "urn:factcore:asq:oops:invalid-where-clause";
            }
        },

        where: function(spec, from, model) {
            throw "urn:factcore:asq:oops:not-implemented";
        },

        _get: function(term, model) {
            var found = null;
            if (found==null && model.get) found = model.get(term); // model
            if (found==null) found = model[ term ]; // json
            return found;
        },

        bindObject: function(term, model) {
            // magic terms imply a URI
            if (term=='?this' || term=='?has' || term=='?that') return this.bindURI(term,model);
            else return this.bind(term, model);
        },

        bindURI: function(term, model) {
            if (!this.isBinding(term) || !model) return term;
            var binding = this._get(term.substring(1) ,model );
this.DEBUG && console.debug("Bind: %o %o %o", term, model, (binding?binding:"Not Bound") );
//				console.debug("Binding URI %o -> %o [m]", term, binding);
            return (typeof binding == "undefined")?term:"<"+binding+">";
        },

        bind: function(term, model) {
            if (!this.isBinding(term) || !model) return term;
            var binding = this._get( term.substring(1), model );
//				console.debug("Binding %o -> %o", term, binding);
            return (typeof binding === "undefined")?term:binding;
        },

        isBinding: function(uri) {
            return uri && (this.raw(uri).indexOf(this.base)==0 || uri.indexOf("?")==0);
        },

        raw: function(uri) {
            if (uri && uri.indexOf("<")>=0) {
                return uri.substring(1, uri.lastIndexOf(">") );
            } else return uri;
        },

        varname: function(uri) {
            if (uri.indexOf("?")==0) {
                return uri.substring(1);
            } else if (this.isBinding(uri)) {
                uri = this.raw(uri);
                return uri.substring(this.base.length, uri.length );
            }
            return null;
        },

        term: function(uri) {
            if (uri.indexOf("?")==0) {
                return uri;
            } else if (this.isBinding(uri)) {
                uri = this.raw(uri);
                return "?"+uri.substring(this.base.length, uri.length );
            } else {
                return uri;
            }
        }
	}
})(jQuery, window);
