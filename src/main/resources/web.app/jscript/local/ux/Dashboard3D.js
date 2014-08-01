(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:Dashboard3D"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		options = _.extend({viewFacet: "type", viewable: {} }, options);
		var DEBUG = true;

		var ViewStep = Backbone.Marionette.ItemView.extend( {
			className: "ux_view step",
			templateHelpers: my.factcore.UX.mixin.Common.templateHelpers,
			template: "<div class='slide' about='{{this}}' title='{{comment}}'><h1>{{label}} / {{count}}</h2><p>{{comment}} ({{type}}) <A HREF='#urn_iq_ux_exampleOnSelect'>TEST</A></p></div>"
		} );

		var Dashboard3D = Backbone.Marionette.CollectionView.extend({
			className: "ux_dashboard3d hide",
			axis: options.axis,
			triggerMethod:   Marionette.triggerMethod,
			initialize: function() {
				var self = this;
				my.factcore.UX.model(options,this);
				this.setLayout(options.layout)
				this.initializeCoords();
				this.listenTo(this.collection, "fetch", self.onShow)
			},
			setLayout: function(layout) {
				if (_.isString(layout)) {
					layout = this.layout["layout"+layout]; // named-lookup
				}
				if (_.isFunction(layout)) {
					this.layout = layout;
				} else
					this.layout = this.layoutRacks;
			},
			// override: get the item view
  			getItemView: function(model) {
				var viewOptions = Marionette.getOption(this, "itemViewOptions") || {};
				viewOptions.model = model;
				var type = model.get(options.viewFacet) || model.id;
//				if (!type) throw "urn:factcore:ux:oops:missing-view-facet";
				var itemView = options.viewable[type] || ViewStep;
				DEBUG && console.log("3D View Type:", type, model, itemView )
//				if (!itemView) throw "urn:factcore:ux:oops:missing-view#"+type;
//				return itemView(viewOptions);
				return itemView;
			},
			// override: render the item view
			renderItemView: function(view, index) {
				DEBUG && console.log("3D Render Item:", view.model.id, view, index)
				view.render();
				var that = view.model.id;
				if (!that) throw "urn:factcore:ux:oops:missing-model-identity#"+that;

				var uid = my.factcore.UX.uid( that );
				var coords = this.getItemViewCoords(view, index);
				view.$el.attr("id", uid);

                this.positionItemView(view, coords);
				this.appendHtml(this, view, index);
			},
			positionItemView: function(view, coords) {
				if (!view) throw "urn:factcore:ux:oops:missing-view#";
				if (!view.model) throw "urn:factcore:ux:oops:missing-view-model#";
				if (!coords) throw "urn:factcore:ux:oops:missing-coords#";
				view.$el.attr("data-x", coords.x || 0 );
				view.$el.attr("data-y", coords.y || 0 );
				view.$el.attr("data-z", coords.z || 0 );
				view.$el.attr("data-scale", coords.scale  || 1 );
				if (coords.rotate) {
					view.$el.attr("data-rotate", coords.rotate);
				} else if ( coords.rx || coords.ry || coords.rz ) {
					view.$el.attr("data-rotate-x", coords.rx || 0 );
					view.$el.attr("data-rotate-y", coords.ry || 0 );
					view.$el.attr("data-rotate-z", coords.rz || 0 );
				}
				return this;
			},
			getItemViewCoords: function(view, index) {
				var that = view.model.id;
				return this._coordsByModel[that] || this.layout(view.model, null ,index);
			},
			initializeCoords: function( _collection ) {
				var self = this;
				_collection = _collection || this.collection;
				this._coordsByModel = {};
				this.triggerMethod("before:layout", _collection );
				_collection.each(function(model,models,ix) {
					var that = model.id;
					var coords = self._coordsByModel[that] = self.layout(model,models,ix);
					if (options.follow) {
						var followed = model.get(options.follow);
						if (followed && followed instanceof Backbone.Collection ) self.initializeCoords( followed );
					}
				});
				this.triggerMethod("layout", _collection );
			},
			// Timewarp layout.
			layoutTimewarp: function(model, ix, collection) {
				var SCALE = 250;
				var coords = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 }
				coords.x = SCALE*ix; // Math.round((ix/7)*200);
				coords.y = (ix%7)*SCALE; // Math.round((ix%7)*200);
				coords.z = Math.round(ix*ix*SCALE);
				coords.scale = 1;
				coords.rotate = ix*25;
				return coords;
			},
			// default layout. TODO: make it better
			layoutDefault: function(model, ix, collection) {
				var SCALE = 250;
				var coords = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 }
				coords.x = SCALE*ix; // Math.round((ix/7)*200);
				coords.y = (ix%7)*SCALE; // Math.round((ix%7)*200);
				coords.z = Math.round(ix*SCALE);
				coords.scale = 1;
				coords.rotate = ix*20;
				return coords;
			},
			layoutRacks: function(model, ix, collection) {
				var SCALE = 250;
				var coords = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 }
				coords.x = SCALE*ix; // Math.round((ix/7)*200);
				coords.y = Math.round((ix%7)*SCALE);
				coords.z = Math.round(ix*SCALE*2);
				coords.scale = 1;
				coords.rotate = 1; // ix*20;
				return coords;
			},
			layoutModel: function(model, ix, collection) {
				return _.extend({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 }, model.toJSON());
			},
			onShow: function(x) {
				this.activated3D = false;
				var self = this;
				setTimeout( function() { self.activate3D.apply(self, x) }, 10);
			},
			activate3D: function() {
				var self = this;
				DEBUG && console.debug("Activating 3D:", this, this.$el)
				this.$el.jmpress({
//					stepSelector: '.step',
					fullscreen: false, // or container mode
					viewPort: {
						width: 800,
						height: 600,
					},
					animation: _.extend({
						transformOrigin: 'center center', // Point on which to transform (unused)
						transitionDuration: '1s',         // Length of animation
						transitionDelay: '50ms',         // Delay before animating
						transitionTimingFunction: 'ease'  // Animation effect
					}, options.animation ),
					transitionDuration: 10,
					setActive : function( element, eventData ) {
						var $dom = $("[about]", eventData.delegatedFrom);
						var that = $dom.attr("about");
						var model = self.collection.get(that);
						self.triggerMethod("select", model);
						self.$el.off("click.ux_activate");
						self.$el.on("click.ux_activate", function(ui,event){
DEBUG && console.log("Trigger 3D Active", self, $(this), ui, event, model );
							self.triggerMethod("activate", model);
						})
					}
				});
				this.$el.on("enterStep", function(event) {
DEBUG && console.log("Enter 3D Step", self, event, $(this));
				    self.triggerMethod("step:enter", event);
				})
				this.$el.on("leaveStep", function(event) {
DEBUG && console.log("Leave 3D Step", self, event, $(this));
				    self.triggerMethod("step:leave", event);
				})
				this.$el.fadeIn();
				this.activated3D = true;
//				this.triggerMethod("activate" );
				return this;
			},
			select: function(selected) {
				if (!this.activated3D) {
					return;
				}
				this._select(selected);
			},
			_select: my.factcore.UX.mixin.Selectable.select,
			selectItem: function(model) {
				var uid = my.factcore.UX.uid( model.id );
console.log("Select 3D Item:",this, uid, model);
				this.$el.jmpress("select", "#"+uid);
			}
		});
		return Dashboard3D;
	}

})(jQuery, window);

