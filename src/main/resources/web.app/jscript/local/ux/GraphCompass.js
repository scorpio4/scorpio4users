(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:GraphCompass"] = function(options) {
		var DEBUG = true && my.factcore.DEBUG;
		var CENTER = "center";
		// determines the Layout.Border face (north/south/east/west) for each node
		var _getCardinality = function(node) { return node.type || options.defaults.direction; }

		options = my.factcore.UX.checkOptions(options, ["this","label", "collection"]);
		options = my.factcore.UX.decorate(options);

		options.typeOf = options.typeOf || "this";
		options.labelOf = options.labelOf || "label";
		options.viewOf   = _.extend( {}, options.viewOf );
		options.defaults = _.extend( { direction: "north", icon: "../img/jalapeno/types/Resource.png" }, options.defaults );
		options.layout 	 = _.extend( { type: "Border", parameters: { padding: 10, getCardinality: _getCardinality } }, options.layout);

		var toolkit = jsPlumbToolkit.newInstance();

		var _addModels = function(toolkit, models) {
			var _types = {};
			models.each(function(model) {
				var _uid = my.factcore.UX.uid(model.get(options.typeOf));
				var json = model.toJSON();

				if (!_types[_uid]) {
					var json = { "this": model.get(options.typeOf), type: "north", "label": model.get(options.labelOf), icon: options.defaults.icon };
					toolkit.addNode({ "id": _uid, type: json.type, "obj": json });
					_types[_uid] = true;
				}
				toolkit.addEdge({ source: CENTER, target: _uid, data: { type: model.get("label") } });
			})
		}

		console.debug("Graph Options", options );

		var Widget = Backbone.Marionette.ItemView.extend( _.extend({
			template: false,
			className: my.factcore.UX.stylize("ux_graph_compass concept-viewer"),
			initialize: function() {
				my.factcore.UX.model(options, this);
				this.collection.on("change", function(bindings) {
					toolkit.clear();
					var _model = _.extend( { "type": CENTER, icon: modelled.defaults.icon }, this.model.toJSON() );
					DEBUG && console.debug("Collection Changed:", this, bindings, _model);
					toolkit.addNode({ id: CENTER, type: CENTER, obj: _model });
					_addModels(toolkit, this);
				})
			},
			onShow: function() {
				var self = this;
console.log("Rendered Graph:", this, toolkit);
				var config = {
					container: self.$el,
					templateRenderer: "mustache",
					draggable:true,
					zoomable:false,
					palette:{
						nodes:{
							"center":{
								template:"tmplCenter",
								events:{
//									click: function(params) {
//										self.trigger("select:center", params);
//										console.log("Center Clicked:", this, params)
//									},
									dblclick: function(params) {
										self.doSelectConcept(params);
//										self.trigger("select:center", params);
//										console.log("Center Clicked:", this, params)
									}
								}
							},
							"edgeNode":{
								template: "tmplAxisNode",
								events:{
									click: function(params) {
										self.doSelectNode(params);
									}
								}
							 },
							"east":{ parent: "edgeNode" },
							"west":{ parent: "edgeNode" },
							"north":{ parent: "edgeNode" },
							"south":{ parent: "edgeNode" }
						},
						edges:{
							"default":{
								overlays:[
									["Arrow", { location:1, width:10, length:9 }]
								],
								events:{
									"x_mouseenter":function(event, edge, connection) {
										console.dir("edge info ", event, edge, connection);
									},
									"click": function(params) {
										self.trigger("select:edge", params);
										console.log("Edge Clicked:", this, params)
									}
								}
							},
							"north":{
								parent:"default",
								overlays:[
									[ "Label", { label:"North", location:0.5 }],
								]
							},
							"south":{
								parent:"default",
								overlays:[
									[ "Label", { label:"South", location:0.5 }],
								]
							},
							"east":{
								parent:"default",
								overlays:[
									[ "Label", { label:"East", location:0.5 }]
								]
							},
							"west":{
								parent:"default",
								overlays:[
									[ "Label", { label:"West", location:0.5 }]
								],
								events:{
									"click": function(params) {
										self.trigger("select:west", params);
										console.log("West Clicked:", this, params)
									}
								}
							}
						}
					},
					layout: options.layout,
					jsPlumb:{
						Anchors:["Center", ["Top", "Left", "Right", "Bottom"] ],
						PaintStyle:{
							lineWidth:2,
							strokeStyle:"#3b3b42"
						},
						Connector:[ "Straight", { gap:5 } ],
						Endpoint:"Blank"
					}
				};

				setTimeout(function() {
					toolkit.render(config);
				},200)
/*
//				$template.tooltip();
*/
				return this;
			},

			doSelectNode: function(event) {
				var _model = event.node.data.obj;
				console.log("Node Clicked:", this, event, _model);
//				this.trigger("select:node", _model);
//				this.trigger("select", _model);
				this.doSelect(_model);
			},
			doSelectEdge: function(params) {
				var _model = event.node.data.obj;
				console.log("Edge Clicked:", this, _model);
				this.trigger("select:edge", _model);
//				this.trigger("select", _model);
			},
			doSelectConcept: function(event) {
				var _model = event.node.data.obj;
				console.log("Centre Clicked:", this, event, _model);
				this.doSelect(_model);
//				this.trigger("select:center", _model);
//				this.trigger("select", _model);
			}
		}, my.factcore.UX.mixin.Common) );

		return Widget;
	}

})(jQuery, window);


