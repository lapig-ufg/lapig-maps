var async = require('async')
	, unidecode = require('unidecode');

module.exports = function(app) {

	var config = app.config;
	var layerModel = app.models.layer;
	
	var Layer = {};

	Layer.attributes = function(request, response) {
	  response.sendfile(config.appRoot + '/data/attributes.json');
	};

	Layer.getYears = function(request, response){

		var year = [];
		var id = request.param('id');

		layerModel.findById(id, function(layer) {
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
			response.end();
		});	
	};

	Layer.byId = function(request, response){

		var id = request.param('id');

		layerModel.findById(id, function(layer) {
			
			delete layer.fileObj;

			response.send(layer);
			response.end();
		});
	};

	Layer.byBasepaths = function(request, response){

		var basepaths = request.param('basepaths');

		layerModel.findByBasepaths(basepaths, function(layers) {

			var result = []

			layers.forEach(function(layer) {
				delete layer.fileObj;
				result.push(layer);
			})

			response.send(result);
			response.end();
		});
	};

	Layer.tree = function(request, response) {

		var projects = request.param('projects', '');
		projects = projects.toUpperCase().split(',');

		layerModel.listAllSubjects(projects, function(subjects) {
			
			var result = [];

			var interate = function(subject, next){
				var subjectObj = {
							text:subject,
							iconCls: 'task-folder'
					};

				layerModel.findBySubject(subject, projects, function(layers) {
					
					var childrens = [];
					layers.sort(function(a,b) {
						var aName = unidecode(a.name);
						var bName = unidecode(b.name);

						if(aName < bName) return -1;
				    if(aName > bName) return 1;
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
					var bText = unidecode(b.text);

					if(aText < bText) return -1;
			    if(aText > bText) return 1;
			    return 0;
				})

				response.send(result);
				response.end();
			}

			async.each(subjects, interate, finalize);

		});
	};

	Layer.search = function(request, response){

		var skip = request.param('start');
		var limit = request.param('limit');
		var search = request.param('search');
		var projects = request.param('projects', '').toUpperCase().split(',')

		layerModel.findByRegexWithPagination(search, projects, skip, limit, function(totalCount, layers) {
			var result = {
		    totalCount: totalCount,
		    layers: layers
			}

			response.send(result);
			response.end();
		});
	};

	return Layer;
}