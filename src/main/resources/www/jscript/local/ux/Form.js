(function($, my) {

	my.scorpio4.UX.View["urn:scorpio4:ux:Form"] = function(options) {
		options = my.scorpio4.UX.checkOptions(options, ["this", "label"]);
		var DEBUG = true && my.scorpio4.UX.DEBUG; // master DEBUG kill-switch

		var fn_remodelMeta2Field  = function(v,k,l) {
DEBUG && console.log("Remodel: ", v, k, l);
			return _.extend(v, {
				title: v['this'], type: "Text", help: "",
				editable: false, renderable: true && v['visible'],
			});
		}

		var schemaModel = null;
		// initialize fields from meta
		if (_.isArray(options.meta)) schemaModel = my.scorpio4.fact.Models(options.meta);
		else if (options.meta instanceof Backbone.Collection) schemaModel = options.meta;
		else throw "urn:scorpio4:ux:oops:invalid-meta-data";

		var Form = Backbone.Form.extend( _.extend({
			className: "ux_form",
			initialize: function() {
				my.scorpio4.UX.model(options, this);
				//Check templates have been loaded
				if (!Form.templates.form) throw "urn:scorpio4:ux:oops:missing-form-template";
				var self = this;
				//Get the schema
				this.schema = (function() {
					if (options.schema && _.isFunction(options.schema)) return options.schema(this);
					if (schemaModel.models) {
						var _schema = {};
						_.each(schemaModel.models, function(field) {
DEBUG && console.log("Form Schema:", field.id, field, _schema)
							_schema[field.id] = {
								title: field.get("label"),
								type: "Text",
								help: field.get("comment"),
								editable: field.get("editable") || false,
								renderable: field.get("visible") || false,
								validators: field.get("validators") || (field.get("required")?["required"]:[]),
								options: ["a", "b"]
							}
						} );
					}
					if (_schema) return _schema;
					if (_.isFunction(self.model.schema)) return self.model.schema();
					throw "urn:scorpio4:ux:oops:missing-meta-data";
				})();

				//Option defaults
				options = _.extend({
					template: 'form',
					fieldsetTemplate: 'fieldset',
					fieldTemplate: 'field'
				}, options);

				//Determine fieldsets
				if (!options.fieldsets) {
					var fields = options.fields || _.keys(this.schema);
					options.fieldsets = [{ fields: fields }];
				}

				this.is_editing = false;

				//Store main attributes
				this.options = options;
				this.fields = {};
				_.extend(this, my.scorpio4.UX.mixin.Common);
				this.triggerMethod = Marionette.triggerMethod;
				this._render = this.render;

                this.render = function() {
DEBUG && console.log("Form Render: ", this, self);
//                    self.triggerMethod("before:render");
                    self._render();
                    self.triggerMethod("render");

                };
			},
			onRender: function() {
				var self = this;
				var $inputs = $("input", this.$el);
				$inputs.blur( function() {
					self.commit();
					self.is_editing = false;
					console.log("Form Blur: ", $inputs, self);
				})
				$inputs.focus( function() {
					self.is_editing = true;
					console.log("Form Focus: ", $inputs, self)
				})
			}
		}, options ) );

		// form templates
		Form.setTemplates({
			form:		'<form class="form-horizontal">{{fieldsets}}</form>',
			fieldset:	'<fieldset class="form-fieldset"><legend>{{legend}}</legend>{{fields}}</fieldset>',

			field: '\
				<div class="control-group field-{{key}}">\
					<label class="control-label" for="{{id}}">{{title}}</label>\
					<div class="controls">\
						{{editor}}\
						<div class="help-inline">{{error}}</div>\
						<div class="help-block">{{help}}</div>\
					</div>\
				</div>\
			',

			nestedField: '\
				<div class="field-{{key}}">\
					<div title="{{title}}" class="input-xlarge">{{editor}}\
						<div class="help-inline">{{error}}</div>\
					</div>\
					<div class="help-block">{{help}}</div>\
				</div>\
			',

			list: '\
				<div class="ux_list">\
					<ul class="unstyled clearfix">{{items}}</ul>\
					<button class="btn ux_add" data-action="add">Add</button>\
				</div>\
			',

			listItem: '\
				<li class="clearfix">\
					<div class="pull-left">{{editor}}</div>\
					<button type="button" class="btn ux_del" data-action="remove">&times;</button>\
				</li>\
			',

			date: '\
				<div class="ux_date">\
					<select data-type="date" class="ux_date">{{dates}}</select>\
					<select data-type="month" class="ux_month">{{months}}</select>\
					<select data-type="year" class="ux_year">{{years}}</select>\
				</div>\
			',

			dateTime: '\
				<div class="ux_datetime">\
					<p>{{date}}</p>\
					<p>\
						<select data-type="hour" style="width: 4em">{{hours}}</select>\
						:\
						<select data-type="min" style="width: 4em">{{mins}}</select>\
					</p>\
				</div>\
			',

			'list.Modal': '\
				<div class="ux_list-modal">\
					{{summary}}\
				</div>\
			'
		}, {
			//CLASSNAMES
			error: 'error' //Set on the field tag when validation fails
		});

		return Form;
	}

})(jQuery, window);
