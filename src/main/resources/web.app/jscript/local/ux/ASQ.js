(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:ASQ"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var DEBUG = true;

		var ASQ = Backbone.Marionette.ItemView.extend({
			template: "<div class='navbar'><div class='navbar-inner'><span class='brand'>{{label}}</span><span class='btn-group'><span class='ux_asq_where btn'>WHERE</span><span class='divider-vertical'>|</span></span><span class='ux_asq_select search-query'></span></div></div>",
			className: "ux_asq container",
			initialize: function() {
				my.factcore.UX.model(options, this);
				this.parseASQ(this.model.get("urn:factcore:asq:query"));
			},
			parseASQ: function(query) {
				this.asq = {};
				this.asq.where = new Backbone.Collection(query.where);
				DEBUG && console.debug("Parsed ASQ:", this.asq);
			},
			onShow: function() {
				this.activateTaggedSelector( { selector: ".ux_asq_select", label: "Select a Field", tags: ["red", "green", "blue", "Number"] } );
			},

			activateTaggedSelector: function(_options) {
				var self = this;
				var $where = $(_options.selector,this.$el);
				var where = this.asq.where;
				$where.html("<input/>");
				$select = $("input",$where);
				var tags = this.collection?this.collection.toJSON():_options.tags;

				var activateSelections = function() {
					// add popover, make tags sortable
					$select.select2("container").find("ul.select2-choices").sortable({ containment: 'parent', start: function() { $select.select2("onSortStart"); },
						update: function() { $select.select2("onSortEnd"); }
					});
					var $choices = $(".select2-choices li.select2-search-choice", $where).popover({title: function(event,ui) {
						return $("div", this).clone();
					}, content: function(event,ui) {
						return "stuff"
					}, container: "body", placement: "bottom", trigger: "click", html: true})				// make tags into a drop target
console.log("Activate Select/Dropping:", $where, $select, $choices);
				}
				var toSelect2 = function(model) {
					return _.extend({ id: model.get("this"), label: model.get("has") }, model.toJSON() );
				}

				var initTags = function(clause) {
					var data = [];
					where.each(function(clause) {
						var _clause = toSelect2(clause);
						data.push( _clause )
console.debug("ASQ Clause: ", clause, _clause, data);
					})
console.debug("ASQ Tags: ", data);
					return data;
				}
				var _tags = initTags(where);
console.log("ASQ Where Tags: ", _tags)

				// activate the selection
console.log("Activate Tags:", where, tags);
				$select.select2({ placeholder: _options.label, separator: "|", allowClear: true, multiple: true, tags: tags, tokenSeparators: [","], minimumInputLength: 0,
					initSelection: function(element, onSelect) {
console.debug("Init Selection", this, element, element.val());
//						var data = [];
//						$(element.val().split("|")).each(function () { data.push(this) });
						onSelect(_tags);
					},
					tags: function() {
//TODO: bindings are for demo only
						self.collection.fetch( { "that": "urn:factcore:ux:View" });
//						var reply = _.map(self.collection.toJSON(), function(val,key,all) {
//							return _.extend( val, { id: val["this"], text: val.label })
//						});
						var tags = self.collection.toJSON();
//console.log("ASQ Tags: ", tags)
						return tags;
					}, createSearchChoice: function(term, data) {
						var uid = my.factcore.UX.uid(term);
return { "id": this["this"]+"#"+uid, "text": term, userDefined: true, optional: true }
//						return null; // user created tags are not allowed
					}, formatResult: function(model, $container, query) {
console.debug("ASQ FR:", model);
//						return "<div><i>"+model.domain_label+"</i><b> "+model.label+" </b><i>"+model.range_label+"</i></div>"+(model.comment?"<div>"+model.comment+"</div>":"");
						return "<div title='"+(model.comment?model.comment:"")+"'><b> "+model.label+" </b></div>";
					}, formatSelection: function(model, $container, query) {
						var css = model.userDefined?"label-info":"";
//						$container.addClass(css);
console.debug("ASQ FS:" ,model, css)
						return "<b class='label "+css+"'>"+model.label+"</b>";
					}, matcher: function(term, choice, opt) {
					   console.debug("ASQ match:", term, choice, opt)
					   return choice.label.toUpperCase().indexOf(term.toUpperCase())>=0;
					}, id: function(choice) {
						return choice["this"] || choice.id;
					}
				});

				$select.on("change", activateSelections );

				$where.droppable({
					drop: function(event, ui){
						var model = $(ui.helper).data("urn:factcore:ux:model:drag");
						if (!model) return; // probably just sorting
						var vars = $select.select2("val");
						var label = model.get("label");
						if (label) {
							vars.push(label);
							$select.select2("val", vars);
							activateSelections();
						}
					}
				})
				$select.select2("val", _.pluck(_tags, "this") );
				return this;
			}
		});
		return ASQ;
	}

})(jQuery, window);

