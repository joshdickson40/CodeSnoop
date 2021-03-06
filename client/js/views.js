// views.js

var consoleView;
var commandView;
var chatView;

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
		model = new LoggerLine({ lineNumber: this._lineCounter, message: ("Error: " + message)})
		this._lineCounter++;
		this.$el.append(this.errortemplate(model.toJSON()));
		$('#console').scrollTop($('#console')[0].scrollHeight);
		stopped = true;


		// sometimes this doesn't scroll to the bottom (execution is laggy a bit, so we'll re'scroll)
		setTimeout(this.scrollBottom(), 100);

	},

	reset: function() {
		$('#console').empty();
		this._lineCounter = 1;
	},

	render: function(model) {
		this.$el.append(this.logtemplate(model.toJSON()));

		socketSend('logEvent', model.toJSON());

		// scroll to the bottom of the div if necessary
		$('#console').scrollTop($('#console')[0].scrollHeight);
	},

	renderFromServer: function(model) {
		this.$el.append(this.logtemplate(model));
		// scroll to the bottom of the div if necessary
		$('#console').scrollTop($('#console')[0].scrollHeight);
	},

	renderError: function(model) {
		this.$el.append(this.errortemplate(model.toJSON()));

		socketSend('errorEvent', model.toJSON());

		$('#console').scrollTop($('#console')[0].scrollHeight);
	},


	renderErrorFromServer: function(model) {
		this.$el.append(this.errortemplate(model));

		$('#console').scrollTop($('#console')[0].scrollHeight);
	},

	showStop: function() {
		$('#start-button').css('z-index', 35);
	},

	showRun: function() {
		$('#start-button').css('z-index', 45);
	}
});


var CommandView = Backbone.View.extend({

	el: $("#commands"),

	actionTemplate: _.template($('#user-action').html()),

	events: {
    	"click #start-button":     			     "runCode",
    	"click #stop-button": 					"stopCode"
  	},

  	doStartAction: function(model) {
  		$("#console").append(this.actionTemplate(model.toJSON()));
  	},

  	// doCommand: function() {
  		

  	// 	if(!isRunning) {
  	// 		// do the code run
  	// 		stopped = false;
  	// 		isRunning = true;
  	// 		consoleView.reset();
  	// 		run();
  			
  	// 	} else {
  	// 		// stop the current code run, say we're not running
  	// 		stopped = true;
  	// 		isRunning = false;
  	// 	}
  	// },

  	serverConsoleEvent: function(model) {
  		$("#console").append(this.actionTemplate(model));
  	},


  	runCode: function(){

  		if(!isRunning && isAdministrator) {

  			socketSend('status_running', "true");

  			consoleView.reset();

  			consoleView.showStop();

  			var nameTokens = userName.split(" ");
  			var model = new LoggerLine({firstName: nameTokens[0], lastName: nameTokens[1], message: "started a build..."})
  			this.doStartAction(model);

  			socketSend('console_action', model);

  			stopped = false;
  			isRunning = true;
  			
  			run();
  			
  		}
  	},
  	stopCode: function(){

  		if(isRunning && isAdministrator) {

  			socketSend('status_running', "false")

  			consoleView.showRun();

	  		var nameTokens = userName.split(" ");
			var model = new LoggerLine({firstName: nameTokens[0], lastName: nameTokens[1], message: "stopped the build"})
			this.doStartAction(model);

			socketSend('console_action', model);

	  		stopped = true;
	  		isRunning = false;
	  		
  		}
  	}

});

var ChatView = Backbone.View.extend({

	el: $('#text-log'),

	messageTemplate: _.template($('#chat-entry').html()),

	newChatMessage: function(model) {
		socketSend('chatEvent', model);
		this.$el.append(this.messageTemplate(model.toJSON()));
		$('#text-log').scrollTop($('#text-log')[0].scrollHeight);
	},

	newServerChatMessage: function(model) {
		this.$el.append(this.messageTemplate(model));
		$('#text-log').scrollTop($('#text-log')[0].scrollHeight);
	}



})



// do view init routine
setTimeout(setViews, 1000);

function setViews() {
	consoleView = new ConsoleView();
	commandView = new CommandView();
	chatView = new ChatView();
}

