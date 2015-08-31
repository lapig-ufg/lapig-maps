var async = require('async')
	, unidecode = require('unidecode');

module.exports = function(app) {

	var config = app.config;
	var Layer = {};

	Layer.attributes = function(request, response) {
	  response.sendfile(config.appRoot + '/data/alias/attributes.json');
	};

	Layer.getYears = function(request, response){

		var layerCollection = app.repository.collections.layers;

		var year = [];

		var id = request.param('id');

			layerCollection.findOne({_id : app.repository.id(id)}, {"fileObj.date":1,"fileObj.name":1}, function(err, layer) {
				if (layer.fileObj != undefined){
				layer.fileObj.forEach(function(yearDate){

					year.push({
						'name':yearDate.name,
						'year':yearDate.date
						});
			});

			};
			result = { years: year };

			response.send(result);
			response.end()
		});
};

	Layer.byId = function(request, response){

		var layerCollection = app.repository.collections.layers;

		var id = request.param('id');

		layerCollection.findOne({_id : app.repository.id(id)}, function(err, layer) {
			if (layer.type == 'MULTIPLE'){
				var maior;
				var objeto;

			  	layer.fileObj.forEach(function(dateMultiple){

				    if (maior === undefined)
				      	maior=dateMultiple.date;
				    else if (dateMultiple.date>maior)
				      	maior=dateMultiple.date;
				  		objName = dateMultiple.name;
				  		objDate = dateMultiple.date;
				  		objType = dateMultiple.type;
				    });

			  layer.last_type = objType;
				layer.last_name = objName;
				layer.last_date = objDate;
				delete layer.fileObj;
			}

			response.send(layer);
			response.end()
		})
	};

	Layer.tree = function(request, response) {
		
		var layerCollection = app.repository.collections.layers;

		var projects = request.param('projects', '').toUpperCase().split(',')

		layerCollection.distinct('subject', { 'project': { $in: projects } }, function(err,subjects) {

			var result = [];

			var interate = function(subject, next){
				var subjectObj = {
							text:subject,
							iconCls: 'task-folder'
					};

				layerCollection.find({ 'subject': subject, 'project': { $in: projects } }).toArray(function (err, layers){
					
					var childrens = [];
					layers.sort(function(a,b) {
						var aText = unidecode(a.name);
						var baText = unidecode(b.name);

						if(aText < baText) return -1;
				    if(aText > baText) return 1;
				    return 0;
					})

					for(i in layers){
						var layer = layers[i];
						var children = {
						     text: layer.name,
						     id: layer._id,
						     leaf:true,
						     iconCls:'task'
					 }

						childrens.push(children);
					}

					subjectObj['children'] = childrens;

					result.push(subjectObj);
					next();
				});

			}

			var finalize = function(){

				result.sort(function(a,b) {
					var aText = unidecode(a.text);
					var baText = unidecode(b.text);

					if(aText < baText) return -1;
			    if(aText > baText) return 1;
			    return 0;
				})

				response.send(result);
				response.end();
			}

			async.each(subjects, interate, finalize);

		});

	};


	Layer.search = function(request, response){

		var layerCollection = app.repository.collections.layers;

		var skip = request.param('start');
		var limit = request.param('limit');
		var search = request.param('search');
		var projects = request.param('projects', '').toUpperCase().split(',')

		layerCollection.find({'project': { $in: projects }, 'search': new RegExp(search, 'i')}).skip(Number(skip)).limit(Number(limit)).toArray(function(err, layers) {
			layerCollection.find({'project': { $in: projects }, 'search': new RegExp(search, 'i')}).count(function(err, totalCount) {

					var result = {
				    totalCount: totalCount,
				    layers: layers
					}

					response.send(result);
					response.end();
			});
		});
	};

	return Layer;
}