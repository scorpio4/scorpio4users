(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:Tree"] = function(options) {
		options = my.factcore.UX.checkOptions(options, ["this", "label"]);
		var DEBUG = true;

		/** TreeBranch **/
		var TreeBranch = Backbone.Marionette.CompositeView.extend({
			initialize: function(_options) {
		        var follow_this = options.follow;
				this.collection = follow_this?this.model.get(follow_this):this.collection;
				DEBUG && console.debug("Init Branch", this.collection?"leaves: "+this.collection.length:"leaf", this.model.id, this, follow_this, _options )
			},
			appendHtml: function($el,iv) {
				DEBUG && console.debug("Append Branch", this, this.model.id, $el, iv)
				$el.$("li:first").append(iv.el);
			},
			onRender: function(_options) {
				DEBUG && console.debug("Render Branch", this, this.model.id, _options)
			},
			tagName: "li",
			template: "<span class='selectable' about='{{this}}' title='{{comment}}'>{{label}}</span>"
		});

		var Tree = Backbone.Marionette.CompositeView.extend( _.extend({
			itemView: TreeBranch, tagName: "ul",
			className: my.factcore.UX.stylize("ux_tree", options), itemViewContainer: "ul",
			template: "<li about='{{this}}' title='{{comment}}'>{{label}}<ul></ul></li>",
			events: {
			  'click .selectable': 'doEventSelect'
			},
			initialize: function(_options) {
				my.factcore.UX.model(_options, this);
				DEBUG && console.debug("Init Tree Root", this, _options);
			},
			x_appendHtml: function(collectionView, itemView, index) {
				var $container = this.getItemViewContainer(collectionView);
				DEBUG && console.debug("Append View", $container, collectionView, itemView, collectionView.$itemViewContainer)
				$container.append(itemView.el);
			},
			onItemviewShow: function () {
				var $nodes = my.factcore.UX.factualize(this, options.factualizer );
//				console.log("Tree:Show: ", options, options.factualizer, $nodes)
//				$tree.jstree({ core : {},	plugins : [ "themes", "html_data" ] });
//$nodes.prepend("<i class='icon-cog'></i>");
				return this;
			},
			selectItem: function(model) {
				this.$el.find(".active").removeClass("active");
				var $item = this.$el.find("[about='"+model.id+"']");
DEBUG && console.debug("Select Node:", model, $item);
				$item.addClass("active");
			}
		}, my.factcore.UX.mixin.Common, options ),{
			sample: "<div class='ux_sample'><label>{{label}}</label><ul class='ux_toggled'><li>Tree 1<ul class='ux_tree_branch'><li>Tree 1.1</li><li>Tree 1.2</li></ul></li><li>Tree 2</li></ul></div>"
		});

		return Tree;
	}


/*
        $('label.toggle').click(function () {
            $(this).parent().children('ul').toggle(200);
        });

*/

})(jQuery, window);
