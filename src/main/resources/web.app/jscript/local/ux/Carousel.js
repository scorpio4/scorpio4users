/*jshint multistr:true */

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function($, ux) {

// ## Carousel view using the Roundabout library.
// http://fredhq.com/projects/roundabout#/learn
//
// Which fields in the data these correspond to can be configured via the state
// (and are guessed if no info is provided).
//
// Initialization arguments are as standard for Dataset Views. State object may
// have the following (optional) configuration options:
//
//
ux.Carousel = Backbone.View.extend({

  template: '<ul class="panel carousel"></ul>',
  paneTemplate: '<li class="panel carousel-pane"><img width="128" src="{{image}}"/><div class="carousel-label">{{label}}</div></li>',

  initialize: function(options) {
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

  // ### Public: Redraws the features on the Carousel according to the action provided
  //
  // Actions can be:
  //
  // * reset: Clear all features
  // * add: Add one or n features (records)
  // * remove: Remove one or n features (records)
  // * refresh: Clear existing features and add all current records
  redraw: function(){
    var self = this;
	var $ul = $("ul.carousel", this.$el);
	$ul.empty();
	var paneTemplate = this.paneTemplate;
    this.model.records.forEach(function(doc) {
		var row = Mustache.render(paneTemplate, doc.toJSON());
		$ul.append(row);
    });
	$ul.roundabout({enableDrag: true, reflect: true, tilt: -2.5});
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

