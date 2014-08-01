(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:Grid"] = function(options) {
		options = my.factcore.UX.checkOptions(options, ["this", "label", "meta"]);
		options = my.factcore.UX.decorate(options);
		options = _.extend({DEBUG: true, paging: false, selectable: false}, options);
		if (options.meta instanceof Array) options.meta = new Backbone.Collection(options.meta);

		if (!(options.meta instanceof Backbone.Collection)) throw "urn:factcore:ux:oops:invalid-meta-collection";

		var DEBUG = options.DEBUG && my.factcore.UX.DEBUG; // master DEBUG kill-switch
/*
		var xsd2cell = {
			my.factcore.NS.xsd+"boolean":	"boolean",
			my.factcore.NS.xsd+"string": 	Backgrid.StringCell,
			my.factcore.NS.xsd+"number":	Backgrid.NumberCell,
			my.factcore.NS.xsd+"integer":	Backgrid.IntegerCell,
			my.factcore.NS.xsd+"email":		Backgrid.EmailCell,
			my.factcore.NS.xsd+"datetime":	Backgrid.DatetimeCell,
			my.factcore.NS.xsd+"date":		Backgrid.DateCell,
			my.factcore.NS.xsd+"time":		Backgrid.TimeCell,
			my.factcore.NS.xsd+"anyURI":	Backgrid.UriCell,
		}
*/
DEBUG && console.debug("UX Grid: ", options);
		// handle meta / columns
		options.columnTransformer = options.columnTransformer || function(c) {
			return _.extend({
				name:       c.get("id") || my.factcore.fact.localName(c.id),
				label:      c.get('label') || c.id,
				editable:   c.get('editable')?true:false,
				renderable: c.has('visible')?(c.get('visible')?true:false):true,
				sortable:   c.get('sortable')?true:false,
				formatter:  c.get('formatter'),
				headerCell: c.get('headerCell'),
				cell:       my.factcore.fact.localName( c.get('type') ) || "string"
			}, c.attributes);
		}

		// build Widgets

		var GridFooter = null;
		if (options.paging) {
			GridFooter = Backgrid.Extension.Paginator.extend({
				lastPage: 0,
				fastForwardHandleLabels: { first: "&le;", prev: "&lang;", next: "&rang;", last: "&ge;" }
			});
DEBUG && console.debug("Grid Footer: ", options.paging, GridFooter);
		}

		var Grid = Backgrid.Grid.extend( _.extend({
			className: my.factcore.UX.stylize("ux_grid box table table-striped table-bordered table-hover",options),
			footer: GridFooter,
			events: { "xclick": "doEventSelectRow" },
			emptyText: "No "+options.label,
			org_initialize: function (options) {
				var self = this;
				Backgrid.requireOptions(options, ["collection"]); //"columns",

                var _columns = options.meta.map(options.columnTransformer);
                var columns = new my.factcore.fact.factory.FactModels( _columns );
				this.columns = columns;
DEBUG && console.debug("Init Grid Columns: ", _columns, columns );

                if (options.selectable) {
                    columns.add({ name: "_selected_", cell: "select-row", headerCell: Backgrid.Extension.SelectAllHeaderCell });
                }

				var passedThruOptions = _.omit(options, ["el", "id", "attributes", "className", "tagName", "events", "columns"]);
				passedThruOptions.columns = columns.toJSON();

                this.row = Backgrid.Row.extend({
                    columns: columns,
                    events: { "click": "doEventSelectRow" },
                    initialize: function() {
DEBUG && console.log("Row Initialize:", this);
                    },
                    doEventSelectRow: function (that,x) {
DEBUG && console.log("Row Selected:", this, that, x);
                        my.factcore.UX.mixin.Common.doSelect.call(this, this.model);
                    }
                } );
console.log("Grid Header init: ", passedThruOptions);

				var Header = options.header || Backgrid.Header;
				this.header = new Header(passedThruOptions);
//				this.header.columns = this.columns; // .toJSON()
				this.header.collection = this.collection;

				var Body = options.body || this.body;
				this.body = new Body(passedThruOptions);

				var Footer = options.footer || this.footer;
				if (Footer) {
				  this.footer = new Footer(passedThruOptions);
				}

				this.listenTo(options.meta, "all", function (event, x, y, z) {
DEBUG && console.debug("Changed %s Columns: %o %o", event, self.options, self.columns);
//					self.header = new Header(passedThruOptions);
					self.initialize(options);
				});

				this.listenTo(this.columns, "reset", function () {
DEBUG && console.log("Reset Columns: ", this, this.columns)
				  this.header = new (this.header.remove().constructor)(passedThruOptions);
				  this.body = new (this.body.remove().constructor)(passedThruOptions);
				  if (this.footer) {
					this.footer = new (this.footer.remove().constructor)(passedThruOptions);
				  }
				  this.render();
				});

				this.listenTo(this.collection, "backgrid:select", function () {
					console.log("BackGrid Selected", self, this);
				});
			  },

			initialize: function() {
				var self = this;
				my.factcore.UX.model(options, this);
				this.org_initialize(options);
DEBUG && console.debug("Grid Columns: ", this.columns);

				if (!this.collection) throw "urn:factcore:ux:oops:missing-collection";
//				this.collection.on("change", function(that) { if (self.collection.length>10) {self.footer=Backgrid.Paginator} else {self.footer = null}; self.trigger("render", that); });
				this.collection.on("select", function (selection) { self.trigger("select", selection); });
			},
			doEventSelectRow: function (ui, event) {
DEBUG && console.log("Grid Row Selected:", this, event );
			}
		}, my.factcore.UX.mixin.Common ) );

		return Grid;
	}

})(jQuery, window);
