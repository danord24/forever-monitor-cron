#!/usr/local/bin/node

var async 		  	= require('async');
var _ 				= require('underscore');
var forever 		= require('forever');


// Do some async stuff
var actions = [];

actions.push(function(wc, cb) {

	// false gives you an object, true give you the familiar op
	forever.list(false, function (err, processes) {
	  
		if(err) {
			return cb(err);
		}

		// Optional console.log so you can see what processes are running, if any.
		console.log(processes);

		// Check if We've got ourselves some running processes!
		if(!_.isUndefined(processes) && _.isArray(processes) && !_.isEmpty(processes)) {
			
			// Loop over the processes and see if they match the info in the config
			for(p in processes) {


				if(processes[p].running === false) {

					// First attempt to stop the worker
					// There is an bug with forever that when you try to stop a stopped process, it stops it but reports back with an error 
					// that says "Cannot stop process that is not running". This kills the script :(
					// So for the mean time, we are going to let the stopped workers build up in the forever list	
					try {
						forever.stop(processes[p].pid);
					} catch(e) {
						return cb(e);
					}


					// attempt to restart the process
					// Use this to pass in any arguments you need to your script. You can pull this in from some config if needs be.

					/*var restartOptions = {
						args: ['--env', wc.workers[i].options.env],
						sourceDir: processes[p].cwd,
					}*/

					var restart = forever.startDaemon(wc.workers[i].name, restartOptions);

					// To Do - Slack intergration. On restart ping a message off to a slack channel
					console.log(restart, "RESTARTED SCRIPT");

				}

			}

		}

	});

	return cb(null, {})

});



// Run all actions & return CK data
async.waterfall(actions, function(err, data) {

    if (!_.isNull(err)) {
      console.log(err);
      process.exit(1);
    }
    
    console.log(data);

  });