(function($, my) {

	my.factcore.UX.View["urn:factcore:ux:Calendar"] = function(options) {
		options = my.factcore.UX.checkOptions(options);
		var DEBUG = true;
		options = _.extend({selectable: true, ignoreTimezone: false, editable: true }, options);

		var Calendar = Backbone.Marionette.ItemView.extend({
			template: "<label about='{{this}}'>{{label}}</label>",
			className: "ux_widget",
			initialize: function() {
				my.factcore.UX.model(options, this);
				_.bindAll(this);

				this.collection.bind('reset', this.addAll);
				this.collection.bind('add', this.addOne);
				this.collection.bind('change', this.change);
				this.collection.bind('destroy', this.destroy);
			},
			render: function() {
				this.el.fullCalendar({
					header: {
						left: 'prev,next today',
						center: 'title',
						right: 'month,basicWeek,basicDay'
					},
					selectable: options.selectable,
					selectHelper: true,
					editable: options.editable,
					ignoreTimezone: options.ignoreTimezone,
					select: this.selectDateRange,
					eventClick: this.selectEvent,
					eventDrop: this.dropEvent,
					eventResize: this.resizeEvent
				});
			},
			addAll: function() {
				this.el.fullCalendar('addEventSource', this.collection.toJSON());
			},
			addOne: function(event) {
				this.el.fullCalendar('renderEvent', event.toJSON());
			},
			selectDateRange: function(startDate, endDate) {
				var Event = Backbone.Model.extend();
				var model = new Event({start: startDate, end: endDate});
				Marionette.triggerMethod.call(this, "range:select", model);
			},
			selectEvent: function(fcEvent) {
				var model = this.collection.get(fcEvent.id);
				Marionette.triggerMethod.call(this, "select", model);
			},
			change: function(event) {
				// Look up the underlying event in the calendar and update its details from the model
				var fcEvent = this.el.fullCalendar('clientEvents', event.get('this'))[0];
				fcEvent.title = event.get('label');
				fcEvent.color = event.get('color');
				this.el.fullCalendar('updateEvent', fcEvent);
			},
			dropEvent: function(fcEvent) {
				var model = this.collection.get(fcEvent.id);
				model.save({start: fcEvent.start, end: fcEvent.end});
				Marionette.triggerMethod.call(this, "drop", model);
			},
			resizeEvent: function(fcEvent) {
				var model = this.collection.get(fcEvent.id);
				model.save({start: fcEvent.start, end: fcEvent.end});
				Marionette.triggerMethod.call(this, "drop", model);
			},
			destroy: function(event) {
				this.el.fullCalendar('removeEvents', event.id);
			}

		});
		return Calendar;
	}

})(jQuery, window);

