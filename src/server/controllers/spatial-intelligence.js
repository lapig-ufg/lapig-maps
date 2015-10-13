var sqlite3 = require('spatialite').verbose(),
		async = require('async'),
		csvWriter = require('csv-write-stream'),
		iconv = require('iconv');

module.exports = function(app) {

	var Spatial = {};
	var Internal = {};
	var Utils = app.libs.utils
	var config = app.config

	var subjects = {
		'livestock': {
			'label': 'Pecuária',
			'region': {
				'layer': 'cities',
				'title': 'Municípios',
				'columns': {
					'stateAb': 'NM_UF',
					'cityCode': 'COD_MUN'
				}
			},
			'layers': [
				{
						'title': 'Rebanho Bovino (2013)'
					,	'column': 'REB_2013'
					,	'operation': 'SUM'
					,	'table': 'livestock_cattle_heads_2013'
					,	'precision': 0
					,	'unitMeasure': ' cbçs'
					,	'visualization': true
				},
				{
						'title': 'Frigoríficos/Matadouros'
					,	'column': 'PK_UID'
					,	'operation': 'COUNT'
					,	'table': 'livestock_slaughterhouse'
					,	'precision': 0
					,	'unitMeasure': ''
					,	'visualization': true
				},
				{
						'title': 'Área queimada (2014)'
					,	'column': 'QUEI_HA_14'
					,	'operation': 'SUM'
					,	'table': 'livestock_burned_2014'
					,	'precision': 0
					,	'unitMeasure': ' ha'
					,	'visualization': true
				},
				{
						'title': 'Área desmatada (2014)'
					,	'column': 'DESM_HA_14'
					,	'operation': 'SUM'
					,	'table': 'livestock_deforestation_2014'
					,	'precision': 0
					,	'unitMeasure': ' ha'
					,	'visualization': true
				},
				{
						'title': 'Áreas de Pastagem'
					,	'column': 'PAST_HA'
					,	'operation': 'SUM'
					,	'table': 'livestock_grasslands'
					,	'precision': 0
					,	'unitMeasure': ' ha'
					,	'visualization': true
				},
			]
		}
	}

	Internal.getSqlForCsv = function(table, columns, state) {
		return 		"SELECT NOME cidade, " + columns.join(',') 
						+ " FROM " + table
						+ " WHERE \"UF\" = '" + state + "'"
						+ " ORDER BY cidade ASC "
	}

	Internal.getSql = function(table, operation, column, state, sort) {
		return 		"SELECT COD_MUN, NM_MUN info, " + operation + "(" + column + ") value, bbox "
						+ " FROM " + table
						+ " WHERE NM_UF = '" + state + "'"
						+ " GROUP BY info"
						+ " ORDER BY " + sort + ((sort == 'value') ? " DESC" : " ASC")
	}

	Internal.getSubject = function(subjectId) {
		return ( subjects[subjectId] ) ? subjects[subjectId] : null;
	}

	Spatial.metadata = function(request, response) {
		var subjectId = request.param('subject', 'livestock');

		var subject = Internal.getSubject(subjectId);
		response.send(subject)
		response.end()
	}

	Spatial.query = function(request, response) {
	  
		var subjectId = request.param('subject', 'livestock');
		var state = request.param('state', 'GO');
		var sort = request.param('sort', 'value');

		var subject = Internal.getSubject(subjectId);

		if(subject) {
			var layers = subject.layers;

		  var spatialIntelligenceDb = new sqlite3.Database(config.spatialIntelligenceDb);
		  spatialIntelligenceDb.spatialite(function() {

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
			  	console.log(sql);
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

			  	spatialIntelligenceDb.each(sql, rowEach, rowComplete)
		  	}

		  	var descComplete = function() {
		  		response.send(result)
					response.end()
		  	}

		  	async.eachSeries(layers, descEach, descComplete);

		  });

		} else {
			response.end('invalid subject');
		}

	};

	Spatial.csv = function(request, response) {

		var subjectId = request.param('subject', 'livestock');
		var state = request.param('state', 'GO');
		var sort = request.param('sort', 'value');

		var subject = Internal.getSubject(subjectId);

		if(subject) {
			var layers = subject.layers;

			var filename = [subject.label, "-", state].join('').toLowerCase()

			var spatialIntelligenceDb = new sqlite3.Database(config.spatialIntelligenceDb);
			spatialIntelligenceDb.spatialite(function() {

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

			  	spatialIntelligenceDb.each(sql, rowEach, rowComplete)
				}

				var layerComplete = function() {

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
				}

				async.eachSeries(layers, layerEach, layerComplete);

			});
		} else {
			response.end('invalid subject');
		}

	}

	return Spatial;

}
