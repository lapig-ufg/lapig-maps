var spawn = require('child_process').spawn
	  ,	querystring = require('querystring')
	  ,	fs = require('fs')
		;

module.exports = function(app) {

	var utils = app.libs.utils;
	var config = app.config;

	var Internal = {};
	var Mapserver = {};

	Internal.getSldParam = function(params) {
		
		var layers;
		var hostname = params['hostname'];

		if(params['REQUEST'] == 'GetMap')
			layers = params['LAYERS'];
		else if(params['REQUEST'] == 'GetLegendGraphic')
			layers = params['LAYER'];
		else
			return '';

		var sldUrl = utils.printf("{0}/sld/{1}", [hostname, layers]);

		return "&SLD=" + sldUrl;
	};

	Mapserver.run = function(params, onDataFn, onCloseFn) {

		var sldParam = Internal.getSldParam(params);
		var queryParams = querystring.stringify(params);

		var cmdParams = "QUERY_STRING=map={0}&{1}{2}";
		cmdParams = utils.printf(cmdParams, [config['path_mapfile'], queryParams, sldParam]);

		fs.writeFileSync(config.path_logfile, cmdParams + '\n', { flag: 'a' });

		var mapserv = spawn(config['path_mapserv'], ['-nh', cmdParams ]);
		var grep = spawn('grep', ['-a', '-v', '^Content-*[A-Z]*[a-z]*-*[A-Z]*[a-z]*-*[A-Z]*[a-z]*:']);
		var sed = spawn('sed', ['1,1d']);

		sed.stdout.on('data', onDataFn);
		sed.stdout.on('close', onCloseFn);

		grep.stdout.on('data', function(data) {
			sed.stdin.write(data);
		});
		grep.on('close', function(data) {
			sed.stdin.end();
		});

		mapserv.stderr.on('data', onDataFn);
		mapserv.stdout.on('data', function(data) {
			grep.stdin.write(data);
		});
		mapserv.on('close', function(data) {
			grep.stdin.end();
		});
		
	}
	
	return Mapserver;
	
}; 