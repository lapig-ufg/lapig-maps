var express = require('express')
, load = require('express-load')
, path = require('path')
, util    = require('util')
, compress = require('compression')()
, requestTimeout = require('express-timeout')
, responseTime = require('response-time')
, buffer = require('buffer')
, events = require('events')
, archiver = require('archiver')
, fs    = require('fs')
, mime = require('mime')
, async = require('async')
, timeout = require('connect-timeout')
, bodyParser = require('body-parser')
, multer = require('multer')
, cluster = require('express-cluster');
;

var app = express();

load('config.js', {'verbose': false}).into(app);
load('libs/utils', { 'verbose': false, cwd: 'src' })
.then('libs')
.into(app);

app.libs.catalog.init(function() {
	
	app.config = app.config;

	app.use(function (req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});

	app.use(requestTimeout({
		'timeout': 1000 * 60 * 10,
		'callback': function(err, options) {
			var response = options.res;
			if (err) {
				util.log('Timeout: ' + err);
			}
			response.end();
		}
	}));

	app.use(compress);
	app.use(responseTime());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(multer());
	app.use(express.methodOverride());

	app.use(app.router);

	app.use(express.logger('dev'));

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
	
})

process.on('uncaughtException', function (err) {
	console.error(err.stack);
}); 