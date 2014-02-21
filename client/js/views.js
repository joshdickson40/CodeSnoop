// views.js

var consoleView;
var stopped = false;

var ConsoleView = Backbone.View.extend({

	// set the div for this element
	el: $("#console"),

	logtemplate: _.template($('#log-line').html()),

	errortemplate: _.template($('#error-line').html()),

	initialize: function() {
		var that = this;
		this._lineCounter = 1;
		

		(function(){
		    var oldLog = console.log;
		    console.log = function (message) {

		        var message = Array.prototype.slice.apply(arguments).join(' ')

		        that.render(new LoggerLine({ lineNumber: that._lineCounter, message: message}));
		        that._lineCounter++;
		    };
		})();

		(function(){
		    var oldLog = console.log;
		    console.error = function (message) {

		        var message = Array.prototype.slice.apply(arguments).join(' ');

		        that.renderError(new LoggerLine({ lineNumber: that._lineCounter, message: message}));
		        that._lineCounter++;
		    };
		})();

	},

	scrollBottom: function() {
		$('#console').scrollTop($('#console')[0].scrollHeight);
	},

	doFatalErrorResponse: function(message) {
		// console.log("Saw: " + message);
		model = new LoggerLine({ lineNumber: this._lineCounter, message: ("Error: " + message)})
		this._lineCounter++;
		this.$el.append(this.errortemplate(model.toJSON()));
		$('#console').scrollTop($('#console')[0].scrollHeight);
		stopped = true;


		// sometimes this doesn't scroll to the bottom (execution is laggy a bit, so we'll re'scroll)
		setTimeout(this.scrollBottom(), 100);

	},

	render: function(model) {
		this.$el.append(this.logtemplate(model.toJSON()));

		// scroll to the bottom of the div if necessary
		$('#console').scrollTop($('#console')[0].scrollHeight);
	},

	renderError: function(model) {
		this.$el.append(this.errortemplate(model.toJSON()));
		$('#console').scrollTop($('#console')[0].scrollHeight);
	}
});


setTimeout(setViews, 1000);

function setViews() {
	consoleView = new ConsoleView();
	doRun();
}

