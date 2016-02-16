var util  = require('util')
	, redis = require('redis');

module.exports = function(app) {

	var config = app.config;

	var redisClient = redis.createClient(config.redis.port, config.redis.host);
	var Cache = {};
	var Internal = {};


	Internal.addPrefix = function(cacheKey) {

		return app.config.redis.prefix + cacheKey;
	}
	

	Cache.get = function(cacheKey, callback) {
		if(app.config.redis.enable) {
			//cacheKey = Internal.addPrefix(cacheKey);
			//console.log('get: ', cacheKey);
			redisClient.get(cacheKey, function(err, data) {
				//console.log(data);
				if(!err && data) {
			    	var cachedData = JSON.parse(data);;
			    	callback(cachedData);
			    } else {
			    	callback(undefined);
			    }
		  });
		} else {
			callback(undefined);
		}
	};

	Cache.set = function(cacheKey, data){

		if(app.config.redis.enable) {
			var strData = JSON.stringify(data);

			//cacheKey = Internal.addPrefix(cacheKey);

			redisClient.set(cacheKey, strData, function(){});
			if (config.redis.expiration > 0) {
				redisClient.expire(cacheKey, config.redis.expiration);
			}
		}
	}

	Cache.del = function(keyPattern) {
		if(app.config.redis.enable) {
			redisClient.keys(keyPattern, function(err, keys) {
				keys.forEach(function(key) {
					redisClient.del(key);
				})
			});
		}
	}

	Cache.getAll = function(id, callback){
		redisClient.keys(id, function(err, obj){
			
			callback(obj);
		});
	}


	return Cache;
	
};