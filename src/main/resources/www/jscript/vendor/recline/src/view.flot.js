/*jshint multistr:true */

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function($, my) {

// ## Graph view for a Dataset using Flot graphing library.
//
// Initialization arguments (in a hash in first parameter):
//
// * model: recline.Model.Dataset
// * state: (optional) configuration hash of form:
//
//        {
//          group: {column name for x-axis},
//          series: [{column name for series A}, {column name series B}, ... ],
//          graphType: 'line',
//          graphOptions: {custom [flot options]}
//        }
//
// NB: should *not* provide an el argument to the view but must let the view
// generate the element itself (you can then append view.el to the DOM.
my.Flot = Backbone.View.extend({
  template: ' \
    <div class="recline-flot"> \
      <div class="panel graph" style="display: block;"> \
        <div class="js-temp-notice alert alert-block"> \
          <h3 class="alert-heading">Hey there!</h3> \
          <p>There\'s no graph here yet because we don\'t know what fields you\'d like to see plotted.</p> \
          <p>Please tell us by <strong>using the menu on the right</strong> and a graph will automatically appear.</p> \
        </div> \
      </div> \
    </div> \
',

  initialize: function(options) {
    var self = this;
    this.graphColors = ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"];

    this.el = $(this.el);
    _.bindAll(this, 'render', 'redraw', '_toolTip', '_xaxisLabel');
    this.needToRedraw = false;
    this.model.bind('change', this.render);
    this.model.fields.bind('reset', this.render);
    this.model.fields.bind('add', this.render);
    this.model.records.bind('add', this.redraw);
    this.model.records.bind('reset', this.redraw);
    var stateData = _.extend({
        group: null,
        // so that at least one series chooser box shows up
        series: [],
        graphType: 'lines-and-points'
      },
      options.state
    );
    this.state = new recline.Model.ObjectState(stateData);
    this.previousTooltipPoint = {x: null, y: null};
    this.editor = new my.FlotControls({
      model: this.model,
      state: this.state.toJSON()
    });
    this.editor.state.bind('change', function() {
      self.state.set(self.editor.state.toJSON());
      self.redraw();
    });
    this.elSidebar = this.editor.el;
  },

  render: function() {
    var self = this;
    var tmplData = this.model.toTemplateJSON();
    var htmls = Mustache.render(this.template, tmplData);
    $(this.el).html(htmls);
    this.$graph = this.el.find('.panel.graph');
    this.$graph.on("plothover", this._toolTip);
    return this;
  },

  redraw: function() {
    // There are issues generating a Flot graph if either:
    // * The relevant div that graph attaches to his hidden at the moment of creating the plot -- Flot will complain with
    //   Uncaught Invalid dimensions for plot, width = 0, height = 0
    // * There is no data for the plot -- either same error or may have issues later with errors like 'non-existent node-value'
    var areWeVisible = !jQuery.expr.filters.hidden(this.el[0]);
    if ((!areWeVisible || this.model.records.length === 0)) {
      this.needToRedraw = true;
      return;
    }

    // check we have something to plot
    if (this.state.get('group') && this.state.get('series')) {
      var series = this.createSeries();
      var options = this.getGraphOptions(this.state.attributes.graphType, series[0].data.length);
      this.plot = $.plot(this.$graph, series, options);
    }
  },

  show: function() {
    // because we cannot redraw when hidden we may need to when becoming visible
    if (this.needToRedraw) {
      this.redraw();
    }
  },

  // infoboxes on mouse hover on points/bars etc
  _toolTip: function (event, pos, item) {
    if (item) {
      if (this.previousTooltipPoint.x !== item.dataIndex ||
          this.previousTooltipPoint.y !== item.seriesIndex) {
        this.previousTooltipPoint.x = item.dataIndex;
        this.previousTooltipPoint.y = item.seriesIndex;
        $("#recline-flot-tooltip").remove();

        var x = item.datapoint[0].toFixed(2),
            y = item.datapoint[1].toFixed(2);

        var content = _.template('<%= group %> = <%= x %>, <%= series %> = <%= y %>', {
          group: this.state.attributes.group,
          x: this._xaxisLabel(x),
          series: item.series.label,
          y: y
        });

        // use a different tooltip location offset for bar charts
        var xLocation, yLocation;
        if (this.state.attributes.graphType === 'bars') {
          xLocation = item.pageX + 15;
          yLocation = item.pageY;
        } else {
          xLocation = item.pageX + 10;
          yLocation = item.pageY - 20;
        }

        $('<div id="recline-flot-tooltip">' + content + '</div>').css({
            top: yLocation,
            left: xLocation
        }).appendTo("body").fadeIn(200);
      }
    } else {
      $("#recline-flot-tooltip").remove();
      this.previousTooltipPoint.x = null;
      this.previousTooltipPoint.y = null;
    }
  },

  _xaxisLabel: function (x) {
    var xfield = this.model.fields.get(this.state.attributes.group);

    // time series
    var xtype = xfield.get('type');
    var isDateTime = (xtype === 'date' || xtype === 'date-time' || xtype  === 'time');

    if (this.model.records.models[parseInt(x, 10)]) {
      x = this.model.records.models[parseInt(x, 10)].get(this.state.attributes.group);
      if (isDateTime) {
        x = new Date(x).toLocaleDateString();
      }
    } else if (isDateTime) {
      x = new Date(parseInt(x, 10)).toLocaleDateString();
    }

    return x;
  },

  // ### getGraphOptions
  //
  // Get options for Flot Graph
  //
  // needs to be function as can depend on state
  //
  // @param typeId graphType id (lines, lines-and-points etc)
  // @param numPoints the number of points that will be plotted
  getGraphOptions: function(typeId, numPoints) {
    var self = this;

    var tickFormatter = function (x) {
      // convert x to a string and make sure that it is not too long or the
      // tick labels will overlap
      // TODO: find a more accurate way of calculating the size of tick labels
      var label = self._xaxisLabel(x);

      if (typeof label !== 'string') {
        label = label.toString();
      }
      if (label.length > 8) {
        label = label.slice(0, 5) + "...";
      }

      return label;
    };

    var xaxis = {};
    xaxis.tickFormatter = tickFormatter;

    // calculate the x-axis ticks
    //
    // the number of ticks should be a multiple of the number of points so that
    // each tick lines up with a point
    if (numPoints) {
      var ticks = [],
          maxTicks = 10,
          x = 1,
          i = 0;

      while (x <= maxTicks) {
        if ((numPoints / x) <= maxTicks) {
          break;
        }
        x = x + 1;
      }

      for (i = 0; i < numPoints; i = i + x) {
        ticks.push(i);
      }

      xaxis.ticks = ticks;
    }

    var yaxis = {};
    yaxis.autoscale = true;
    yaxis.autoscaleMargin = 0.02;

    var legend = {};
    legend.position = 'ne';

    var grid = {};
    grid.hoverable = true;
    grid.clickable = true;
    grid.borderColor = "#aaaaaa";
    grid.borderWidth = 1;

    var optionsPerGraphType = {
      lines: {
        legend: legend,
        colors: this.graphColors,
        lines: { show: true },
        xaxis: xaxis,
        yaxis: yaxis,
        grid: grid
      },
      points: {
        legend: legend,
        colors: this.graphColors,
        points: { show: true, hitRadius: 5 },
        xaxis: xaxis,
        yaxis: yaxis,
        grid: grid
      },
      'lines-and-points': {
        legend: legend,
        colors: this.graphColors,
        points: { show: true, hitRadius: 5 },
        lines: { show: true },
        xaxis: xaxis,
        yaxis: yaxis,
        grid: grid
      },
      bars: {
        legend: legend,
        colors: this.graphColors,
        lines: { show: false },
        xaxis: yaxis,
        yaxis: xaxis,
        grid: grid,
        bars: {
          show: true,
          horizontal: true,
          shadowSize: 0,
          align: 'center',
          barWidth: 0.8
        }
      },
      columns: {
        legend: legend,
        colors: this.graphColors,
        lines: { show: false },
        xaxis: xaxis,
        yaxis: yaxis,
        grid: grid,
        bars: {
          show: true,
          horizontal: false,
          shadowSize: 0,
          align: 'center',
          barWidth: 0.8
        }
      }
    };

    if (self.state.get('graphOptions')) {
      return _.extend(optionsPerGraphType[typeId],
                      self.state.get('graphOptions'));
    } else {
      return optionsPerGraphType[typeId];
    }
  },

  createSeries: function() {
    var self = this;
    var series = [];
    _.each(this.state.attributes.series, function(field) {
      var points = [];
      _.each(self.model.records.models, function(doc, index) {
        var xfield = self.model.fields.get(self.state.attributes.group);
        var x = doc.getFieldValue(xfield);

        // time series
        var xtype = xfield.get('type');
        var isDateTime = (xtype === 'date' || xtype === 'date-time' || xtype  === 'time');

        if (isDateTime) {
          if (self.state.attributes.graphType != 'bars' &&
              self.state.attributes.graphType != 'columns') {
            x = new Date(x).getTime();
          } else {
            x = index;
          }
        } else if (typeof x === 'string') {
          x = parseFloat(x);
          if (isNaN(x)) {
            x = index;
          }
        }

        var yfield = self.model.fields.get(field);
        var y = doc.getFieldValue(yfield);

        if (self.state.attributes.graphType == 'bars') {
          points.push([y, x]);
        } else {
          points.push([x, y]);
        }
      });
      series.push({
        data: points,
        label: field,
        hoverable: true
      });
    });
    return series;
  }
});

my.FlotControls = Backbone.View.extend({
  className: "editor",
  template: ' \
  <div class="editor"> \
    <form class="form-stacked"> \
      <div class="clearfix"> \
        <label>Graph Type</label> \
        <div class="input editor-type"> \
          <select> \
          <option value="lines-and-points">Lines and Points</option> \
          <option value="lines">Lines</option> \
          <option value="points">Points</option> \
          <option value="bars">Bars</option> \
          <option value="columns">Columns</option> \
          </select> \
        </div> \
        <label>Group Column (Axis 1)</label> \
        <div class="input editor-group"> \
          <select> \
          <option value="">Please choose ...</option> \
          {{#fields}} \
          <option value="{{id}}">{{label}}</option> \
          {{/fields}} \
          </select> \
        </div> \
        <div class="editor-series-group"> \
        </div> \
      </div> \
      <div class="editor-buttons"> \
        <button class="btn editor-add">Add Series</button> \
      </div> \
      <div class="editor-buttons editor-submit" comment="hidden temporarily" style="display: none;"> \
        <button class="editor-save">Save</button> \
        <input type="hidden" class="editor-id" value="chart-1" /> \
      </div> \
    </form> \
  </div> \
',
  templateSeriesEditor: ' \
    <div class="editor-series js-series-{{seriesIndex}}"> \
      <label>Series <span>{{seriesName}} (Axis 2)</span> \
        [<a href="#remove" class="action-remove-series">Remove</a>] \
      </label> \
      <div class="input"> \
        <select> \
        {{#fields}} \
        <option value="{{id}}">{{label}}</option> \
        {{/fields}} \
        </select> \
      </div> \
    </div> \
  ',
  events: {
    'change form select': 'onEditorSubmit',
    'click .editor-add': '_onAddSeries',
    'click .action-remove-series': 'removeSeries'
  },

  initialize: function(options) {
    var self = this;
    this.el = $(this.el);
    _.bindAll(this, 'render');
    this.model.fields.bind('reset', this.render);
    this.model.fields.bind('add', this.render);
    this.state = new recline.Model.ObjectState(options.state);
    this.render();
  },

  render: function() {
    var self = this;
    var tmplData = this.model.toTemplateJSON();
    var htmls = Mustache.render(this.template, tmplData);
    this.el.html(htmls);

    // set up editor from state
    if (this.state.get('graphType')) {
      this._selectOption('.editor-type', this.state.get('graphType'));
    }
    if (this.state.get('group')) {
      this._selectOption('.editor-group', this.state.get('group'));
    }
    // ensure at least one series box shows up
    var tmpSeries = [""];
    if (this.state.get('series').length > 0) {
      tmpSeries = this.state.get('series');
    }
    _.each(tmpSeries, function(series, idx) {
      self.addSeries(idx);
      self._selectOption('.editor-series.js-series-' + idx, series);
    });
    return this;
  },

  // Private: Helper function to select an option from a select list
  //
  _selectOption: function(id,value){
    var options = this.el.find(id + ' select > option');
    if (options) {
      options.each(function(opt){
        if (this.value == value) {
          $(this).attr('selected','selected');
          return false;
        }
      });
    }
  },

  onEditorSubmit: function(e) {
    var select = this.el.find('.editor-group select');
    var $editor = this;
    var $series  = this.el.find('.editor-series select');
    var series = $series.map(function () {
      return $(this).val();
    });
    var updatedState = {
      series: $.makeArray(series),
      group: this.el.find('.editor-group select').val(),
      graphType: this.el.find('.editor-type select').val()
    };
    this.state.set(updatedState);
  },

  // Public: Adds a new empty series select box to the editor.
  //
  // @param [int] idx index of this series in the list of series
  //
  // Returns itself.
  addSeries: function (idx) {
    var data = _.extend({
      seriesIndex: idx,
      seriesName: String.fromCharCode(idx + 64 + 1)
    }, this.model.toTemplateJSON());

    var htmls = Mustache.render(this.templateSeriesEditor, data);
    this.el.find('.editor-series-group').append(htmls);
    return this;
  },

  _onAddSeries: function(e) {
    e.preventDefault();
    this.addSeries(this.state.get('series').length);
  },

  // Public: Removes a series list item from the editor.
  //
  // Also updates the labels of the remaining series elements.
  removeSeries: function (e) {
    e.preventDefault();
    var $el = $(e.target);
    $el.parent().parent().remove();
    this.onEditorSubmit();
  }
});

})(jQuery, recline.View);
