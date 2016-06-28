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
					"name": "DECLIV",
					"layer": "mu_br_hillshade_30_lapig",
					"type": "RASTER",
					"label": "Declividade média",
					"unit": "%",
					"metadata": "Agrosatélite",
					"precision": 2,
					"operation": "avg",
					"sort": 'asc'
				}, 
				{
					"name": "POL_HA",
					"layer": "",
					"label": "Área total",
					"unit": "ha",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AGR_AREAHA",
					"layer": "cost_crop",
					"type": "VECTOR",
					"label": "Agricultura Anual (2014)",
					"unit": "ha",
					"metadata": "Agrosatélite",
					"precision": 0,
					"operation": "sum",
					"excludeFromRegions": ['MATOPIBA','CERRADO'],
					"sort": 'desc'
				},
				{
					"name": "ALG_AREAHA",
					"layer": "cost_cotton",
					"type": "VECTOR",
					"label": "Algodão - Mapeamento (2014)",
					"unit": "ha",
					"metadata": "Agrosatélite",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ALG_APLAN",
					"layer": "",
					"label": "Algodão - Área Plantada (2014)",
					"unit": "ha",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ALG_TON",
					"layer": "",
					"label": "Algodão - Produção (2014)",
					"unit": "ton",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ALG_VL",
					"layer": "",
					"label": "Algodão - Valor da Produção (2014)",
					"unit": "R$",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ALG_RENMED",
					"layer": "",
					"label": "Algodão - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "IBGE",
					"precision": 2,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "PPE_AREAHA",
					"layer": "law_permanent_protected_area",
					"type": "VECTOR",
					"label": "Área de Proteção Permanente - INCRA",
					"unit": "ha",
					"metadata": "MMA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "RLGM_AREAHA",
					"layer": "",
					"label": "Área de Reserva Legal",
					"unit": "ha",
					"metadata": "UFMG",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ASS_AREAHA",
					"layer": "law_assentaments",
					"type": "VECTOR",
					"label": "Assentamentos Rurais - INCRA",
					"unit": "ha",
					"metadata": "INCRA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ATV_AMBIEN",
					"layer": "",
					"label": "Ativo Ambiental",
					"unit": "ha",
					"metadata": "UFMG",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "BFU_AREAHA",
					"layer": "law_land_basis",
					"type": "VECTOR",
					"label": "Base fundiária - INCRA",
					"unit": "ha",
					"metadata": "INCRA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "BOV_ABAT",
					"layer": "",
					"label": "Bovinos - Abatidos (2006)",
					"unit": "cbçs",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "BOV_QTDE",
					"layer": "",
					"label": "Bovinos - Rebanho (2014)",
					"unit": "cbçs",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SCA_AREAHA",
					"layer": "cost_sugar_cane",
					"type": "VECTOR",
					"label": "Cana - Mapeamento (2014)",
					"unit": "ha",
					"metadata": "CANASAT",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CAN_APLAN",
					"layer": "",
					"label": "Cana - Área Plantada (2014)",
					"unit": "ha",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CAN_TON",
					"layer": "",
					"label": "Cana - Produção (2014)",
					"unit": "ton",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CAN_VL",
					"layer": "",
					"label": "Cana - Valor da Produção (2014)",
					"unit": "R$",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},  
				{
					"name": "CAN_RENMED",
					"layer": "",
					"label": "Cana - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "IBGE",
					"precision": 2,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "COM_TRADIC",
					"layer": "",
					"label": "Comunidades tradicionais (Fund. Palmares)",
					"unit": "",
					"metadata": "Fundação Palmares",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CON_TERRA",
					"layer": "",
					"label": "Conflitos por terra - Registrados (2014)",
					"unit": "",
					"metadata": "CPT",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CON_TERPES",
					"layer": "",
					"label": "Conflitos por terra - Pessoas envolvidas (2014)",
					"unit": "",
					"metadata": "CPT",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
								{
					"name": "DFAPP_AREAHA",
					"layer": "",
					"label": "Déficit de APP",
					"unit": "ha",
					"metadata": "UFMG",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
								{
					"name": "DFRL_AREAHA",
					"layer": "",
					"label": "Déficit de Reserva Legal",
					"unit": "ha",
					"metadata": "UFMG",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "DES_AREAHA",
					"layer": "tradeoff_deforestation",
					"type": "VECTOR",
					"label": "Desmatamento (Ano mais recente)",
					"unit": "ha",
					"metadata": "LAPIG-UFG/PRODES/PMDBBS/SOS-MATA-ATLÂNTICA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "DES08_AREAHA",
					"layer": "tradeoff_deforestation_since_2008",
					"type": "VECTOR",
					"label": "Desmatamento Acumulado (2008-2015)",
					"unit": "ha",
					"metadata": "LAPIG-UFG/PRODES/",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "FIG_QTD",
					"layer": "infraestructure_slaughterhouse",
					"type": "VECTOR",
					"label": "Frigorificos e Matadouros",
					"unit": "",
					"metadata": "",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "FOR_AREAHA",
					"layer": "cost_planted_forest",
					"type": "VECTOR",
					"label": "Floresta plantada",
					"unit": "ha",
					"metadata": "WRI",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "IDHM",
					"layer": "",
					"label": "IDH (2010)",
					"unit": "",
					"metadata": "IBGE",
					"precision": 3,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "LEI_LITROS",
					"layer": "",
					"label": "Leite - Produção (2006)",
					"unit": "l",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "MIL_AREAHA",
					"layer": "cost_corn",
					"type": "VECTOR",
					"label": "Milho - Mapeamento (2014)",
					"unit": "ha",
					"metadata": "Agrosatélite",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "MIL_APLAN",
					"layer": "",
					"label": "Milho - Área Plantada (2014)",
					"unit": "ha",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "MIL_TON",
					"layer": "",
					"label": "Milho - Produção (2014)",
					"unit": "ton",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "MIL_VL",
					"layer": "",
					"label": "Milho - Valor da Produção (2014)",
					"unit": "R$",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},   
				{
					"name": "MIL_RENMED",
					"layer": "",
					"label": "Milho - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "IBGE",
					"precision": 2,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "PIV_AREAHA",
					"layer": "infraestructure_pivot",
					"type": "VECTOR",
					"label": "Pivôs Centrais",
					"unit": "ha",
					"metadata": "EMBRAPA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUI_AREAHA",
					"layer": "tradeoff_quilombos",
					"type": "VECTOR",
					"label": "Quilombolas - INCRA",
					"unit": "ha",
					"metadata": "INCRA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "PAS_AREAHA",
					"layer": "cost_pasture",
					"type": "VECTOR",
					"label": "Pastagem",
					"unit": "ha",
					"metadata": "LAPIG/UFG",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "CAP_CATTLE",
					"layer": "",
					"label": "Capacidade de Suporte",
					"unit": "UA/ha",
					"metadata": "LAPIG/UFG",
					"precision": 2,
					"operation": "avg",
					"applyOperationInSql": true,
					"sort": 'desc'
				}, 
				{
					"name": "IND_AREAHA",
					"layer": "law_indigenous_land",
					"label": "Reserva Indígena",
					"unit": "ha",
					"metadata": "FUNAI",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SIL_CAPTON",
					"layer": "infrastructure_warehouses",
					"type": "VECTOR",
					"label": "Silos - Capacidade Max.",
					"unit": "ton",
					"metadata": "",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SOJ_AREAHA",
					"layer": "cost_soy",
					"type": "VECTOR",
					"label": "Soja - Mapeamento (2014)",
					"unit": "ha",
					"metadata": "Agrosatélite",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SOJ_APLAN",
					"layer": "",
					"label": "Soja - Área Plantada (2014)",
					"unit": "ha",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SOJ_TON",
					"layer": "",
					"label": "Soja - Produção (2014)",
					"unit": "ton",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SOJ_VL",
					"layer": "",
					"label": "Soja - Valor da Produção (2014)",
					"unit": "R$",
					"metadata": "IBGE",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},   
				{
					"name": "SOJ_RENMED",
					"layer": "",
					"label": "Soja - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "IBGE",
					"precision": 2,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "TRB_ESCRAV",
					"layer": "",
					"label": "Trabalho Escravo - Trabalhadores envolvidos",
					"unit": "",
					"metadata": "CPT",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "PSU_AREAHA",
					"layer": "law_sustainable_protected_area",
					"type": "VECTOR",
					"label": "U.C. - Uso Sustentável",
					"unit": "ha",
					"metadata": "MMA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "PIN_AREAHA",
					"layer": "law_integral_protected_area",
					"type": "VECTOR",
					"label": "U.C. - Proteção Integral",
					"unit": "ha",
					"metadata": "MMA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "REM_AREAHA",
					"layer": "cost_native_vegetation",
					"type": "VECTOR",
					"label": "Vegetação Nativa",
					"unit": "ha",
					"metadata": "MMA",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
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

	Internal.getRegionFilterForRaster = function(regionType, region) {

		if (regionType == 'state') {
			return "{CITY_CODE}";
		} else if (regionType == 'biome') {
			return "{CITY_CODE}_"+region;
		} else if (regionType == 'ROI' && region == 'ARC_DEFORESTATION') {
			return "{CITY_CODE}_ARCO";
		} else {
			return "{CITY_CODE}_MATOPIBA";
		}
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

	Internal.getQuerySql = function(field, regionFilter, operation, sort, applyOperationInSql) {
		
		var sqlOperation = 'sum';
		if(applyOperationInSql)
			sqlOperation = operation;

		return 		"SELECT COD_MUNICI, (MUNICIPIO || ' - ' || UF)  info, bbox, " + sqlOperation + "(" + field + ") as value"
						+ " FROM \"regions\" "
						+ " WHERE " + regionFilter + " AND " + field + " > 0"
						+ " GROUP BY 1, 2, 3"
						+ " ORDER BY value " + sort
	}

	Internal.queryLayers = function(regionType, region, city, language, callback) {
		var metadata = Internal.metadata;

		Internal.getSpatialDb(function(spatialDb) {

	  	var result = [];
	  	var regionFilter = Internal.getRegionFilter(regionType, region, city, false);

	  	var fieldEach = function(field, next) {

	  		if(field['excludeFromRegions']) {
	  			for(var key in field['excludeFromRegions']) {
	  				var r = field['excludeFromRegions'][key];
	  				console.log((r == region), r,region);
	  				if(r == region) {
	  					next();
	  					return;
	  				}
	  			}
	  		}

	  		var section = {
		  		info: field.label,
		  		layer: field.layer,
		  		name: field.name,
		  		value: 0,
		  		count: 0,
		  		iconCls: (field.layer) ? 'spatial-intelligence-geosection' : 'spatial-intelligence-nogeosection',
		  		qtip: field.metadata,
		  		children: []
		  	};
	  		
		  	var sql = Internal.getQuerySql(field.name, regionFilter, field.operation, field.sort, field.applyOperationInSql);
		  	console.log(sql);
		  	
		  	var rowEach = function(err, row) {
		  		row.leaf = true;
			   	row.iconCls = (field.layer) ? 'spatial-intelligence-geomap' : 'spatial-intelligence-nomap';
			   	section['value'] += row['value'];
			   	section['count'] += 1;
			   	row['value'] = Utils.numberFormat(row['value'], field.precision, '.', ',') + " " + field.unit;
			   	row['qtip'] = ( field.layer ) ? 'Clique duas vezes para visualizar essa informação no mapa.' : 'Informação disponível apenas em formato tabular. Clique duas vezes para localizar esse município no mapa.'
			   	section.children.push(row);
		  	}

		  	var rowComplete = function() {
		  		if(field.operation == 'avg' && section['value']) {
		  			section['value'] = section['value'] / section['count'];
		  			delete section['count'];
		  		}
		  		if(!section['value']) {
		  			section['value'] = (language && language.toLowerCase() == 'pt-br') ? 'Sem inform.' : 'No info';
		  			section['disabled'] = true;
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
	  		
	  		if(field['excludeFromRegions']) {
	  			for(var key in field['excludeFromRegions']) {
	  				var r = field['excludeFromRegions'][key];
	  				console.log((r == region), r,region);
	  				if(r == region) {
	  					next();
	  					return;
	  				}
	  			}
	  		}

		  	var sql = Internal.getQuerySql(field.name, regionFilter, field.operation, field.sort, field.applyOperationInSql);
		  	
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
		metadata.filterRaster = Internal.getRegionFilterForRaster(regionType, region);
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
		var language = request.param('lang');
		var city = request.param('city', '');

		Internal.queryLayers(regionType, region, city, language, function(result) {
			request.finalizeResultQuery = result,
			next();
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

	Spatial.translateQuery = function(request, response){

			if(response){
					var result = request.finalizeResultQuery;
					var language = request.param('lang');

					if (language.toLowerCase() != 'pt-br'){

							for(i=0; i<result.length; i++){
									name = result[i].name;
									translateTitleMetadata = translateEN.fields[name];

									if (translateEN.fields[name] != undefined){
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
