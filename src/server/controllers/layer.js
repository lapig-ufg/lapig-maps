var async = require('async')
	, unidecode = require('unidecode');
var fs = require('fs');

module.exports = function(app) {

		var config = app.config;
		var layerModel = app.models.layer;
		var translateEN = require(config.langDir + '/Layer_en.json');
		
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
												'name' : yearDate.name,
												'year' : yearDate.date,
												'type' : yearDate.type
										});
								});
						};
						
						result = { years: year };
						response.send(result);
						response.end();
				});	
		};

		Layer.byId = function(request, response, next){

				var id = request.param('id');

				layerModel.findById(id, function(layer) {
					
						//delete layer.fileObj;

						request.finalizeResultById = layer;
						next();
				});
		};
		
		Layer.byBasepaths = function(request, response, next){

				var basepaths = request.param('basepaths');
				var language = request.param('language').toLowerCase();
				var fs = require('fs');

				if(fs.existsSync(config.langDir + '/'+language+'.json')==true){
						var lang = require(config.langDir + '/'+language+'.json');
				}
				else{
						var lang = require(config.langDir + '/en-us.json');
				}

				layerModel.findByBasepaths(basepaths, function(layers) {

						var result = {
								layers: [],
								lang: lang
						}

						layers.forEach(function(layer) {
								//delete layer.fileObj;
								result.layers.push(layer);
						})
						request.finalizeResultByBasepath = result;
						next();
				});
		};

		Layer.tree = function(request, response, next) {

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
						};

						var finalize = function(){

								result.sort(function(a,b) {
										var aText = unidecode(a.text);
										var bText = unidecode(b.text);

										if(aText < bText) return -1;
								    if(aText > bText) return 1;
								    return 0;
								})
								request.finalizeResultTree = result;
								next();
						}

						async.each(subjects, interate, finalize);

				});
		};

		Layer.search = function(request, response, next){

				var skip = request.param('start');
				var limit = request.param('limit');
				var search = request.param('search');
				var projects = request.param('projects', '').toUpperCase().split(',');
				var lang = request.param('lang');
				var result = [];
			
						layerModel.findByRegexWithPagination(search, projects, skip, limit, lang, function(totalCount, layers) {
								result.push({
								    totalCount: totalCount,
								    layers: layers
								})
								request.finalizeResultSearch = result;
								next();
						});
		};

		Layer.translateTree = function(request, response){

				if(response){
						var result = request.finalizeResultTree
						var language = response.req.query.lang

						if(language != 'pt-br'){
								result.forEach(function(layer) {
										nameCat = layer.text;
										categoriaEn = translateEN.subjects[nameCat];
										layer.text = categoriaEn;

										for(i=0; i<layer.children.length; i++){
												idLayer = layer.children[i].id;
												nameEn = translateEN.layers[idLayer];

												if (translateEN.layers[idLayer] != undefined){
														layer.children[i].text = nameEn.name
												}
										}
								})
						}
				    response.send(result);
				    response.end()
		    }
		};

		Layer.translateSearch = function(request, response){
				if(response){
						var result = request.finalizeResultSearch[0]
						var language = request.param('lang');

						if(language != 'pt-br'){

								result = request.finalizeResultSearch

								result.forEach(function(layer) {

										for(i=0; i<layer.layers.length; i++){
												idLayer = layer.layers[i]._id;
												translateNameDesc = translateEN.layers[idLayer];

												if (translateEN.layers[idLayer] != undefined){
													layer.layers[i].name = translateNameDesc.name
													layer.layers[i].description = translateNameDesc.description
													layer.layers[i].subject = translateEN.subjects[layer.layers[i].subject]
													layer.layers[i].search = layer.layers[i].name + ' ' + layer.layers[i].description + ' ' + layer.layers[i].subject + ' ' + layer.layers[i]._id
												}
										}
								})
								response.send(result[0]);
						}else{
								response.send(result);
						}
						response.end();
				}
		};

		Layer.translateById = function(request, response){
				if(response){
						var result = request.finalizeResultById
						var language = request.param('lang')

						if(language !='pt-br'){
								idLayer = result._id;
								translateNameDesc = translateEN.layers[idLayer];
								if(translateEN.layers[idLayer]) {
									result.name = translateNameDesc.name;
									result.description = translateNameDesc.description;
									result.subject = translateEN.subjects[result.subject]
									result.search = result.name + ' ' + result.description + ' ' + result.subject + ' ' + result._id
								}
						}

						response.send(result);
						response.end();
				}
		}

		Layer.translateByBasepaths = function(request,response){
				if(response){
						var result = request.finalizeResultByBasepath;
						var language = request.body.language

						if(language !='pt-br'){
								for(i=0; i<result.layers.length; i++){
										idLayer = result.layers[i]._id;
										translateNameDesc = translateEN.layers[idLayer];
										result.layers[i].name = translateNameDesc.name;
										result.layers[i].description = translateNameDesc.description
										result.layers[i].subject = translateEN.subjects[result.layers[i].subject]
										result.layers[i].search = result.layers[i].name + ' ' + result.layers[i].description + ' ' + result.layers[i].subject + ' ' + result.layers[i]._id
								}
						};
						response.send(result);
						response.end();
				}
		}

		return Layer;
}