var spawn = require('child_process').spawn
	  ,	querystring = require('querystring')
	  ,	fs = require('fs');

module.exports = function(app) {

	var catalog = app.libs.catalog;
	var utils = app.libs.utils;
	var config = app.config;

	var Internal = {};
	var Mapserver = {};

	Internal.parseCqlFilter = function(params) {
		if(params['CQL_FILTER']) {
			var cqlFilter = params['CQL_FILTER'];
			cqlFilter = cqlFilter.replace(/\'/g,'"')
			return cqlFilter
		} else {
			return ''
		}
	}

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

		if(catalog.sldExists(layers)) {
			return "&SLD=" + sldUrl;
		} else {
			return ""
		}

	};

	Mapserver.run = function(params, onDataFn, onCloseFn) {

		var sldParam = Internal.getSldParam(params);
		var queryParams = querystring.stringify(params);
		
		params['CQL_FILTER'] = Internal.parseCqlFilter(params);

		var cmdParams = "QUERY_STRING=map={0}&{1}{2}";
		cmdParams = utils.printf(cmdParams, [config['path_mapfile'], queryParams, sldParam]);

		fs.writeFileSync(config.path_logfile, cmdParams + '\n', { flag: 'a' });

		var mapserv = spawn(config['path_mapserv'], ['-nh', cmdParams ]);
		
		if (params['ENHANCE'] && params['ENHANCE'] == 'TRUE') {
			var enhance = spawn(config['path_enhance_img'])
			mapserv.stdout.pipe(enhance.stdin)
			enhance.stdout.on('data', onDataFn);
			enhance.stdout.on('close', onCloseFn);
		} else {
			mapserv.stdout.on('data', onDataFn);
			mapserv.stdout.on('close', onCloseFn);
		}

		
	}
	
	return Mapserver;
	
}; 