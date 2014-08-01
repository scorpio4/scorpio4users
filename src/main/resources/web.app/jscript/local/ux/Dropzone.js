(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:Dropzone"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var DEBUG = true;

		var Dropzone = Backbone.Marionette.ItemView.extend({
			template: "<div>Drop Zone</div>",
			className: "ux_dropzone",
			initialize: function() {
				my.factcore.UX.model(options, this);
			},
			onShow: function() {
				var self = this;
				setTimeout(function() {
					console.log("Dropzone:", self, self.$el);
					self.$el.droppable({
					    x_accept: "li",
					    greedy: true, // don't bubble to parent
						activeClass: "ui-state-hover",
						hoverClass: "ui-state-hover",
						drop: function( event, ui ) {
							var model = $(ui.helper).data("urn:factcore:ux:model:drag");
							console.log("DropZone:", ui, $(ui.helper), model)
							if (model) {
								$( this ).html( "Dropped:"+model.get("label") );
								self.triggerMethod("drop", model);
								Marionette.triggerMethod.call(model, "drop", model);
							}
						}
					})
				},10)
				return this;
			}
		});
		return Dropzone;
	}

})(jQuery, window);

