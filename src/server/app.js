var express = require('express')
, load = require('express-load')
, path = require('path')
, util    = require('util')
, compression = require('compression')
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
;

var app = express();

load('config.js', {'verbose': false})
.then('libs')
.then('middleware')
.into(app);

app.middleware.repository.init(function() {

	app.repository = app.middleware.repository;

	app.use(compression());
	app.use(express.static(app.config.clientDir));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	
	var publicDir = path.join(__dirname, '');

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
	

	app.use(responseTime());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(multer());
	//app.use(express.methodOverride());
	
	//app.use(app.router);

	//app.use(express.logger('dev'));

	app.use(function(error, request, response, next) {
		console.log('ServerError: ', error.stack);
		next();
	});

	load('controllers', {'verbose': false})
	.then('routes')
	.into(app);

	app.listen(app.config.port, function() {
		console.log('LAPIG-MAPS Server @ [port %s] [pid %s]', app.config.port, process.pid.toString());
	});

});

process.on('uncaughtException', function (err) {
	console.error(err.stack);
}); 