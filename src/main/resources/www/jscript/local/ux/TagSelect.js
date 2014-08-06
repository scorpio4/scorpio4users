(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:TagSelect"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options);
		var DEBUG = true;
		options = _.extend({ labelProperty: "label", thisProperty: "this" }, options);

		var TagSelect = Backbone.Marionette.ItemView.extend( _.extend({
			className: "ux_tags",
			initialize: function() {
				my.scorpio4.UX.model(options, this);

				// default / over-ride Select2 function
				options.formatResult = options.formatResult&&_.isFunction(options.formatResult)?options.formatResult:function(model, $container, query) {
					return "<div title='"+(model.comment?model.comment:"")+"'><b> "+model.text+" </b></div>"; // query result HTML
				}
				options.formatSelection = options.formatSelection&&_.isFunction(options.formatSelection)?options.formatSelection:function(model, $container, query) {
					return "<b>"+model.text+"</b>"; // tag HTML
				}
				options.matcher = options.matcher&&_.isFunction(options.matcher)?options.matcher:function(term, text, opt) {
				   return text.toUpperCase().indexOf(term.toUpperCase())>=0; // case insensitive match
				}
				if (!options.userChoice) {
					options.createSearchChoice = function(term) {
						return null; // user created tags are not allowed
					}
				}
			},
			render: function() {
				var self = this;
				var $where = this.$el;
				$where.html("<input/>");
				$select = $("input",$where);
				var tags = this.collection?this.collection.toJSON():options.tags;

				// add popover, make tags sortable
				var activateSelections = function() {
					$select.select2("container").find("ul.select2-choices").sortable({ containment: 'parent',
						start: function() { $select.select2("onSortStart"); },
						update: function() { $select.select2("onSortEnd"); }
					});
					var $choices = $(".select2-choices li.select2-search-choice", $where).popover({title: function(event,ui) {
						return $("div", this).clone();
					}, content: function(event,ui) {
						return "stuff"
					}, container: "body", placement: "bottom", trigger: "click", html: true})				// make tags into a drop target
DEBUG && console.log("Activate Select/Dropping:", $where, $select, $choices);
				}

				// activate the selection
DEBUG && console.log("Activate Tags:", $select, this.collection, tags);
				$select.select2({ placeholder: options.label, separator: "|", allowClear: true, multiple: true, tags: tags, tokenSeparators: [","], minimumInputLength: 0,
					tags: function() {
//TODO: bindings are for demo only
						self.collection.fetch( { "that": "urn:scorpio4:ux:View" } );
						var reply = _.map(self.collection.toJSON(), function(val,key,all) {
							return _.extend( val, { id: val[options.thisProperty], text: val[options.labelProperty] })
						});
						return reply;
					}, createSearchChoice: options.createSearchChoice, formatResult: options.formatResult, formatSelection: options.formatSelection, matcher: options.matcher, id: function(choice) {
						return choice[options.thisProperty] || choice.id;
					}
				});

				$select.on("change", activateSelections );

				$where.droppable({
					initSelection: function(element, onSelect) {
						DEBUG && console.debug("Init Selection", this, element, updateSelection )
						var data = [];
						$(element.val().split(",")).each(function () { data.push({id: this, text: this}) });
						updateSelection(data);
					},
					drop: function(event, ui){
						var model = $(ui.helper).data("urn:scorpio4:ux:model:drag");
						if (!model) return; // probably just sorting
						var vars = $select.select2("val");
						var label = model.get(options.labelProperty);
						if (label) {
							vars.push(label);
							$select.select2("val", vars);
							activateSelections();
						}
					}
				})
				return this;
			}
		}), {
			sample: "<div>TagSelect</div>"
		});
		return TagSelect;
	}

})(jQuery, window);

