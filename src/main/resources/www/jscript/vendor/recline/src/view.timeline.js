/*jshint multistr:true */

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function($, my) {
// turn off unnecessary logging from VMM Timeline
if (typeof VMM !== 'undefined') {
  VMM.debug = false;
}

// ## Timeline
//
// Timeline view using http://timeline.verite.co/
my.Timeline = Backbone.View.extend({
  template: ' \
    <div class="recline-timeline"> \
      <div id="vmm-timeline-id"></div> \
    <div style="clear:both;"><br/></div></div>',

  // These are the default (case-insensitive) names of field that are used if found.
  // If not found, the user will need to define these fields on initialization
  startFieldNames: ['date','startdate', 'start', 'start-date'],
  endFieldNames: ['end','endDate'],
  elementId: '#vmm-timeline-id',

  initialize: function(options) {
    var self = this;
    this.el = $(this.el);
    this.timeline = new VMM.Timeline();
    this._timelineIsInitialized = false;
    this.model.fields.bind('reset', function() {
      self._setupTemporalField();
    });
    this.model.records.bind('all', function() {
      self.reloadData();
    });
    var stateData = _.extend({
        startField: null,
        headline: "title",
        endField: null
      },
      options.state
    );
    this.state = new recline.Model.ObjectState(stateData);
    this._setupTemporalField();
  },

  render: function() {
    var tmplData = {};
    var htmls = Mustache.render(this.template, tmplData);
    this.el.html(htmls);
    // can only call _initTimeline once view in DOM as Timeline uses $
    // internally to look up element
    if ($(this.elementId).length > 0) {
      this._initTimeline();
    }
  },

  show: function() {
    // only call _initTimeline once view in DOM as Timeline uses $ internally to look up element
    if (this._timelineIsInitialized === false) {
      this._initTimeline();
    }
  },

  _initTimeline: function() {
    var $timeline = this.el.find(this.elementId);
    // set width explicitly o/w timeline goes wider that screen for some reason
    var width = Math.max(this.el.width(), this.el.find('.recline-timeline').width());
    if (width) {
      $timeline.width(width);
    }
    var config = {};
    var data = this._timelineJSON();
    this.timeline.init(data, this.elementId, config);
    this._timelineIsInitialized = true
  },

  reloadData: function() {
    if (this._timelineIsInitialized) {
      var data = this._timelineJSON();
      this.timeline.reload(data);
    }
  },

  // Convert record to JSON for timeline
  //
  // Designed to be overridden in client apps
  convertRecord: function(record, fields) {
    return this._convertRecord(record, fields);
  },

  // Internal method to generate a Timeline formatted entry
  _convertRecord: function(record, fields) {
    var start = this._parseDate(record.get(this.state.get('startField')));
    var end = this._parseDate(record.get(this.state.get('endField')));
    if (start) {
      var tlEntry = {
        "startDate": start,
        "endDate": end,
        "headline": String(record.get(this.state.get('headline')) || ''),
        "text": record.get('description') || record.summary()
      };

      return tlEntry;
    } else {
      return null;
    }
  },

  _timelineJSON: function() {
    var self = this;
    var out = {
      'timeline': {
        'type': 'default',
        'headline': '',
        'date': [
        ]
      }
    };
    this.model.records.each(function(record) {
      var newEntry = self.convertRecord(record, self.fields);
      if (newEntry) {
        out.timeline.date.push(newEntry); 
      }
    });
    // if no entries create a placeholder entry to prevent Timeline crashing with error
    if (out.timeline.date.length === 0) {
      var tlEntry = {
        "startDate": '2000,1,1',
        "headline": 'No data to show!'
      };
      out.timeline.date.push(tlEntry);
    }
    return out;
  },

  _parseDate: function(date) {
    if (!date) {
      return null;
    }
    var out = date.trim();
    out = out.replace(/(\d)th/g, '$1');
    out = out.replace(/(\d)st/g, '$1');
    out = out.trim() ? moment(out) : null;
    if (out.toDate() == 'Invalid Date') {
      return null;
    } else {
      return out.toDate();
    }
  },

  _setupTemporalField: function() {
    this.state.set({
      startField: this._checkField(this.startFieldNames),
      endField: this._checkField(this.endFieldNames)
    });
  },

  _getHeadlineField: function() {
	return 'title';
  },

  _checkField: function(possibleFieldNames) {
    var modelFieldNames = this.model.fields.pluck('id');
    for (var i = 0; i < possibleFieldNames.length; i++){
      for (var j = 0; j < modelFieldNames.length; j++){
        if (modelFieldNames[j].toLowerCase() == possibleFieldNames[i].toLowerCase())
          return modelFieldNames[j];
      }
    }
    return null;
  }
});

})(jQuery, recline.View);
