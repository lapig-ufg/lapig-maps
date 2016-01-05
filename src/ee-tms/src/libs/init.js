var load = require('express-load');
var async = require('async');

module.exports = function(app){
	
	var Init = {}
	Init.initApp = function(functionApp){

		load('controllers', { 'verbose': false, cwd: 'src' })
		.then('routes')
		.into(app);

		async.parallel([load('controllers', { 'verbose': false, cwd: 'src' })
		.then('routes')
		.into(app)],functionApp);

	}

	return Init
	

}