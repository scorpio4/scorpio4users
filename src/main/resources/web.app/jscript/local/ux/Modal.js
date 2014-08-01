(function($, my) {

	my.factcore.UX.Modal = my.factcore.UX.View["urn:factcore:ux:Modal"] = function(options) {
		var DEBUG = true && my.factcore.UX.DEBUG; // master DEBUG kill-switch

		// ensure valid options
		options = my.factcore.UX.checkOptions(options, ["this", "label", "type", "widget" ]);
		options = _.extend({ reveal: false, autoRender: true }, options);

		var widget_options = _.extend({ "this": options["this"], label: options.label, model: options.model, collection: options.collection }, options.widget );

		// create body widget
		var Widget = widget_options.view || my.factcore.UX.View[options.type];
		if (!Widget) throw "urn:factcore:ux:oops:unknown-widget#"+options.type;

		// attach to DOM
		var $el = $("<div/>").addClass(my.factcore.UX.stylize("ux_modal modal hide fade", options));
		$("body").append( $el );

//<button class='btn btn-primary ux_action_ok'>Close</button>

		// create ItemView
		var Modal = Backbone.Marionette.ItemView.extend({
			template: "<div class='modal-header' role='dialog' aria-hidden='true'><h3>{{label}}</h3></div><div class='modal-body'></div><div class='modal-footer'></div>",
			events: {
				"click .ux_action_ok": "hide"
			},
			initialize: function(_options) {
				my.factcore.UX.model(options, this);

				this.header = false;
				this.body = Widget(widget_options);
				this.footer = false;
//				if (this.collection) this.collection.on("reset", this.render, this);
			    if (this.collection) this.collection.on("reset", panel.render, panel);
DEBUG && console.log("UX Modal:", this, options, panel);
				if (options.autoRender) panel.render();
			},
			render: function() {
				DEBUG && console.log("Modal Render", this, this.$el);
//				this.$el.append("<span>TEST</span>");
				Backbone.Marionette.ItemView.prototype.render.apply(this);
			},
			onRender: function() {
				var $header = this.$el.find(".modal-header");
				var $body = this.$el.find(".modal-body");
				var footer = this.$el.find(".modal-footer");

				if (this.header && this.model) {
					this.header.model = this.model;
					this.header.render();
					this.header.$el.appendTo($header);
				}

				if (this.body) {
//					this.body.collection = this.collection;
					this.body.render();
					this.body.$el.appendTo($body);
				}

				if (this.buttons && this.buttons) {
					this.footer.collection = this.buttons;
					this.footer.render();
					this.footer.$el.appendTo($footer);
				}
				return this;
			},
			hide: function() {
				DEBUG && console.log("hide modal:", this, options);
				this.$el.removeClass('in');
			},
			reveal: function() {
				this.$el.modal(); // {show: true, keyboard: true, backdrop: 'static' }
				DEBUG && console.log("Reveal", this.$el.find('.modal') )
				this.$el.addClass('in');
			}
		})

		return Modal;
	}

	return my.factcore;
})(jQuery, window);
