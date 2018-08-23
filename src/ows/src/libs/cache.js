var crypto = require('crypto')
	,	fsextra = require('fs-extra')
	,	fs = require('fs')
	;

module.exports = function(app) {

	var config = app.config;

	var Cache = {};

	config.cacheDir

	Cache.cacheFile = function(cacheKey, callback) {
		var md5Key = crypto.createHash('md5').update(cacheKey).digest("hex");

		var layerName = cacheKey.split(',')[1]
		var cacheDir = config.cacheDir+'/'+layerName
		var cacheFile = cacheDir+'/'+md5Key+'.cache'

		fsextra.ensureDir(cacheDir, function(err) { 
			callback(cacheDir, cacheFile)
		});
	}

	Cache.get = function(cacheKey, callback) {
		Cache.cacheFile(cacheKey, function(cacheDir, cacheFile) {
			fs.readFile(cacheFile, function (err,data) {
			  if (!err && data) {
			  	callback(data);	  	
			  }else{
			    callback(undefined);
			  }
			});
		})
	};

	Cache.set = function(cacheKey, data){
		if(data) {
			Cache.cacheFile(cacheKey, function(cacheDir, cacheFile) {
				fs.writeFile(cacheFile, data, 'base64');
			})
		}
	}

	Cache.del = function(keyPattern, callback) {
		Cache.cacheFile(keyPattern, function(cacheDir, cacheFile) {
			fsextra.remove(cacheDir, callback)
		})
	}

	return Cache;
	
}; 