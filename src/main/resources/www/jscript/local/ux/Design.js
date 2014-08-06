(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:Design"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		options = _.extend({designType: ['widget','type']}, options);
		var DEBUG = true && my.scorpio4.UX.DEBUG; // master DEBUG kill-switch

		var DesignItem = Backbone.Marionette.ItemView.extend({
			template: "<li><label about='{{this}}' title='{{comment}}>{{label}}</label></li>",
		});

		var Design = Backbone.Marionette.CompositeView.extend( _.extend({
			itemView: DesignItem,
			className: my.scorpio4.UX.stylize("ux_design", options), itemViewContainer: ".ux_designs",
			template: "<div about='{{this}}' title='{{comment}}'><label>{{label}}</label><div class='ux_designs'></div></div>",
			tagName: "div",
			initialize: function() {
				my.scorpio4.UX.model(options, this);
DEBUG && console.log("Initialize Design", this);
			},
			getItemView: function(model){
				if (!model) {
					console.log("Design getItemView: ", this, model)
//					throw "urn:scorpio4:ux:oops:Design#missing-model";
					return null;
				}
				var itemView = null;
				var MyView = my.scorpio4.UX.View[model.id];
				if (!MyView) {
					if ( _.isString(options.designType)) {
						MyView = my.scorpio4.UX.View[ model.get(options.designType) ];
					} else if ( _.isArray(options.designType) ) {
						for(var i=0;i<options.designType.length;i++) {
							if (!MyView) MyView = my.scorpio4.UX.View[ model.get( options.designType[i] ) ];
						}
					}
				}

				if (model && MyView) {
					var _model = model.toJSON();
					_model.collection = new Backbone.Collection();

					var myView = MyView(_model);
					if (!myView) return null;
					var myTemplate = myView.sample || "<li>No "+this.model.get("label")+" Sample</li>";
DEBUG && console.log("getItemView: %s -> %o %o %o", model.id, myView, itemView, myView.sample)
					itemView = DesignItem.extend({template: myTemplate })
				} else {
					itemView = Marionette.getOption(this, "itemView");
				}

				if (!itemView){
DEBUG && console.error("Missing ItemView: ", this, model)
				  var err = new Error("An `itemView` must be specified");
				  err.name = "NoItemViewError";
				  throw err;
				}

				return itemView;
			},
			onShow: function() {
				this.initializeDroppable(options);
			}
		}, my.scorpio4.UX.mixin.Droppable) );
		return Design;
	}

})(jQuery, window);

