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

	Internal.metadata = {
			"layer": "regions",
			"label": "Municípios",
			"columnCity": "COD_MUNICI",
			"fields": [
				{
					"name": "AGR_AREAHA",
					"layer": "cost_crop",
					"label": "Agricultura Anual (2014)",
					"unit": "ha",
					"metadata": "Agrosatélite",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "ALG_PROD",
					"layer": "",
					"label": "Algodão - Produção (2014)",
					"unit": "ton",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "ALG_RENMED",
					"layer": "",
					"label": "Algodão - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "IBGE",
					"precision": 1,
					"operation": "avg"
				}, 
				{
					"name": "PPE_AREAHA",
					"layer": "law_permanent_protected_area",
					"label": "Área de Proteção Permanente - INCRA",
					"unit": "ha",
					"metadata": "MMA",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "RLG_AREAHA",
					"layer": "law_legal_reserve_area",
					"label": "Área de Reserva Legal - INCRA",
					"unit": "ha",
					"metadata": "INCRA",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "ASS_AREAHA",
					"layer": "law_assentaments",
					"label": "Assentamentos Rurais - INCRA",
					"unit": "ha",
					"metadata": "INCRA",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "BFU_AREAHA",
					"layer": "law_land_basis",
					"label": "Base fundiária - INCRA",
					"unit": "ha",
					"metadata": "INCRA",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "BOV_ABAT",
					"layer": "",
					"label": "Bovinos - Abatidos (2006)",
					"unit": "cbçs",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "BOV_QTDE",
					"layer": "",
					"label": "Bovinos - Rebanho (2014)",
					"unit": "cbçs",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "CAN_PROD",
					"layer": "",
					"label": "Cana - Produção (2014)",
					"unit": "ton",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "CAN_RENMED",
					"layer": "",
					"label": "Cana - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "IBGE",
					"precision": 1,
					"operation": "avg"
				}, 
				{
					"name": "COM_TRADIC",
					"layer": "",
					"label": "Comunidades tradicionais (Fund. Palmares)",
					"unit": "",
					"metadata": "Fundação Palmares",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "CON_TERRA",
					"layer": "",
					"label": "Conflitos por terra - Registrados (2014)",
					"unit": "",
					"metadata": "CPT",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "CON_TERPES",
					"layer": "",
					"label": "Conflitos por terra - Pessoas envolvidas (2014)",
					"unit": "",
					"metadata": "CPT",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "DES_AREAHA",
					"layer": "tradeoff_deforestation",
					"label": "Desmatamento - Área (mais recente)",
					"unit": "ha",
					"metadata": "LAPIG-UFG/PRODES/PMDBBS/SOS-MATA-ATLÂNTICA",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "FIG_QTD",
					"layer": "infraestructure_slaughterhouse",
					"label": "Frigorificos e Matadouros",
					"unit": "",
					"metadata": "",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "FOR_AREAHA",
					"layer": "cost_planted_forest",
					"label": "Floresta plantada",
					"unit": "ha",
					"metadata": "WRI",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "LEI_LITROS",
					"layer": "",
					"label": "Leite - Produção (2006)",
					"unit": "l",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "MIL_PROD",
					"layer": "",
					"label": "Milho - Produção (2014)",
					"unit": "ton",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "MIL_RENMED",
					"layer": "",
					"label": "Milho - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "IBGE",
					"precision": 1,
					"operation": "avg"
				}, 
				{
					"name": "PIV_AREAHA",
					"layer": "infraestructure_pivot",
					"label": "Pivôs Centrais",
					"unit": "ha",
					"metadata": "EMBRAPA",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "QUI_AREAHA",
					"layer": "tradeoff_quilombos",
					"label": "Quilombolas - INCRA",
					"unit": "ha",
					"metadata": "INCRA",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "PAS_AREAHA",
					"layer": "cost_pasture",
					"label": "Pastagem",
					"unit": "ha",
					"metadata": "LAPIG/UFG",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "SIL_CAPTON",
					"layer": "infrastructure_warehouses",
					"label": "Silos - Capacidade Max.",
					"unit": "ton",
					"metadata": "",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "SOJ_PROD",
					"layer": "",
					"label": "Soja - Produção (2014)",
					"unit": "ton",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum"
				}, 
				{
					"name": "SOJ_RENMED",
					"layer": "",
					"label": "Soja - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "IBGE",
					"precision": 1,
					"operation": "avg"
				}, 
				{
					"name": "TRB_ESCRAV",
					"layer": "",
					"label": "Trabalho Escravo - Trabalhadores envolvidos",
					"unit": "",
					"metadata": "CPT",
					"precision": 0,
					"operation": "sum"
				},
				{
					"name": "PSU_AREAHA",
					"layer": "law_sustainable_protected_area",
					"label": "U.C. - Uso Sustentável",
					"unit": "ha",
					"metadata": "MMA",
					"precision": 0,
					"operation": "sum"
				},
				{
					"name": "PIN_AREAHA",
					"layer": "law_integral_protected_area",
					"label": "U.C. - Proteção Integral",
					"unit": "ha",
					"metadata": "MMA",
					"precision": 0,
					"operation": "sum"
				}
			]
	};

	Internal.getSpatialDb = function(callback) {
		var spatialDb = new sqlite3.Database(config.spatialIntelligenceDb);
		console.log(config.spatialIntelligenceDb)
		spatialDb.spatialite(function() {
			callback(spatialDb);
		});
	}

	Internal.getRegionFilter = function(regionType, region, city, toMapserver) {
		
		var filterPreffix = '';
		var filterSuffix = '';

		if(toMapserver) {
			filterPreffix = '\'[';
			filterSuffix = ']\'';
		}

		var cityFilter = '';
		if(city) {
			cityFilter = " \"COD_MUNICI\" = '" + city + "' AND ";
		}

		if (regionType == 'state') {
			return " " + cityFilter + filterPreffix + 'UF' + filterSuffix + " = '" + region + "'";
		} else if (regionType == 'biome') {
			return " " + cityFilter + filterPreffix + 'BIOMA' + filterSuffix + " = '" + region + "'";
		} else if (regionType == 'ROI' && region == 'ARC_DEFORESTATION') {
			return " " + cityFilter + filterPreffix + 'ARCODESMAT' + filterSuffix + " = '1' ";
		} else {
			return " " + cityFilter + filterPreffix + 'MATOPIBA' + filterSuffix + " = '1'"
		}
	}

	Internal.getCitieSql = function( regionFilter) {
		return 		"SELECT DISTINCT COD_MUNICI, (MUNICIPIO || ' - ' || UF)  info, bbox "
						+ " FROM \"regions\" "
						+ " WHERE " + regionFilter
						+ " ORDER BY info ASC"
	}

	Internal.getQuerySql = function(field, regionFilter, operation) {
		return 		"SELECT COD_MUNICI, (MUNICIPIO || ' - ' || UF)  info, bbox, " + operation + "(" + field + ") as value"
						+ " FROM \"regions\" "
						+ " WHERE " + regionFilter + " AND " + field + " > 0"
						+ " GROUP BY 1, 2, 3"
						+ " ORDER BY value DESC"
	}

	Internal.queryLayers = function(regionType, region, city, callback) {
		var metadata = Internal.metadata;

		Internal.getSpatialDb(function(spatialDb) {

	  	var result = [];
	  	var regionFilter = Internal.getRegionFilter(regionType, region, city, false);

	  	var fieldEach = function(field, next) {
	  		var section = {
		  		info: field.label,
		  		layer: field.layer,
		  		value: 0,
		  		count: 0,
		  		iconCls: (field.layer) ? 'spatial-intelligence-geosection' : 'spatial-intelligence-nogeosection',
		  		children: []
		  	};
	  		
		  	var sql = Internal.getQuerySql(field.name, regionFilter, field.operation);
		  	console.log(sql);
		  	
		  	var rowEach = function(err, row) {
		  		row.leaf = true;
			   	row.iconCls = (field.layer) ? 'spatial-intelligence-geomap' : 'spatial-intelligence-nomap';
			   	section['value'] += row['value'];
			   	section['count'] += 1;
			   	row['value'] = Utils.numberFormat(row['value'], field.precision, '.', ',') + " " + field.unit;
			   	section.children.push(row);
		  	}

		  	var rowComplete = function() {
		  		if(field.operation == 'avg' && section['value']) {
		  			section['value'] = section['value'] / section['count'];
		  			delete section['count'];
		  		}
		  		if(!section['value']) {
		  			section['value'] = 'Sem inform.';
		  		} else {
		  			section['value'] = Utils.numberFormat(section['value'], field.precision, '.', ',') + " " + field.unit;
		  		}
				  result.push(section);
				  next();
		  	}

		  	spatialDb.each(sql, rowEach, rowComplete)
	  	}

	  	var fieldComplete = function() {
	  		callback(result);
	  	}

	  	async.eachSeries(metadata.fields, fieldEach, fieldComplete);

		});

	}

	Internal.queryLayersForCsv = function(regionType, region, city, callback) {
		
		var metadata = Internal.metadata;

		var filename = (regionType + '_' + region  + ((city) ? '_' + city : '') ).toLowerCase();
		Internal.getSpatialDb(function(spatialDb) {

	  	var result = {};
	  	var regionFilter = Internal.getRegionFilter(regionType, region, city, false);

	  	var fieldEach = function(field, next) {
	  		
		  	var sql = Internal.getQuerySql(field.name, regionFilter, field.operation);
		  	
		  	var rowEach = function(err, row) {
		  		var columnName = field.label + ' - ' + field.unit;

					if(result[row['info']] == undefined) {
						result[row['info']] = {};
					}
					
					result[row['info']][metadata.label] = row['info'];

					if(result[row['info']][columnName] == undefined) {
						result[row['info']][columnName] = 0;
						result[row['info']][columnName+"_count"] = 0;
					}

					result[row['info']][columnName] +=  row['value'];
					result[row['info']][columnName+"_count"] += 1;
					
		  	}

		  	var rowComplete = function() {
		  		for (info in result) {
		  			for(columnName in result[info]) {
		  				if(result[info][columnName+"_count"] != undefined) {
		  					result[info][columnName] = result[info][columnName] / result[info][columnName+"_count"];
		  					result[info][columnName] = Utils.numberFormat(result[info][columnName], 2, '.', ',');
		  					delete result[info][columnName+"_count"];
		  				}
		  			}
		  		}
		  		
				  next();
		  	}

		  	spatialDb.each(sql, rowEach, rowComplete)
	  	}

	  	var fieldComplete = function() {
	  		callback(filename, result);
	  	}

	  	async.eachSeries(metadata.fields, fieldEach, fieldComplete);

		});
	}

	Internal.getSubject = function(subjectId, callback) {
		var spatialInteligenceColl = app.repository.collections.spatialInteligence;
		spatialInteligenceColl.findOne({ '_id': subjectId }, function(err, subject) {
			callback(subject);
		})
	}

	Spatial.metadata = function(request, response, next) {
		var regionType = request.param('regionType', 'state');
		var region = request.param('region', 'GO');

		var metadata = Internal.metadata;
		metadata.filter = Internal.getRegionFilter(regionType, region, '', true);
		metadata.titlePrefix = 'Municípios do(a) ';

		Internal.getSpatialDb(function(spatialDb) {
			var sqlRegionFilter = Internal.getRegionFilter(regionType, region, '', false);
			var sql = Internal.getCitieSql(sqlRegionFilter);

			spatialDb.all(sql, function(err, rows) {
				metadata.cities = rows;
				response.send(metadata);
			})

		});

	}

	Spatial.query = function(request, response, next) {
	  
		var regionType = request.param('regionType', 'state');
		var region = request.param('region', 'GO');
		var city = request.param('city', '');

		Internal.queryLayers(regionType, region, city, function(result) {
			/*request.finalizeResultQuery = result,
			next();*/
			response.send(result);
			response.end()
		});

	};

	Spatial.csv = function(request, response) {

		var regionType = request.param('regionType', 'state');
		var region = request.param('region', 'GO');
		var city = request.param('city', '');

		Internal.queryLayersForCsv(regionType, region, city, function(filename, result) {

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

		});

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
