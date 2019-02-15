
var util = require('util')
	,	MongoClient = require('mongodb').MongoClient
	,   async = require('async');

module.exports = function(app) {

		var config = app.config;
		var Repository = {
					collections: {}
				};
		var url = 'mongodb://'+config.mongo.host+':'+config.mongo.port;

		Repository.id = function(id) {
				return new mongodb.ObjectID(id);
		};

		Repository.init = function(callback) {

				MongoClient.connect(url, {'poolSize': 20, useNewUrlParser: true}, function(err, client) {

						if (err) {
								return callback(err);
						}
						
						Repository.db = client.db(config.mongo.dbname);

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