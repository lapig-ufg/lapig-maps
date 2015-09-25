var sqlite3 = require('spatialite').verbose(),
		async = require('async'),
		csvWriter = require('csv-write-stream');

module.exports = function(app) {

	var Spatial = {};
	var Internal = {};
	var Utils = app.libs.utils
	var config = app.config
	
	var writer = csvWriter({
	  separator: '\t',
	  newline: '\n',
	  headers: undefined,
	  sendHeaders: true
	});

	var subjects = {
		'livestock': {
			'label': 'Pecuária',
			'table': 'livestock',
			'descriptors': [
				{
						'title': 'Área de Pastagem'
					,	'column': 'PAST_HA'
					,	'precision': 2
					,	'unitMeasure': ' ha'
				},
				{
						'title': 'Rebanho Bovino (2013)'
					,	'column': 'REB_2013'
					,	'precision': 0
					,	'unitMeasure': ' cbçs'
				},
				{
						'title': 'Qtd. matadouros e Frigoríficos'
					,	'column': 'N_FRIG_MAT'
					,	'precision': 0
					,	'unitMeasure': ''
				},
				{
						'title': 'Área desmatada (2014)'
					,	'column': 'DE_KM2_14'
					,	'precision': 2
					,	'unitMeasure': ' km²'
				},
				{
						'title': 'Área queimada (2014)'
					,	'column': 'QE_KM2_14'
					,	'precision': 2
					,	'unitMeasure': ' km²'
				}
			]
		}
	}

	var sectionDescriptors = 

	Internal.getSqlForCsv = function(table, columns, state) {
		return 		"SELECT NOME cidade, " + columns.join(',') 
						+ " FROM " + table
						+ " WHERE \"UF\" = '" + state + "'"
						+ " ORDER BY cidade ASC "
	}

	Internal.getSql = function(table, column, state, sort) {
		return 		"SELECT NOME info, " + column + " value, "
						+ " (MbrMinX(Geometry) || ',' || MbrMinY(Geometry) || ',' || MbrMaxX(Geometry) || ',' || MbrMaxY(Geometry)) as bbox "
						+ " FROM " + table
						+ " WHERE \"UF\" = '" + state + "' AND " + column + " > 0"
						+ " ORDER BY " + sort + ((sort == 'value') ? " DESC" : " ASC")
	}

	Internal.getSubject = function(subjectId) {
		return ( subjects[subjectId] ) ? subjects[subjectId] : null;
	}

	Spatial.query = function(request, response) {
	  
		var subjectId = request.param('subject', 'livestock');
		var state = request.param('state', 'GO');
		var sort = request.param('sort', 'value');

		var subject = Internal.getSubject(subjectId);

		if(subject) {
			var table = subject.table;
			var descriptors = subject.descriptors;

		  var spatialIntelligenceDb = new sqlite3.Database(config.spatialIntelligenceDb);
		  spatialIntelligenceDb.spatialite(function() {

		  	var result = [];

		  	var descEach = function(descriptor, next) {
		  		var section = {
			  		info: descriptor.title,
			  		value: 0,
			  		iconCls:'task-folder',
			  		children: []
			  	};
		  		
			  	var sql = Internal.getSql(table, descriptor.column, state, sort);

			  	var rowEach = function(err, row) {
			  		row.leaf = true;
				   	row.iconCls = 'task';
				   	section['value'] += row['value'];
				   	row['value'] = Utils.numberFormat(row['value'], descriptor.precision, '.', ',') + descriptor.unitMeasure;
				   	section.children.push(row);
			  	}

			  	var rowComplete = function() {
			  		section['value'] = Utils.numberFormat(section['value'], descriptor.precision, '.', ',') + descriptor.unitMeasure;
					  result.push(section);
					  next();
			  	}

			  	spatialIntelligenceDb.each(sql, rowEach, rowComplete)
		  	}

		  	var descComplete = function() {
		  		response.send(result)
					response.end()
		  	}

		  	async.eachSeries(descriptors, descEach, descComplete);

		  });

		} else {
			response.end('invalid subject');
		}


	};

	Spatial.csv = function(request, response) {

		var subjectId = request.param('subject', 'livestock');
		var state = request.param('state', 'GO');

		var subject = Internal.getSubject(subjectId);

		if(subject) {
			
			var table = subject.table;
			var filename = [table, '_br-', state].join('').toLowerCase()
			var columns = [];

			subject.descriptors.forEach(function(descriptor) {
				columns.push(descriptor.column);
			});

		  var spatialIntelligenceDb = new sqlite3.Database(config.spatialIntelligenceDb);
		  spatialIntelligenceDb.spatialite(function() {

		  	var sql = Internal.getSqlForCsv(table, columns, state);

		  	response.set('Content-Type', 'text/csv');
		  	response.set('Content-Disposition', 'attachment;filename=' + filename + '.csv');

		  	writer.pipe(response)

		  	var rowEach = function(err, row) {
					writer.write(row);
		  	}

		  	var rowComplete = function() {
					writer.end();
					response.end();
		  	}

		  	spatialIntelligenceDb.each(sql, rowEach, rowComplete)

		  });

		} else {
			response.end('invalid subject');
		}


	}

	return Spatial;

}
