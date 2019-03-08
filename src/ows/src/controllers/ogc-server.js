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

	Internal.setHeaders = function(params, request, response) {
		var requestType = request.param('REQUEST');
		var requestFormat = request.param('FORMAT');

		var headers = {};

		if(requestType == 'GetCapabilities') {
			headers['content-type'] = 'application/xml';
		} else if(requestType == 'GetLegendGraphic' || requestType == 'GetMap' && requestFormat == "image/png") {
			headers['content-type'] = "image/png";
		}else if(requestType == 'GetLegendGraphic' || requestType == 'GetMap' && requestFormat == "application/json") {
			headers['content-type'] = "application/json";
		} else if(Internal.isWfsGetShp(params, true)) {
			var filename = params['TYPENAME'];
			headers['Content-Disposition'] = 'attachment; filename='+filename+'.zip';
		} else if(Internal.isWcsGetTif(params, true)) {
			var filename = (params['MSFILTER']) ?  params['COVERAGEID'] + '_' + params['MSFILTER'] : params['COVERAGEID'];
			headers['Content-Description'] = 'coverage data';
			headers['Content-Transfer-Encoding'] = 'binary';
			headers['Content-ID'] = 'coverage/out.tif';
			headers['Content-Disposition'] = 'INLINE; filename='+filename+'.tif';
		}
		
		for (key in headers)
			response.setHeader(key, headers[key]);
		
	}

	Internal.getCacheKey = function(params) {
		
		var requestType = ('REQUEST' in params) ? params['REQUEST'] : '';
		var mode = ('MODE' in params) ? params['MODE'] : '';
		var prefix = config.cachePrefix;
		
		if(requestType == 'GetMap') {
			
			var layers = params['LAYERS'];
			var srs = params['SRS'];
			var bbox = params['BBOX'];
			var width = params['WIDTH'];
			var height = params['HEIGHT'];
			var msfilter = params['MSFILTER'];
			var format = params['FORMAT'];
			var startyear = params['STARTYEAR'];
			var endyear = params['ENDYEAR'];
			
			var parts = [prefix, layers, srs, bbox, width, height, msfilter, format];
			if(startyear)
				parts.push(startyear);
			if(endyear)
				parts.push(endyear);

			return parts.join(',');
		} else if(requestType == 'GetCapabilities') {

			var capPrefix = 'CAPABILITIES'
			var service = params['SERVICE'];
			var version = params['VERSION'];

			return [prefix, capPrefix, requestType, service, version].join(',');
		} else if(mode == 'tile') {
			var tile = params['TILE']
			var msfilter = params['MSFILTER'];
			var imagetype = params['MAP.IMAGETYPE'];
			var startyear = params['STARTYEAR'];
			var endyear = params['ENDYEAR'];

			var zoom = (tile) ? tile.split(' ')[2] : '0';
			var layers = params['LAYERS']+'-tiles'+'/'+zoom;
			
			var parts = [prefix, layers, tile, msfilter, imagetype];
			if(startyear)
				parts.push(startyear);
			if(endyear)
				parts.push(endyear);

			return parts.join(',');
			
		}else if(requestType == 'GetLegendGraphic') {

			var layer = 'layer-legend-tiles'+'/'+params['LAYER'];
			
			var parts = [prefix, layer];

			return parts.join(',');

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
		var metadata = params['METADATA'];

		catalog.vectorFilepath(typeName, function(files) {
			if(files.length > 0 ) {
				if(metadata) {
					metadataFile = path.join(config['path_metadata'], metadata);
					files.push(metadataFile);
				}
				Internal.streamFilesToZip(typeName, files, response);
			} else {
				response.end();
			}
		})

	}

	Internal.downloadZipTif = function(params, response) {
		var coverageId = params['COVERAGEID'];
		var metadata = params['METADATA'];

		catalog.rasterFilepath(coverageId, function(files) {
			if(files.length > 0 ) {
				if(metadata) {
					metadataFile = path.join(config['path_metadata'], metadata)
					files.push(metadataFile);
				}
				Internal.streamFilesToZip(coverageId, files, response);
			} else {
				response.end();
			}
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
		return 	 params['SERVICE'] && params['SERVICE'].toUpperCase() == 'WMS' 
					&& params['REQUEST'] && params['REQUEST'].toUpperCase() == 'GETCAPABILITIES' 
					&& params['VERSION'] && params['VERSION'].toUpperCase() == '1.1.1';
	}

	Internal.isWfsGetShp = function(params, ignoreFilter) {
		return 	 params['SERVICE'] && params['SERVICE'].toUpperCase() == 'WFS' 
					&& params['REQUEST'] && params['REQUEST'].toUpperCase() == 'GETFEATURE' 
					&& params['OUTPUTFORMAT'] && params['OUTPUTFORMAT'].toUpperCase() == 'SHAPE-ZIP'
					&& ( (ignoreFilter) ? true : (!params['MSFILTER']) );
	}

	Internal.isWcsGetTif = function(params, ignoreFilter) {
		return 	 params['SERVICE'] && params['SERVICE'].toUpperCase() == 'WCS' 
					&& params['REQUEST'] && params['REQUEST'].toUpperCase() == 'GETCOVERAGE' 
					&& params['FORMAT'] && params['FORMAT'].toUpperCase() == 'IMAGE/TIFF'
					&& ( (ignoreFilter) ? true : (!params['MSFILTER']) );
	}

	Internal.isWcsGetTifZip = function(params, ignoreFilter) {
		return 	 params['SERVICE'] && params['SERVICE'].toUpperCase() == 'WCS' 
					&& params['REQUEST'] && params['REQUEST'].toUpperCase() == 'GETCOVERAGE' 
					&& params['FORMAT'] && params['FORMAT'].toUpperCase() == 'TIFF-ZIP'
					&& ( (ignoreFilter) ? true : (!params['MSFILTER']) );
	}

	OgcServer.ows = function(request, response) {
		var params = Internal.getParams(request);
		response.setHeader("Access-Control-Allow-Origin", "*");
		if(params['LAYER'] == 'ogcserver') {
			response.sendfile(config['path_undefined_img'])
		} else if ( Internal.isWfsGetShp(params, false) ) {
			Internal.downloadShp(params, response);
		} else if ( Internal.isWcsGetTif(params, false) ) {
			Internal.downloadTif(params, response);
		} else if ( Internal.isWcsGetTifZip(params, false) ) {
			Internal.downloadZipTif(params, response);
		} else {

			Internal.setHeaders(params, request, response);
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