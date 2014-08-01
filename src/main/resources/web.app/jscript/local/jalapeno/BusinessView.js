(function($, my) {

	my.factcore.UX.View["urn:capsicum:ux:BusinessView"] = function(options) {
		options = my.factcore.UX.checkOptions(options, ["this", "collection"]);

		var $body = null;
		if (!options.$el) {
			$body = $("<div class='capsicum_business_view'></div>");
			$body.appendTo($("body"));
//			options.$el = $body;
		}

		var BusinessView = Backbone.Marionette.ItemView.extend( _.extend({
			template: "<div class='bv_capsicum fade'><span id='BV_ROLE' resource='http://CAPSICUM.com/CAPSICUM-BV#ROLE' class='selectable bv_cell bv_role'></span><span resource='http://CAPSICUM.com/CAPSICUM-BV#INTENT' class='selectable bv_cell bv_intent'></span><span resource='http://CAPSICUM.com/CAPSICUM-BV#ENTITLEMENT' class='selectable bv_cell bv_entitlement'></span><span resource='http://CAPSICUM.com/CAPSICUM-BV#OUTCOME' class='selectable bv_cell bv_outcome'></span><span resource='http://CAPSICUM.com/CAPSICUM-BV#UNDERTAKING' class='selectable bv_cell bv_undertaking'></span><span resource='http://CAPSICUM.com/CAPSICUM-BV#CONTEXT' class='selectable bv_cell bv_context'></span><span resource='http://CAPSICUM.com/CAPSICUM-BV#ENTITLEMENT' class='selectable bv_cell bv_entitlement'></span><span resource='http://CAPSICUM.com/CAPSICUM-BV#CONDITION' class='selectable bv_cell bv_condition'></span><span resource='http://CAPSICUM.com/CAPSICUM-BV#COMPLIANCE' class='selectable bv_cell bv_compliance'></span></div>",
			className: "ux_business_view",
			el: $body,
			initialize:function(_opts) { this._initialize(_opts) },
			onRender: function() {
				console.log("onRender Business View", this, options)
				this._delegateDOMEvents(this.domEvents);
			},
			_delegateDOMEvents: function(events) {
				if (!(events || (events = _.result(this, 'events')))) return this;
				var delegateEventSplitter = /^(\S+)\s*(.*)$/;
				this.undelegateEvents();
				for (var key in events) {
					var method = events[key];
					if (!_.isFunction(method)) method = this[events[key]];
					if (!method) continue;
	
					var match = key.match(delegateEventSplitter);
					var eventName = match[1], selector = match[2];
					method = _.bind(method, this);
					eventName += '.delegateEvents' + this.cid;
					var self = this;
					$(selector, this.$el).bind(eventName, function(event) {
console.log("Method", self, this, selector, eventName, method, event)
						method(event);
					});
				}
				return this;
			},
		}, my.factcore.UX.mixin) );

		var modelled = my.factcore.UX.model(options);
		modelled.events = { 'click .selectable': 'onSelect' };
console.log("Modelled Business View", this, modelled)

		return new BusinessView(modelled);
	}


})(jQuery, window);
