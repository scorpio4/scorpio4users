/* ****************************************************************************************
	Original (c) 2009-2013 Troven Software

	@i18n_text		i18n
	@comment	Simple handling of i18n translations
	@url		http://scorpio4.com/legal/
	@author		Lee Curtis <lee.curtis@scorpio4.com>
	@version	0.1
***************************************************************************************** */

(function($){
I18N = function(options) {

	this.init = function(_i18ns) {
		var self = this;
		self.i18ns = _i18ns;
	}

	this.resolve = function(i18n) {
		return this.i18ns[i18n] || i18n;
	}

	this.text = function(i18n, model) {
		var i18n_text = this.resolve(i18n);
		var tokens = i18n_text.split("$");
		if (!tokens) return i18n_text;
		var translated  = "";
		$.each(tokens, function(ignore, token) {
			var endOfToken = token.indexOf("}");
			if (token[0]=="{" && endOfToken) {
				var txt = model[token.substring(1, endOfToken)];
				translated+=(txt?txt:"")+token.substring(endOfToken+1);
			} else translated+=token;
		});
		return translated;
	}

	this.init(options);
}
})(jQuery);
