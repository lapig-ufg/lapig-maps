var express = require('express')
, load = require('express-load')
, util = require('util')
, compression = require('compression')
, requestTimeout = require('express-timeout')
, multer = require('multer')
, cluster = require('express-cluster')
, requestParam = require('request-param')
, morgan = require('morgan')
, schedule = require('node-schedule');

var app = express();

load('config.js', {'verbose': false}).into(app);
load('libs/db.js', { 'verbose': false, cwd: 'src' }).into(app);
load('libs/republish.js', { 'verbose': false, cwd: 'src' }).into(app);
load('libs', { 'verbose': false, cwd: 'src' }).into(app);
load('controllers', { 'verbose': false, cwd: 'src' }).into(app);

var timeRepublish = app.config.midNight;
var layers = app.config.layers;

app.libs.init.init(function(){	
	app.use(compression());

	app.use(requestTimeout({
		'timeout': 1000 * 60 * 30,
		'callback': function(err, options) {
			var response = options.res;
			if (err) {
				util.log('Timeout: ' + err);
			}
			response.end();
		}
	}));
	app.use(multer());
	app.use(requestParam());
	app.use(morgan('combined'));

	app.use(function(error, request, response, next) {
		console.log('ServerError: ', error.stack);
		next();
	});

	load('controllers', { 'verbose': false, cwd: 'src' })
		.then('routes')
		.into(app);


	app.listen(app.config.port, function() {
		console.log('OGC-Server Server @ [port %s] [pid %s]', app.config.port, process.pid.toString());
	});

	process.on('uncaughtException', function (err) {
		console.error(err.stack);
	});
	
	app.libs.init.getAllLayers(function(layers){
		schedule.scheduleJob(timeRepublish, function(){
			app.libs.republish.run(layers, function(){});
		});		
	})

});