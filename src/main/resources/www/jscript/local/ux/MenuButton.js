(function($, my) {


	my.scorpio4.UX.View["urn:scorpio4:ux:MenuButton"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options, ["this", "label", "collection"]);
		var DEBUG = true && my.scorpio4.UX.DEBUG; // master DEBUG kill-switch

		var ButtonItem = Backbone.Marionette.ItemView.extend({ tagName: "li",
//			template: "<a class='selectable' about='{{this}}' title='{{label}}'>{{label}}</a>"
			template: "<a about='{{this}}' href='#'>{{label}}</a>",
		});

		var ButtonMenu = Backbone.Marionette.CompositeView.extend( _.extend({
			itemView: ButtonItem, className: "btn-toolbar", tagName: "div",
			template: "<span class='btn-group'><button class='btn dropdown-toggle' data-toggle='dropdown'>{{label}}</button><ul class='dropdown-menu'></ul></span>",
			itemViewContainer: "ul",
			events: {
			  'click [about]': 'doEventSelect'
			},
			initialize: function() {
				var self = this;
				my.scorpio4.UX.model(options, this);
				DEBUG && console.debug("Init MenuButtons:", this, options);
			},
			selectItem: function(selection) {
				console.log("Menu Selected: %o %o", this, selection);
				if (!selection) throw "urn:scorpio4:ux:oops:missing-selection";
				var label = selection.get("label");
				if (!label) throw "urn:scorpio4:ux:oops:missing-selection-label";
				this.model.set("label", label);
				this.render();
				return this;
			},
			onRender: function() {
				$('.dropdown-toggle', this.$el).dropdown();
				DEBUG && console.debug("onRender MenuButtons:", this, options);
			},
			onShow: function () {
				my.scorpio4.UX.factualize(this, options.factualizer);
				DEBUG && console.debug("onShow MenuButtons:", this, options);
				return this;
			}
		}, my.scorpio4.UX.mixin.Common, options ));

		return ButtonMenu;
	}


	my.scorpio4.UX.View["urn:scorpio4:ux:ButtonBar"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options, ["this", "label", "collection"]);
		var DEBUG = true;

		var ButtonItem = Backbone.Marionette.ItemView.extend({ tagName: "li",
			template: "<a about='{{this}}' href='#'>{{label}}</a>",
		});

		var ButtonMenu = Backbone.Marionette.CompositeView.extend( {
			itemView: ButtonItem, className: "btn-toolbar", tagName: "span",
			template: "<div class='btn-group'><button about='{{this}}' class='btn dropdown-toggle' data-toggle='dropdown'>{{label}}&nbsp;<span class='btn-optional caret'></span></button><ul class='btn-optional dropdown-menu'></ul></div>",
			x_template: "<div class='btn-group'><button class='btn'>{{label}}</button><button class='btn-optional btn dropdown-toggle' data-toggle='dropdown'><span class='caret'></span></button><ul class='btn-optional dropdown-menu'></ul></div>",
			itemViewContainer: "ul",
			initialize: function() {
				if (options.follow) {
					this.collection = this.model.get(options.follow)
				}
			},
			onRender: function() {
				if (!this.collection || !this.collection.length) {
					this.$el.find('.btn-optional').remove();
				}
			}
		});

		var ButtonBar = Backbone.Marionette.CollectionView.extend( _.extend({
			itemView: ButtonMenu, className: "btn-toolbar", tagName: "div",
			events: {
			  'click [about]': 'doEventSelect'
			},
			initialize: function() {
				var self = this;
				my.scorpio4.UX.model(options, this);
				this.collection.on("select", function(that) {
					console.log("Menu Selected: %o %o", self, that);
					this.model.set("label", that.get("label"));
				})
				DEBUG && console.debug("Init MenuButtons:", this, options);
			}
		}, my.scorpio4.UX.mixin.Common, my.scorpio4.UX.mixin.Selectable ));

		return ButtonBar;
	}

})(jQuery, window);
