/* ****************************************************************************************
	Original (c) 2009-2013 Troven Software

	@label		NS
	@comment	Simple handling of namespaces
	@url		http://factcore.com/legal/
	@author		Lee Curtis <lee.curtis@factcore.com>
	@version	0.1
***************************************************************************************** */

(function($){
NS = Class.extend({

	init: function(_nspace) {
		var self = this;
		self.nspace= _nspace;
		self.namespaces = {};
	},

	curie: function(uri) {
		var prefix = this.getPrefix(uri);
		if (!prefix) return uri;
		return prefix+":"+uri.substring( this.namespaces[prefix].length );
	},

	localize: function(uri) {
		var prefix = this.getPrefix(uri);
		if (!prefix) throw "urn:kernel:error:unknown-namespace";
		var name = uri.substring( this.namespaces[prefix].length );
		this.names[name] = prefix;
	},

	uri: function() {
		return this.nspace+uuid();
	},

	uuid: function() {
		var newID = function() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); };
		return (newID()+newID()+"-"+newID()+"-"+newID()+"-"+newID()+"-"+newID()+newID()+newID());
	},

	getPrefix: function(uri) {
		var self = this;
		var found = null;
		$.each(self.namespaces, function(prefix,base) {
			if (uri.indexOf(base)>=0) found = prefix;
		});
		return found;
	},

}


});
})(jQuery);
