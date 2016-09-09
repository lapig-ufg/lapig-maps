var util  = require('util')
,redis = require('redis');

module.exports = function(app) {

	var config = app.config;

	var redisClient = redis.createClient(config.redis.port, config.redis.host);
	var Cache = {};

	Cache.get = function(cacheKey, callback) {
		redisClient.get(cacheKey, function(err, data) {
			if(!err && data) {
		    var bitmap = new Buffer(data,'base64');
		   	callback(bitmap);
		  } else {
		   	callback(undefined);
		  }
	  });
	};

	Cache.set = function(cacheKey, data){
		var img = new Buffer(data || '').toString('base64');		
		redisClient.set(cacheKey, img, function(){});
	}

	Cache.del = function(keyPattern, data) {
		redisClient.keys(keyPattern, function(err, keys) {
			keys.forEach(function(key) {
				redisClient.del(key);
			})
		});
	}
	
	return Cache;
	
}; 