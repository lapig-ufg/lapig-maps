var fs = require('fs')
		,	async = require('async')
	  ,	spawn = require('child_process').spawn
	  , path = require('path')
	  ,	requester = require('request')
	  , exec = require('child_process').exec
	  ;

module.exports = function(app) {

	var config = app.config;
	var utils = app.libs.utils;
	var cache = app.libs.cache;

	var Internal = {};
	var Catalog = {};

	Internal.getMapfiles = function(onComplete) {
		var findCmd = spawn('find'
			,	[ '-maxdepth', '3', '-name', config['pattern_mapfile']]
			,	{ cwd: config['path_catalog'] }
		)

		var findResult = ''
		findCmd.stdout.on('data', function(data) {
			findResult += data;
		});

		findCmd.on('close', function() {
			mapfiles = findResult.split('\n');
			mapfiles.pop()
			onComplete(mapfiles);
		});
	}


	Internal.getMapLayers = function(onComplete) {
		var mapLayers = "";

		Internal.getMapfiles(function(mapfiles) {
			var eachTask = function(mapfile, next) {

				mapfilePath = config['path_catalog'] + mapfile;
				nameLayer = mapfile.split("/")
				nameLayer = nameLayer[nameLayer.length-1].replace('.map', '')

				if(Catalog.sldExists(nameLayer)) {
					var cmd = 'python '+config['read_mapfile_with_sld']+' '+nameLayer+' "'+mapfilePath+'" "'+config['path_catalog']+'"';

						exec(cmd, function(error, stdout, stderr) {
							if(stdout.indexOf("Error") != -1){
									console.log(stdout)
							}else {
							  if(stdout) {
							  	mapLayers += stdout + '\n\n';
							  	console.log(mapfile)
							  }
							}
							next();
						});
				} else {
					fs.readFile(mapfilePath, { encoding: 'utf8' }, function (err, mapfileContent) {
						if(mapfileContent != undefined) {
							mapLayers += mapfileContent + '\n\n';
							console.log(mapfile);
						} else {
							console.log(err)
						}
						next();
					});
				} 

			}

			var eachComplete = function() {
				onComplete(mapLayers);
			}

			async.eachSeries(mapfiles, eachTask, eachComplete)
		});

	}

	Internal.createBaseMapfile = function(onComplete) {
		fs.readFile(config['path_basemapfile'], { encoding: 'utf8' }, function (err, data) {
			Internal.getMapLayers(function(mapLayers) {
				config['map_layers'] = mapLayers
				var result = utils.printf(data, config);
				fs.writeFile(config['path_mapfile'], result, function (err) {
				  if (err) throw err;
				  onComplete()
				});
			});
		});
	}

	Internal.prefetchSld = function(onComplete) {
		Internal.prefetchFile(config['path_catalog'], 'sld', 'sldFiles', true, onComplete)
	}

	Internal.prefetchVectors = function(onComplete) {
		Internal.prefetchFile(config['path_catalog'], config.vectorBaseExt, 'vectorFiles', true, onComplete)
	}

	Internal.prefetchRasters = function(onComplete) {
		Internal.prefetchFile(config['path_catalog'], config.rasterBaseExt, 'rasterFiles', true, onComplete)
	}

	Internal.prefetchFile = function(basepath, ext, propertyName, removeExt, onComplete) {
		var findCmd = spawn('find'
			,	[ '-maxdepth', '3', '-name', '*.' + ext]
			,	{ cwd: basepath }
		)

		var findResult = ''
		findCmd.stdout.on('data', function(data) {
			findResult += data;
		});

		findCmd.on('close', function() {
			fileArray = findResult.split('\n');
			fileArray.pop();

			Internal[propertyName] = {};
			fileArray.forEach(function(filepath) {
				filename = path.basename(filepath, ((removeExt) ? '.' + ext : '') )
				Internal[propertyName][filename] = basepath + filepath;
			})

			onComplete();
		});
	}

	Internal.getSldPath = function(filename) {
		filename = path.basename(filename, '.sld');
		sldPath = Internal.sldFiles[filename];
		
		if(sldPath === undefined) {
			var splitFilename = filename.split('_');
			var date = splitFilename[splitFilename.length - 2];
			var newFilename = filename.replace(date + '_', '');

			sldPath = Internal.sldFiles[newFilename];	
		}

		return sldPath;
	}

	Internal.getFilepaths = function(filename, propertyName, baseExtension, extensions, onComplete) {
		
		var filepath = Internal[propertyName][filename];
		var result = [];

		if(filepath != undefined) {
			extensions.forEach(function(ext) {
				result.push(filepath.replace(baseExtension, ext));
			})
		}

		onComplete(result);
	}

	Internal.removeSingleSymbolRuleName = function(sldContent) {
		return sldContent.replace('Single symbol', '-')
										 .replace('Unknown', '-');
	}

	Internal.correctSldName = function(filename, sldContent) {
		var layername = filename.replace('.sld', '');
		splitName = sldContent.split('Name>');

		if(splitName.length >= 2) {
			var namedLayerName = splitName[1].split('</')[0];
			sldContent = sldContent.replace(namedLayerName, layername);
		}

		return sldContent;
	}

	Catalog.sldExists = function(filename) {
		return (Internal.getSldPath(filename) != undefined);
	}

	Catalog.prefetchWmsCapabilities = function() {
		var capUrl = 'http://localhost:' + app.config.port + '/ows?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.1.1'
		requester(capUrl, function (error, response, body) {})
	}

	Catalog.init = function(onComplete) {
		
		var cacheKeyCapabilities = config['cachePrefix'] + ',CAPABILITIES,*'

		if(process.env.PRIMARY_WORKER) {
			cache.del(cacheKeyCapabilities, function() {
				async.parallel([Internal.prefetchSld, Internal.prefetchVectors, Internal.prefetchRasters], function(){
					Internal.createBaseMapfile(onComplete);
				});
			});
			
		} else {
			async.parallel([Internal.prefetchSld, Internal.prefetchVectors, Internal.prefetchRasters], onComplete)
		}

	};

	Catalog.sldContent = function(filename, onComplete) {
		sldPath = Internal.getSldPath(filename);

		if(sldPath) {
			fs.readFile(sldPath, { encoding: 'utf8' }, function (err, sldContent) {
				sldContent = Internal.correctSldName(filename, sldContent);
				sldContent = Internal.removeSingleSymbolRuleName(sldContent);
				onComplete(sldContent);
			});
		} else {
			onComplete('');
		}
	}

	Catalog.rasterFilepath = function(filename, onComplete) {
		Internal.getFilepaths(filename, 'rasterFiles', '.' + config.rasterBaseExt, config.rasterDownloadExts, onComplete);
	}

	Catalog.vectorFilepath = function(filename, onComplete) {
		Internal.getFilepaths(filename, 'vectorFiles', '.' + config.vectorBaseExt , config.vectorDownloadExts, onComplete);
	}

	return Catalog;
	
}; 