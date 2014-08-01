CommandCenter = (function (Backbone, $, _) {
    var Commands = {};

	// Inspired by:
	// http://lostechies.com/derickbailey/2012/05/04/wrapping-ajax-in-a-thin-command-framework-for-backbone-apps/

    // Private data
    // ------------

    var commandList = {};

    // Public API
    // ----------

    Commands.register = function (commandName, options) {
        commandList[commandName] = options;
    }

    Commands.get = function (commandName) {
        var options = commandList[commandName];
        options = options || {};
        options = _.clone(options);
        var command = new Commands.Command(commandName, options);
        return command;
    };

    // Command Type
    // -------------------

    Commands.Command = function (name, options) {
        this.name = name;
        this.options = options
    };

	// Mix-in Backbone Events into each Command
    _.extend(Commands.Command.prototype, Backbone.Events, {
        execute: function (data) {
            var that = this;

            var config = this.getAjaxConfig(this.options, data);

            this.trigger("before:execute");

            var request = $.ajax(config);
            request.done(function (response) {
                that.trigger("success", response);
            });

            request.fail(function (response) {
                that.trigger("error", response);
            });

            request.always(function (response) {
                that.trigger("complete", response);
            });
        },

        getAjaxConfig: function (options, data) {
            var url = this.getUrl(options, data);

            var ajaxConfig = {
                type: "GET",
                dataType: "JSON",
                url: url
            };

            _.extend(ajaxConfig, options);
            ajaxConfig.data = data;

            return ajaxConfig;
        },

        getUrl: function (options, data) {
            return options.url;
        }
    });

    return Commands;
})(Backbone, $, _);

var myCommand = CommandCenter.get("myCommand");

var executeCommand = function() { myCommand.execute(someData); };

myCommand.on("success", function(response){
  if (response.someValueImChecking){
    // move on to the next thing, here
  } else {
    // poll again, 1 second from now
    setTimeout(executeCommand, 1000);
  }
});
