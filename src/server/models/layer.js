var async = require('async')
	, unidecode = require('unidecode');

module.exports = function(app) {

	var config = app.config;
	var layerCollection = app.repository.collections.layers;

	var Layer = {};

	Layer.findById = function(id, callback){
		layerCollection.findOne({_id : app.repository.id(id)}, {}, function(err, layer) {

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

	Layer.findByRegexWithPagination = function(search, projects, skip, limit, callback) {
		layerCollection.find({'project': { $in: projects }, 'search': new RegExp(search, 'i')}).skip(Number(skip)).limit(Number(limit)).toArray(function(err, layers) {
			layerCollection.find({'project': { $in: projects }, 'search': new RegExp(search, 'i')}).count(function(err, totalCount) {
					callback(totalCount, layers);
			});
		});
	}

	return Layer;
}