/*jshint multistr:true */

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function($, ux) {

ux.TinyInbox = Backbone.View.extend({

	template: '<div class="btn-group">\
	   <a href="javascript:void(0)" class="btn btn-small btn-inverse dropdown-toggle" data-toggle="dropdown"><span class="mail-sticker"></span><i class="cus-email"></i></a>\
		<div class="dropdown-menu toolbar pull-right"><ul class="mailbox"></ul></div>\
	</div>',

	paneTemplate: '<li><a>\
			 {{label}}\
			 <img src="{{image}}"/>\
			 <div>{{comment}}.</div>\
	</a> </li>',

  initialize: function(options) {
	my.scorpio4.UX.model(options,this);
    var self = this;
    this.el = $(this.el);
    this.visible = true;

    var stateData = _.extend({},options.state);
    this.state = new recline.Model.ObjectState(stateData);

    // Listen to changes in the fields
    this.model.fields.bind('change', function() {
//      self.render();
    });

    // Listen to changes in the records
    this.model.records.bind('add', function(doc){self.redraw('add',doc);});
    this.model.records.bind('change', function(doc){
      self.render();
        self.redraw('remove',doc);
        self.redraw('add',doc);
    });
    this.model.records.bind('remove', function(doc){self.redraw('remove',doc);});
    this.model.records.bind('reset', function(){self.redraw('reset');});


    this.state.bind('change', function() {
      self.render();
    });
    this.bind("show", function() {
    	alert("show");
    })
    this.render();
  },

  // ## Customization Functions
  //
  // The following methods are designed for overriding in order to customize
  // behaviour

  // ### Public: Adds the necessary elements to the page.
  //
  // Also sets up the editor fields and the map if necessary.
  render: function() {
    var self = this;
    var htmls = Mustache.render(this.template, this.model.toTemplateJSON());
    var $body = $(this.el).html(htmls);
	this.redraw();
    return this;
  },

  // ### Public: Redraws the features on the TinyInbox onto the Dom
  //
  // Actions can be:
  //
  // * reset: Clear all features
  // * add: Add one or n features (records)
  // * remove: Remove one or n features (records)
  // * refresh: Clear existing features and add all current records
  redraw: function(){
    var self = this;
	var $ul = $("ul.mailbox", this.$el);
	$ul.empty();
	var paneTemplate = this.paneTemplate;
    this.model.records.forEach(function(doc) {
		var row = Mustache.render(paneTemplate, doc.toJSON());
		$ul.append(row);
    });
    var $badge = $(".mail-sticker", this.$el);
    $badge.text(this.model.records.length);
  },

  show: function() {
    this.visible = true;
    this.redraw();
    $(this.el).show();
  },

  hide: function() {
    this.visible = false;
    $(this.el).hide();
  },

});

})(jQuery, recline.View);
