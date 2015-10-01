var buffer = require('buffer')
	  archiver = require('archiver')
	  path = require('path')
	  fs = require('fs')
	  async = require('async')
	  ;

module.exports = function(app) {

	var OgcServer = {};
	var Internal = {};
	var config = app.config;
	var cache = app.libs.cache;
	var catalog = app.libs.catalog;
	var mapServer = app.libs.mapServer;

	Internal.getParams = function(request) {
		var params  = {};

		for(var key in request.query)
			params[key.toUpperCase()] = request.query[key];

		params['hostname'] = request.headers.host;

		return params;
	}

	Internal.setHeaders = function(request, response) {
		var requestType = request.param('REQUEST');

		var headers = {};

		if(requestType == 'GetCapabilities') {
			headers['content-type'] = 'application/xml';
		} else if(requestType == 'GetLegendGraphic' || requestType == 'GetMap') {
			headers['content-type'] = 'image/png';
			//headers['content-disposition'] = 'inline; filename=geoserver-GetLegendGraphic.image';
		} else if(requestType == 'GetCoverage') {
			headers['Content-Description'] = 'coverage data';
			headers['Content-Transfer-Encoding'] = 'binary';
			headers['Content-ID'] = 'coverage/out.tif';
			headers['Content-Disposition'] = 'INLINE; filename=out.tif';
		}

		for (key in headers)
			response.setHeader(key, headers[key]);
		
	}

	Internal.getCacheKey = function(params) {
		
		var requestType = ('REQUEST' in params) ? params['REQUEST'] : '';
		var prefix = config.cachePrefix;
		
		if(requestType == 'GetMap') {
			
			var layers = params['LAYERS'];
			var srs = params['SRS'];
			var bbox = params['BBOX'];
			var width = params['WIDTH'];
			var height = params['HEIGHT'];
			var cqlFilter = params['CQL_FILTER'];
			
			return [prefix, layers, srs, bbox, width, height, cqlFilter].join(',');
		} else if(requestType == 'GetCapabilities') {

			var capPrefix = 'CAPABILITIES'
			var service = params['SERVICE'];
			var version = params['VERSION'];

			return [prefix, capPrefix, requestType, service, version].join(',');
		}

		return undefined;

	}

	Internal.doRequestWithCache = function(cacheKey, params, response) {

		var dataResult = new buffer.Buffer('');

		var onData = function(data) {
			dataResult = buffer.Buffer.concat([dataResult,data]);
			response.write(data);
		}

		var onClose = function() {
			cache.set(cacheKey, dataResult);
			response.end();
		}

		cache.get(cacheKey, function(result) {
			if(result) {
				response.write(result);
				response.end();
			} else {
				mapServer.run(params, onData, onClose);
			}
		});

	}

	Internal.doRequest = function(params, response) {
		var onData = function(data) {
			response.write(data);
		}

		var onClose = function() {
			response.end();
		}

		mapServer.run(params, onData, onClose);
	}

	Internal.streamFilesToZip = function(filename, files, response) {

		filesSize = 0;
		files.forEach(function(file) {
			if(fs.existsSync(file)) {
			 var stats = fs.statSync(file);
			 filesSize += stats["size"];
			}
		});

		response.setHeader('Content-type', 'application/zip')
		response.setHeader('Content-disposition', 'attachment; filename='+filename+'.zip');
		//response.setHeader('Content-length', filesSize);
		
		var zipFile = archiver('zip');
		zipFile.pipe(response);
		
		files.forEach(function(file) {
			if(fs.existsSync(file)) {
				zipFile.file(file, { name: path.basename(file) });
			}
		});

		zipFile.finalize();
	}

	Internal.downloadShp = function(params, response) {
		var typeName = params['TYPENAME'];

		catalog.vectorFilepath(typeName, function(files) {
			if(files.length > 0 )
				Internal.streamFilesToZip(typeName, files, response);
			else
				response.end();
		})

	}

	Internal.downloadTif = function(params, response) {
		var coverageId = params['COVERAGEID'];

		catalog.rasterFilepath(coverageId, function(files) {
			if(files.length > 0 ) {
				response.setHeader('Content-type', 'application/tif')
				response.setHeader('Content-disposition', 'attachment; filename='+coverageId+'.tif');
				response.sendfile(files[0]);
			} else {
				response.end();
			}
		})

	}

	Internal.isWmsGetCap = function(params) {
		return 	 params['SERVICE'].toUpperCase() == 'WMS' 
					&& params['REQUEST'].toUpperCase() == 'GETCAPABILITIES' 
					&& params['VERSION'].toUpperCase() == '1.1.1';
	}

	Internal.isWfsGetShp = function(params) {
		return 	 params['SERVICE'].toUpperCase() == 'WFS' 
					&& params['REQUEST'].toUpperCase() == 'GETFEATURE' 
					&& params['OUTPUTFORMAT'].toUpperCase() == 'SHAPE-ZIP';
	}

	Internal.isWcsGetTif = function(params) {
		return 	 params['SERVICE'].toUpperCase() == 'WCS' 
					&& params['REQUEST'].toUpperCase() == 'GETCOVERAGE' 
					&& params['FORMAT'].toUpperCase() == 'IMAGE/TIFF';
	}

	OgcServer.ows = function(request, response) {
		var params = Internal.getParams(request);

		if(params['LAYER'] == 'ogcserver') {
			response.sendfile(config['path_undefined_img'])
		} else if ( Internal.isWfsGetShp(params) ) {
			Internal.downloadShp(params, response);
		} else if ( Internal.isWcsGetTif(params) ) {
			Internal.downloadTif(params, response);
		} else {
			
			Internal.setHeaders(request, response);
			var cacheKey = Internal.getCacheKey(params);
			
			if(cacheKey && (config['cacheEnable'] || Internal.isWmsGetCap(params)) ) {
				Internal.doRequestWithCache(cacheKey, params, response);
			} else {
				Internal.doRequest(params, response);
			}

		}

	}

	OgcServer.sld = function(request, response) {
		
		var filename = request.param('filename');
		
		if(filename) {
			filenames = filename.split(',');

			response.setHeader('content-type', 'application/xml');

			if(filenames.length == 1) {
				var filename = filenames[0];
				catalog.sldContent(filename, function(sldContent) {
					response.end(sldContent)
				});
			} else {
				
				var header = '';
				var resultSld = '';
				var footer = '';

				var eachTask = function(filename, next) {
					catalog.sldContent(filename, function(sldContent) {
						
						openTag = '<NamedLayer>';
						closeTag = '</NamedLayer>';

						i1 = sldContent.indexOf(openTag);
						i2 = sldContent.indexOf(closeTag);

						header = sldContent.slice(0,i1);
						footer = sldContent.slice(i2 + closeTag.length, sldContent.length);

						resultSld += sldContent.slice(i1,i2) + closeTag;

						next();
					});

				};

				var onComplete = function() {
					resultSld = header + resultSld + footer;
					response.end(resultSld)
				}

				async.eachSeries(filenames, eachTask, onComplete);

			}

		} else {
			response.end();
		}
	}

	return OgcServer;
}