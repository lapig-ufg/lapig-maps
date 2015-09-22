var sqlite3 = require('spatialite').verbose(),
		async = require('async');

module.exports = function(app) {

	var Spatial = {};
	var Internal = {};
	var Utils = app.libs.utils
	var config = app.config

	Internal.getSql = function(table, column, state, sort) {
		return 		"SELECT NOME info, " + column + " value, X(CENTROID(Geometry)) LON, Y(CENTROID(Geometry)) LAT "
						+ " FROM " + table
						+ " WHERE \"UF\" = '" + state + "' AND " + column + " > 0"
						+ " ORDER BY " + sort + ((sort == 'value') ? " DESC" : " ASC")
	}


	Spatial.query = function(request, response) {
	  
		var sectionDescriptors = [
			{
					'title': 'Área de Pastagem'
				,	'column': 'PAST_HA'
				,	'table': 'livestock'
				,	'precision': 2
				,	'unitMeasure': ' ha'
			},
			{
					'title': 'Rebanho Bovino (2013)'
				,	'column': 'REB_2013'
				,	'table': 'livestock'
				,	'precision': 0
				,	'unitMeasure': ' cbçs'
			},
			{
					'title': 'Qtd. matadouros e Frigoríficos'
				,	'column': 'N_FRIG_MAT'
				,	'table': 'livestock'
				,	'precision': 0
				,	'unitMeasure': ''
			},
			{
					'title': 'Área desmatada (2014)'
				,	'column': 'DE_KM2_14'
				,	'table': 'livestock'
				,	'precision': 2
				,	'unitMeasure': ' km²'
			},
			{
					'title': 'Área queimada (2014)'
				,	'column': 'QE_KM2_14'
				,	'table': 'livestock'
				,	'precision': 2
				,	'unitMeasure': ' km²'
			}
		]

		var state = request.param('state', 'GO');
		var sort = request.param('sort', 'value');

	  var spatialIntelligenceDb = new sqlite3.Database(config.spatialIntelligenceDb);
	  spatialIntelligenceDb.spatialite(function() {

	  	var result = [];

	  	var sectionEach = function(sectionDesc, next) {
	  		var section = {
		  		info: sectionDesc.title,
		  		value: 0,
		  		iconCls:'task-folder',
		  		children: []
		  	};
	  		
		  	var sql = Internal.getSql(sectionDesc.table, sectionDesc.column, state, sort);

		  	var rowEach = function(err, row) {
		  		row.leaf = true;
			   	row.iconCls = 'task';
			   	section['value'] += row['value'];
			   	row['value'] = Utils.numberFormat(row['value'], sectionDesc.precision, '.', ',') + sectionDesc.unitMeasure;
			   	section.children.push(row);
		  	}

		  	var rowComplete = function() {
		  		section['value'] = Utils.numberFormat(section['value'], sectionDesc.precision, '.', ',') + sectionDesc.unitMeasure;
				  result.push(section);
				  next();
		  	}

		  	spatialIntelligenceDb.each(sql, rowEach, rowComplete)
	  	}

	  	var sectionComplete = function() {
	  		response.send(result)
				response.end()
	  	}

	  	async.eachSeries(sectionDescriptors, sectionEach, sectionComplete);

	  });

	};

	return Spatial;

}
