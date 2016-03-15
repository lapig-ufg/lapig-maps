var sqlite3 = require('spatialite').verbose(),
		async = require('async'),
		csvWriter = require('csv-write-stream'),
		iconv = require('iconv');

module.exports = function(app) {

	var Spatial = {};
	var Internal = {};
	var Utils = app.libs.utils
	var config = app.config
	var translateEN = require(config.langDir + '/Spatial-Inteligence_en.json');

	Internal.getSpatialDb = function(callback) {
		var spatialDb = new sqlite3.Database(config.spatialIntelligenceDb);
		spatialDb.spatialite(function() {
			callback(spatialDb);
		});
	}

	Internal.getSql = function(table, operation, column, state, sort) {
		return 		"SELECT COD_MUN, NM_MUN info, " + operation + "(" + column + ") value, bbox "
						+ " FROM " + table
						+ " WHERE NM_UF = '" + state + "'"
						+ " GROUP BY info"
						+ " ORDER BY " + sort + ((sort == 'value') ? " DESC" : " ASC")
	}

	Internal.queryLayers = function(subjectId, state, sort, callback) {
		Internal.getSubject(subjectId, function(subject) {
			if(subject) {
				
				var layers = subject.layers;

				Internal.getSpatialDb(function(spatialDb) {

			  	var result = [];

			  	var descEach = function(layer, next) {
			  		var section = {
				  		info: layer.title,
				  		table: layer.table,
				  		value: 0,
				  		iconCls:'task-folder',
				  		children: []
				  	};
			  		
				  	var sql = Internal.getSql(layer.table, layer.operation, layer.column, state, sort);
				  	
				  	var rowEach = function(err, row) {
				  		row.leaf = true;
					   	row.iconCls = 'task';
					   	section['value'] += row['value'];
					   	row['value'] = Utils.numberFormat(row['value'], layer.precision, '.', ',') + layer.unitMeasure;
					   	section.children.push(row);
				  	}

				  	var rowComplete = function() {
				  		section['value'] = Utils.numberFormat(section['value'], layer.precision, '.', ',') + layer.unitMeasure;
						  result.push(section);
						  next();
				  	}

				  	spatialDb.each(sql, rowEach, rowComplete)
			  	}

			  	var descComplete = function() {
			  		callback(result);
			  	}

			  	async.eachSeries(layers, descEach, descComplete);

			  });

			} else {
				callback([]);
			}
		});
	}

	Internal.queryLayersForCsv = function(subjectId, state, sort, callback) {
		Internal.getSubject(subjectId, function(subject) {
			if(subject) {
				
				var layers = subject.layers;
				var filename = [subject.label, "-", state].join('').toLowerCase()

				Internal.getSpatialDb(function(spatialDb) {

			  	var result = {};

					var layerEach = function(layer, next) {
						
				  	var sql = Internal.getSql(layer.table, layer.operation, layer.column, state, sort);
				  	
				  	var rowEach = function(err, row) {
				  		var columnName = layer.title + ' -' + layer['unitMeasure'];

				  		if(result[row['info']] == undefined) {
				  			result[row['info']] = {};
				  		}

				  		result[row['info']][subject.region.title] = row['info'];
							result[row['info']][columnName] = row['value'];
				  	}

				  	var rowComplete = function() {
						  next();
				  	}

				  	spatialDb.each(sql, rowEach, rowComplete)
					}

					var layerComplete = function() {
						callback(filename, result);
					}

					async.eachSeries(layers, layerEach, layerComplete);

			  });

			} else {
				callback([]);
			}
		});
	}

	Internal.getSubject = function(subjectId, callback) {
		var spatialInteligenceColl = app.repository.collections.spatialInteligence;
		spatialInteligenceColl.findOne({ '_id': subjectId }, function(err, subject) {
			callback(subject);
		})
	}

	Spatial.metadata = function(request, response, next) {
		var subjectId = request.param('subject', 'livestock');

		Internal.getSubject(subjectId, function(subject) {
			
			request.finalizeResultMetadata = subject;
			next();
		});
	}

	Spatial.query = function(request, response,next) {
	  
		var subjectId = request.param('subject', 'livestock');
		var state = request.param('state', 'GO');
		var sort = request.param('sort', 'value');

		Internal.queryLayers(subjectId, state, sort, function(result) {
				request.finalizeResultQuery = result,
				next();
		});

	};

	Spatial.csv = function(request, response) {

		var subjectId = request.param('subject', 'livestock');
		var state = request.param('state', 'GO');
		var sort = request.param('sort', 'value');

		Internal.queryLayersForCsv(subjectId, state, sort, function(filename, result) {

			response.set('Content-Type', 'text/csv');
	  	response.set('Content-Disposition', 'attachment;filename=' + filename + '.csv');

	  	var writer = csvWriter({
			  separator: ';',
			  newline: '\n',
			  headers: undefined,
			  sendHeaders: true
			});

	  	var encoder = new iconv.Iconv('utf-8', 'latin1');

	  	writer.pipe(encoder, { end: false });
	  	encoder.pipe(response, { end: false });

			for(info in result) {
				writer.write(result[info])
			}

			writer.on('end', function() {
				encoder.end()
				response.end();
			})

			writer.end();
		})

	}

	Spatial.translateMetadata = function(request, response){

			if(response){
					var result = request.finalizeResultMetadata;
					var language = request.param('lang');
					
					if(language != 'pt-br'){

							result.region.title = 'Municipality';

							for(i=0; i<result.layers.length; i++){
									idLayer = result.layers[i].table;
									translateTitleMetadata = translateEN.layers[idLayer];

									if (translateEN.layers[idLayer] != undefined){
											result.layers[i].title = translateTitleMetadata.title,
											result.layers[i].metadata = translateTitleMetadata.metadata
									}
							}
					}

					response.send(result)
					response.end()
			}
	}

	Spatial.translateQuery = function(request, response){

			if(response){
					var result = request.finalizeResultQuery;
					var language = request.param('lang')

					if (language != 'pt-br'){

							for(i=0; i<result.length; i++){
									idLayer = result[i].table;
									translateTitleMetadata = translateEN.layers[idLayer];

									if (translateEN.layers[idLayer] != undefined){
											result[i].info = translateTitleMetadata.title
									}
							}
					}
					
					response.send(result)
					response.end()
			}
	}

	return Spatial;
}
