var async = require('async')
		, unidecode = require('unidecode');

module.exports = function(app) {

		var config = app.config;
		var layerCollection = app.repository.collections.layers;
		var layerCollectionEn = app.repository.collections.en_layers;

		var Internal = {};
		var Layer = {};

		Internal.processMultipleLayer = function(layer) {
				if (layer.type == 'MULTIPLE') {
						var endDate;

				  	layer.fileObj.forEach(function(dateMultiple){
					    
						    if (endDate === undefined)
						      	endDate = dateMultiple.date;
						    else if (dateMultiple.date > endDate)
						      	endDate = dateMultiple.date;

					  		lastName = dateMultiple.name;
					  		lastDate = dateMultiple.date;
					  		lastType = dateMultiple.type;
				    });

					  layer.last_type = lastType;
						layer.last_name = lastName;
						layer.last_date = lastDate;
				}
			return layer;
		}

		Layer.findByBasepaths = function(_id, callback){
			
				var query = { 
				    "$or": [ 
				        { "_id": { "$in": _id } },
				        { "fileObj.name": { "$in": _id } }
				    ]
				}

				layerCollection.find(query).toArray(function (err, layers){
						var result = []
						if(layers) {
								layers.forEach(function(layer) {
										result.push(Internal.processMultipleLayer(layer));
								})
						}
						callback(result);
				});
		}

		Layer.findById = function(_id, callback){
				layerCollection.findOne({_id : _id}, {}, function(err, layer) {
						layer = Internal.processMultipleLayer(layer);
						callback(layer);
				});
		}

		Layer.listAllSubjects = function(projects, callback) {
				layerCollection.distinct('subject', { 'project': { $in: projects } }, function(err,subjects) {
						callback(subjects);
				});
		};

		Layer.findBySubject = function(subject, projects, callback) {
				layerCollection.find({ 'subject': subject, 'project': { $in: projects } }).toArray(function (err, layers){
						callback(layers);
				});
		};

		Layer.listAllRegions = function(projects, callback) {

				var _idRegions = []

				layerCollection.distinct('_id', { 'project': { $in: projects } }, function(err, _id) {
						_id.forEach(function(l){
								var _idString = l.toString();
								var split = _idString.split('_');
								var prefix = split[0];

								if(_idString.indexOf('or_mp_')>=0)
										prefix = 'or_mp'

								if(_idRegions.indexOf(prefix)<0)
						       			_idRegions.push(prefix)
						});
						callback(_idRegions);
				});
		};

		Layer.findByRegion = function(_idRegions, projects, callback) {
				layerCollection.find({ '_id': { $regex : '^'+_idRegions, $options: 'm' }, 'project': { $in: projects } }).toArray(function (err, layers){
						
						if (_idRegions == 'or'){
								for(var i=0; i < layers.length; i++){
										if (layers[i]._id.match(/or_mp/)){
											delete layers[i]
										}
								}
							}
						callback(layers);
				});
		};

		Layer.findByRegexWithPagination = function(search, projects, skip, limit, lang, callback) {

			var query = {	'project': { $in: projects } };

			if (lang == 'pt-br')
					query.search = new RegExp(search, 'i');
			else
					query.searchEnglish = new RegExp(search, 'i');

			layerCollection.find(query).skip(Number(skip)).limit(Number(limit)).toArray(function(err, layers) {
					layerCollection.find(query).count(function(err, totalCount) {
							callback(totalCount, layers);
					});
			});
		}

		return Layer;
}