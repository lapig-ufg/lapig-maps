
var util = require('util')
	,   mongodb = require('mongodb')
	,   async = require('async');

module.exports = function(app) {

		var Db = mongodb.Db,
				Connection = mongodb.Connection,
				Server = mongodb.Server,
				config = app.config,
				Repository = {
					collections: {}
				};

		Repository.db = new Db(config.mongo.dbname
				, new Server(config.mongo.host, config.mongo.port, {'auto_reconnect': true, 'pool_size': 5 })
				, { safe: true }
		);

		Repository.id = function(id) {
				return new mongodb.ObjectID(id);
		};

		Repository.init = function(callback) {
				
				Repository.db.open(function(err) {
						if (err) {
								return callback(err);
						}

						Repository.db.listCollections({}).toArray(function(err, names) {

								var forEachOne = function(collection, callback) {
										var name = collection.name.substr(collection.name.indexOf('\.') + 1);
										if(name != 'indexes') {
											Repository.db.collection(name, function(err, repository) {
												if(err){
													console.log(err)
												}

												Repository.collections[name] = repository;
												callback();
											});
										} else {
											callback();
										}
								};

								async.each(names, forEachOne, callback)
						});
				});
		};

		Repository.getSync = function(collectionName) {
				return Repository.collections[collectionName];
		};

		Repository.get = function(collectionName, callback) {
				Repository.db.collection(collectionName, callback);
		};

		return Repository;
};