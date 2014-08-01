/* ****************************************************************************************
	Original (c) 2009-2013 Troven Software

	@label		PubSub
	@url		http://factcore.com/legal/
	@comment	Listen for server-side push messages
	@author		Lee Curtis <lee.curtis@factcore.com>
	@version	0.1
***************************************************************************************** */

(function($){
PubSub = Class.extend({

	init: function(meta) {
		var self = this;
		this.timeout = meta.timeout || 2000;
	},

	start: function() {
		var self=this;
		var $notify_pulse = $(".notify_pulse");
		if (!$notify_pulse || !$notify_pulse.length) {
			$notify_pulse = $("<span class='notify_pulse'></span>").prependTo("body");
		}
// if (self.DEBUG) console.log("[PubSub] Start Listening: %s, %s ---> %s", self.is_online, self.is_listening, timeout);
		// listen for incoming messages (server-push)
		var since = 0;
		if (self.notifier_id) clearInterval(self.notifier_id);
		self.notifier_id = setInterval(function() {
			if (self.is_listening) {
				$notify_pulse.html("<img height='16' src='/icons/logo.png'/>");
				$.get("/events/?clear=true&since="+since, function(events) {
// if (self.DEBUG) console.log("[PubSub] Got %s Replies: %o for %s",events?events.length:"no", events);
					$notify_pulse.html("<img height='16' src='/icons/busy.gif'/>");
					$.unblockUI();
// if (self.VERBOSE) console.log("[PubSub] Reply: %o -> %o", reply, self.events);
					if (events) {
						$.each(events, function(that_event, event) {
							since = event.timestamp>since?event.timestamp:since;
if (self.VERBOSE) console.log("[PubSub] Heard Event: %o -> %o", event, event.replies);
//                                $notify_pulse.text(""+reply.replies.length);
							var notices = event.replies?event.replies:false;
							if (event.replies) {
							self.notify(event.replies);
								$.each(event.replies, function(ignore, reply) {
									if (event.from || reply.from) {
										var from = reply.from||event.from;
if (self.DEBUG) console.log("[PubSub] Re-broadcast 2 UX: %s / %s -> %o", from, reply.this, reply);
										self.events.broadcast(from, $.extend({},event), reply);
									}
								});
							}
						});
					}
				});
			}
		}, self.timeout  );
if (self.VERBOSE) console.log("[PubSub] Remote Listener: %o", self.notifier_id);
	},
}


});
})(jQuery);
