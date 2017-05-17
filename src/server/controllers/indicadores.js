var sqlite3 = require('spatialite').verbose(),
		async = require('async');

module.exports = function(app) {

		var Indicadores = {};
		var Consults = {};
		var config = app.config;
		var translateEN = require(config.langDir + '/indicadores_en.json');

		Indicadores.metadata = [
						{
							"id": "area_soja",
							"categ": ["Agricultura"],
							"nome": "Área Plantada de Soja",
							"descricao": "Áreas de plantação de Soja em grão, por hectares, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "ha",
							"regiao":'Brasil',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"DB":{
									"Columm": "AREA_HA",
									"Table": "area_soja_regions_view",
									"Group": "GROUP BY ANO",
									"process": function(rows,metadata) {
											
											var anoAreaSoja = [];
											var valorAreaSoja = [];

											rows.forEach(function(areasoja){

													anoAreaSoja.push(areasoja.ANO)
													valorAreaSoja.push(areasoja.AREA_HA)
											})
											metadata['ano'] = anoAreaSoja
											metadata['valor'] = valorAreaSoja
									}
							}
						},
						{
							"id": "desmatamento",
							"categ": ["Agricultura", "Pecuária"],
							"nome": "Desmatamento",
							"descricao": "Dados de desmatamentos ocorridos, produzidos a partir de compilação de dados do PRODES (2005 - 2016), SIAD (2003 - 2016) e SOS Mata Atlântica (2011 - 2014)",
							"unidade": "ha",
							"regiao": "Brasil",
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"desmatamento_regions_view",
									"Group": "GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoDesmat = []
										var valorDesmat = []

										rows.forEach(function(desmat){
												anoDesmat.push(desmat.ANO)
												valorDesmat.push(desmat.AREA_HA)
										})
										metadata['ano'] = anoDesmat
										metadata['valor'] = valorDesmat
									}
							}
						},
						{
							"id": "trabalho_escravo",
							"categ": ["Social"],
							"nome": "Trabalho Escravo",
							"descricao": "Número de pessoas envolvidas por município, em ações de trabalhos forçados, jornada exaustiva, ou por sujeitá-lo a condições degradantes de trabalho, no período de 2000/ 2002 e de 2008 á 2015, produzidos pela CPT - Comissão Pastoral da Terra -  espacializados pelo Lapig.",
							"unidade": "pessoas",
							"regiao": "Brasil",
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"DB": {
									"Columm": "QTD_PESSOAS",
									"Table":"trabalho_escravo_regions_view",
									"Group": "GROUP BY ANO",
									"process": function(rows,metadata) {

										var anoTrabEscrav = [];
										var valorTrabEscrav = [];

										rows.forEach(function(trabescrav){
													anoTrabEscrav.push(trabescrav.ANO)
													valorTrabEscrav.push(trabescrav.QTD_PESSOAS)
											})
											metadata['ano'] = anoTrabEscrav
											metadata['valor'] = valorTrabEscrav
									}
							}
						},
						{
							"id": "unidades_conservacao_integral",
							"categ": ["Natural"],
							"nome": "Unidades de Conservação de Proteção Integral",
							"descricao": "Localização das unidades de conservação de proteção integral brasileiras, incluindo a Base ao Milionésimo do IBGE de 2014.",
							"unidade": "ha",
							"regiao": "Brasil",
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"DB":{
									"Columm": "AREA_HA",
									"Table": "unidades_conservacao_integral",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];
									}
							}
						}
		];

		Consults.getIndicadoresDb = function(callback) {
				var indicadoresDb = new sqlite3.Database(config.indicadoresDb);
				indicadoresDb.spatialite(function() {
						callback(indicadoresDb);
				});
		}

		Indicadores.getQuerySql = function(columm, table, filter, group ) {		
				var sqlOperation = 'sum';

				return 		"SELECT ANO, " + sqlOperation + "(" + columm + ") as " + columm
								+ " FROM \""+ table +"\" "
								+ filter
								+ group
		}

		Indicadores.getRegionFilter = function(regionType, region, columm) {	
				var filterPreffix = '';
				var filterSuffix = '';

				if (regionType == 'estado') {
					return "WHERE " + filterPreffix + 'UF' + filterSuffix + " = '" + region + "' AND "+ columm +" > 0 " ;
				} else if (regionType == 'municipio') {
					return "WHERE " + filterPreffix + 'COD_MUNICI' + filterSuffix + " = '" + region + "' AND "+ columm +" > 0 " ;
				}else if (regionType == 'bioma') {
					return "WHERE " + filterPreffix + 'BIOMA' + filterSuffix + " = '" + region + "' AND "+ columm +" > 0 " ;
				} else if (regionType == 'regiao' && region == 'Arco do Desmatamento') {
					return "WHERE " + filterPreffix + 'ARCODESMAT' + filterSuffix + " = '1' AND "+ columm +" > 0 " ;
				} else if (regionType == 'regiao' && region == 'MATOPIBA') {
					return "WHERE " + filterPreffix + 'MATOPIBA' + filterSuffix + " = '1' AND "+ columm +" > 0 " ;
				}
		}

		Indicadores.lista = function(request, response, next) {
				var metadata = Indicadores['metadata'];
				var result = [];

				var regionType = request.param('regionType', '');
				var region = request.param('region', '');
				var filter = '';

				var interate =  function(metadata, next){

						var fieldResult = {
								"id": metadata.id,
								"categ": metadata.categ,
								"nome": metadata.nome,
								"descricao": metadata.descricao,
								"unidade": metadata.unidade,
								"regiao":metadata.regiao,
								"valor": metadata.valor,
								"ano": metadata.ano,
								"tipo": metadata.tipo
						}

						if (regionType){
								filter = Indicadores.getRegionFilter(regionType, region, metadata.DB.Columm);
								metadata['regiao'] = region;
						}else{
								metadata['regiao'] = 'Brasil';
						}

						var sql = Indicadores.getQuerySql(metadata.DB.Columm, metadata.DB.Table, filter, metadata.DB.Group);
						
						Consults.getIndicadoresDb(function(indicadoresDb){
								indicadoresDb.all(sql, function(err, rows){
									metadata.DB.process(rows, fieldResult);
										result.push(fieldResult)
										next();
								});
						});
				}

				var finalize = function (){
					result.sort(function(a,b) {
					    if(a.id < b.id) return -1;
					    if(a.id > b.id) return 1;
					    return 0;
					})
						request.finalizeResult = result
						next();
				}

				async.each(metadata, interate, finalize);
		};

		Indicadores.regions = function(request, response) {

				var result = {
						"Estados": null,
						"Municipios": null,
						"Biomas": null,
						"Regioes": [{'nome': 'MATOPIBA'}, {'nome': 'Arco do Desmatamento'}],
						"Bacias": []
				}

				Consults.getIndicadoresDb(function(indicadoresDb){
						var sqlEstados = "SELECT DISTINCT UF, ESTADO FROM regions"
						var sqlMunicipios = "SELECT DISTINCT UF, MUNICIPIO, COD_MUNICI FROM regions"
						var sqlBiomas = "SELECT DISTINCT BIOMA	FROM regions"

						indicadoresDb.all(sqlEstados, function(err, rows) {
								result['Estados'] = rows;

								indicadoresDb.all(sqlMunicipios, function(err, rows) {
										var municipios = {}

										rows.forEach(function(regioes){
												if (!municipios[regioes.UF]){
													municipios[regioes.UF] = []
												}
												municipios[regioes.UF].push({'nome':regioes.MUNICIPIO, 'cod_mu': regioes.COD_MUNICI});
										});

										result['Municipios'] = municipios;
										
										indicadoresDb.all(sqlBiomas, function(err, rows) {
												result['Biomas'] = rows;

												response.setHeader("Access-Control-Allow-Origin", "http://localhost:8888/");
    										//response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
												response.send(result);
												response.end();
										})
								});
						});
				});
		};

		Indicadores.translateLista = function(request, response){
			if(response){
				var result = request.finalizeResult;
				var language = request.param('lang');

				if(language){
					if (language.toLowerCase() != 'pt-br'){

						for(i=0; i<result.length; i++){
							id = result[i].id;
							translateTitleMetadata = translateEN.fields[id];

							if (translateEN.fields[id] != undefined){
								result[i].nome = translateTitleMetadata.nome;
								result[i].descricao = translateTitleMetadata.descricao;
								result[i].unidade = translateTitleMetadata.unidade;
								result[i].categ = translateTitleMetadata.categ;
							}
						}
					}
				}

				response.setHeader("Access-Control-Allow-Origin", "http://localhost:8888/");
    		//response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
				response.send(result)
				response.end()
			}
		}

		return Indicadores;

}