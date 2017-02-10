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
					"layerLabel": "Relevo Sombreado",
					"unit": "%",
					"metadata": "Dado gerado pelo LAPIG/UFG utilizando imagens STRM com resolução espacial de 30m e abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"sort": 'asc'
				}, 
				{
					"name": "POL_HA",
					"layer": "",
					"label": "Área total",
					"unit": "ha",
					"metadata": "Dado gerado pela Base Territorial do IBGE.",
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
					"metadata": "Compilação de mapeamentos de agricultura organizado pela empresa Agrosatélite, incluindo dados produzidos pela própria empresa no âmbito de diversos projetos, bem como a classe de agricultura do produto MCD12Q1. Essa compilação possui abrangência territorial para todo Brasil.",
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
					"metadata": "Mapeamento produzido pela empresa Agrosatélite no âmbito do Projeto \"Geospatial analyses of the annual crops dynamic in the Brazilian Cerrado biome: 2000 to 2014\" financiado pela \"Gordon and Betty Moore Foundation\". Sua abrangência territorial compreende apenas o bioma Cerrado.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ALG_APLAN",
					"layer": "",
					"label": "Algodão - Área Plantada (2014)",
					"unit": "ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ALG_TON",
					"layer": "",
					"label": "Algodão - Produção (2014)",
					"unit": "ton",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ALG_VL",
					"layer": "",
					"label": "Algodão - Valor da Produção (2014)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ALG_RENMED",
					"layer": "",
					"label": "Algodão - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "PPE_AREAHA",
					"layer": "law_permanent_protected_area",
					"type": "VECTOR",
					"label": "Área de Proteção Permanente",
					"unit": "ha",
					"metadata": "Dado produzido pelo INCRA, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "RLGM_AREAHA",
					"layer": "",
					"label": "Área de Reserva Legal",
					"unit": "ha",
					"metadata": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ASS_AREAHA",
					"layer": "law_assentaments",
					"type": "VECTOR",
					"label": "Assentamentos Rurais",
					"unit": "ha",
					"metadata": "Dado produzido pelo INCRA, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ATV_AMBIEN",
					"layer": "",
					"label": "Ativo Ambiental",
					"unit": "ha",
					"metadata": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "BFU_AREAHA",
					"layer": "law_land_basis",
					"type": "VECTOR",
					"label": "Base fundiária (INCRA)",
					"unit": "ha",
					"metadata": "Dado produzido pelo INCRA, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "BOV_ABAT",
					"layer": "",
					"label": "Bovinos - Abatidos (2006)",
					"unit": "cbçs",
					"metadata": "Dado produzido pelo IBGE por meio do Censo Agropecuário, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "BOV_QTDE",
					"layer": "",
					"label": "Bovinos - Rebanho (2014)",
					"unit": "cbçs",
					"metadata": "Dado de efetivo de rebanho produzido pelo IBGE por meio da Pesquisa Pecuária Municipal, com abrangência territorial para todo Brasil.",
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
					"metadata": "Dado produzido pela empresa Agrosatélite no âmbito do Canasat - sistema de monitoramento remoto via satélite das áreas de produção de cana-de-açúcar na região Centro-Sul do Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CAN_APLAN",
					"layer": "",
					"label": "Cana - Área Plantada (2014)",
					"unit": "ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CAN_TON",
					"layer": "",
					"label": "Cana - Produção (2014)",
					"unit": "ton",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CAN_VL",
					"layer": "",
					"label": "Cana - Valor da Produção (2014)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},  
				{
					"name": "CAN_RENMED",
					"layer": "",
					"label": "Cana - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "COM_TRADIC",
					"layer": "",
					"label": "Comunidades Tradicionais",
					"unit": "",
					"metadata": "Dado produzido pela Fundação Cultural Palmares, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CON_TERRA",
					"layer": "",
					"label": "Conflitos por terra - Registrados",
					"unit": "",
					"metadata": "Dado produzido pela Comissão Pastoral da Terra (CPT), com refrência em 2014 e abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "CON_TERPES",
					"layer": "",
					"label": "Conflitos por terra - Pessoas envolvidas",
					"unit": "",
					"metadata": "Dado produzido pela Comissão Pastoral da Terra (CPT), com refrência em 2014 e abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
								{
					"name": "DFAPP_AREAHA",
					"layer": "",
					"label": "Déficit de APP",
					"unit": "ha",
					"metadata": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
								{
					"name": "DFRL_AREAHA",
					"layer": "",
					"label": "Déficit de Reserva Legal",
					"unit": "ha",
					"metadata": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
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
					"metadata": "Compilação de dados organizados pelo LAPIG/UFG considerando apenas os programas de monitoramento de desmatamento brasileiros. Para o bioma Amazônia considerou-se os dados do PRODES, produzidos pelo INPE, com o período de referência 2014/2015. Para o bioma Cerrado utilizou-se os dados do SIAD, produzidos pelo LAPIG/UFG, com o período de referência 2014/2015. Os dados, com período de referência 2013/2014, produzidos pela SOS Mata Atlântica foram utilizados no bioma Mata Atlântica. Nos biomas Caatinga, Pampa e Pantanal considerou-se os dados produzidos no âmbito do PMDBBS, período de referência 2008/2009.",
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
					"metadata": "Compilação de dados organizados pelo LAPIG/UFG considerando apenas os programas de monitoramento de desmatamento brasileiros. Para o bioma Amazônia considerou-se os dados do PRODES, produzidos pelo INPE, com o período de referência 2008/2009 à 2014/2015. Para o bioma Cerrado utilizou-se os dados do SIAD, produzidos pelo LAPIG/UFG, com o período de referência 2008/2009 à 2014/2015. Esse dado possui abrangência territorial apenas para os biomas Amazônia e Cerrado.",
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
					"metadata": "Dado produzido a partir da geocodificação dos endereços dos frigoríficos e matadouros devidamente registrados.",
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
					"metadata": "Dados produzido pela ONG Transparent World com o apoio do WRI, com abrangência territorial para todo o Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "IDHM",
					"layer": "",
					"label": "IDH (2010)",
					"unit": "",
					"metadata": "Dado produzido pela PNUD Brasil, o Ipea e a Fundação João Pinheiro utilizando Censos Demográficos do IBGE.",
					"precision": 3,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "LEI_LITROS",
					"layer": "",
					"label": "Leite - Produção (2014)",
					"unit": "l",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa Pecuária Municipal, com abrangência territorial para todo Brasil.",
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
					"metadata": "Mapeamento produzido pela empresa Agrosatélite no âmbito do Projeto \"Geospatial analyses of the annual crops dynamic in the Brazilian Cerrado biome: 2000 to 2014\" financiado pela \"Gordon and Betty Moore Foundation\". Sua abrangência territorial compreende apenas o bioma Cerrado.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "MIL_APLAN",
					"layer": "",
					"label": "Milho - Área Plantada (2014)",
					"unit": "ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "MIL_TON",
					"layer": "",
					"label": "Milho - Produção (2014)",
					"unit": "ton",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "MIL_VL",
					"layer": "",
					"label": "Milho - Valor da Produção (2014)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},   
				{
					"name": "MIL_RENMED",
					"layer": "",
					"label": "Milho - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
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
					"metadata": "Dado produzido pela ANA e EMBRAPA, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUI_AREAHA",
					"layer": "tradeoff_quilombos",
					"type": "VECTOR",
					"label": "Quilombolas",
					"unit": "ha",
					"metadata": "Dado produzido pelo INCRA, com abrangência territorial para todo Brasil.",
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
					"metadata": "Compilação de mapeamentos de pastagem organizado pelo LAPIG/UFG, incluindo mapeamentos produzidos pelo próprio laboratório, bem como TerraClass Amazônia, TerraClass Cerrado, Mapeamento da Bacia do Alto Paraguai, entre outros. Sua abrangência territorial compreende todo o Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "CAP_CATTLE",
					"layer": "",
					"label": "Capacidade de Suporte",
					"unit": "UA/ha",
					"metadata": "Dado produzido (versão BETA) pelo LAPIG/UFG por meio do produto satelitário MOD17A2H, bem como dados obtidos em diversas campanhas de campo. Sua abrangência territorial compreende todo o Brasil.",
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
					"metadata": "Dado produzido pelo FUNAI, com abrangência territorial para todo Brasil.",
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
					"metadata": "Dados produzidos pela empresa AGROICONE no âmbito do projeto INPUT. Sua abrangência territorial compreende apenas os estados da Bahia, Maranhão, Mato Grosso, Mato Grosso do sul, Piauí, São Paulo e Tocantins.",
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
					"metadata": "Mapeamento produzido pela empresa Agrosatélite no âmbito do Projeto \"Geospatial analyses of the annual crops dynamic in the Brazilian Cerrado biome: 2000 to 2014\" financiado pela \"Gordon and Betty Moore Foundation\". Sua abrangência territorial compreende apenas o bioma Cerrado.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SOJ_APLAN",
					"layer": "",
					"label": "Soja - Área Plantada (2014)",
					"unit": "ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SOJ_TON",
					"layer": "",
					"label": "Soja - Produção (2014)",
					"unit": "ton",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "SOJ_VL",
					"layer": "",
					"label": "Soja - Valor da Produção (2014)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},   
				{
					"name": "SOJ_RENMED",
					"layer": "",
					"label": "Soja - Rendimento Médio (2014)",
					"unit": "ton/ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"sort": 'desc'
				}, 
				{
					"name": "TRB_ESCRAV",
					"layer": "",
					"label": "Trabalho Escravo - Trabalhadores envolvidos",
					"unit": "",
					"metadata": "Dado produzido pela Comissão Pastoral da Terra (CPT), com refrência em 2014 e abrangência territorial para todo Brasil.",
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
					"metadata": "Dado produzidos pelo IBGE, com refrência em 2014 e abrangência territorial para todo Brasil.",
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
					"metadata": "Dado produzidos pelo IBGE, com refrência em 2014 e abrangência territorial para todo Brasil.",
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
					"metadata": "Compilação de mapeamentos de vegetação nativa organizado pelo LAPIG/UFG.Para o bioma Amazônia considerou-se os dados do TerraClass Amazônia, com referência em 2012. Para o bioma Cerrado utilizou-se os dados TerraClass Cerrado, com referência em 2012. Os dados produzidos pela SOS Mata Atlântica, com referência em 2014, foram utilizados no bioma Mata Atlântica. O Mapeamento da cobertura vegetal da Bacia do Alto Paraguai, com referência em 2014, foi utilizado para o bioma Pantanal. Nos biomas Caatinga e Pampa considerou-se os dados produzidos no âmbito do PMDBBS, com referência em 2008",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}
			]
	};

	Internal.getSpatialDb = function(callback) {
		var spatialDb = new sqlite3.Database(config.spatialIntelligenceDb);
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

	Internal.getQuerySqlAllRegion = function(field, regionFilter, operation, applyOperationInSql) {	
		var sqlOperation = 'sum';
		if(applyOperationInSql)
			sqlOperation = operation;

		return 		"SELECT BIOMA, bbox, " + sqlOperation + "(" + field + ") as value "
						+ "FROM \"regions\" "
						+ "WHERE " + regionFilter + " AND " + field + " > 0"
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
				//console.log(sql)

				var rowEach = function(err, row) {
					row.leaf = true;
					row.iconCls = (field.layer) ? 'spatial-intelligence-geomap' : 'spatial-intelligence-nomap';
					section['value'] += row['value'];
					section['count'] += 1;
					row['value'] = Utils.numberFormat(row['value'], field.precision, '.', ',') + " " + field.unit;
					row['qtip'] = ( field.layer ) ? 'Clique duas vezes para visualizar essa informação no mapa.' : 'Informação disponível apenas em formato tabular. Clique duas vezes para localizar esse município no mapa.';
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

	Internal.queryAllRegion = function(regionType, region, language, callback) {
		var metadata = Internal.metadata;

		Internal.getSpatialDb(function(spatialDb) {
			var result = [];
			var regionFilter = Internal.getRegionFilter(regionType, region, false);

			var fieldEach = function(field, next) {
				if(field['excludeFromRegions']) {
					for(var key in field['excludeFromRegions']) {
						var r = field['excludeFromRegions'][key];
						
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
					cls: 'idQueryAllRegion',
					value: 0,
					count: 0,
					iconCls: (field.layer) ? 'spatial-intelligence-geosection' : 'spatial-intelligence-nogeosection',
					qtip: field.metadata,
					children: []
				};
				
				var sql = Internal.getQuerySqlAllRegion(field.name, regionFilter, field.operation, field.applyOperationInSql);
				//console.log(sql)

				var rowEach = function(err, row) {
					row.leaf = true;
					row.iconCls = (field.layer) ? 'spatial-intelligence-geomap' : 'spatial-intelligence-nomap';
					section['value'] += row['value'];
					section['count'] += 1;
					row['qtip'] = ( field.layer ) ? 'Clique duas vezes para visualizar essa informação no mapa.' : 'Informação disponível apenas em formato tabular. Clique duas vezes para localizar esse município no mapa.';
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

		var metadata = JSON.parse(JSON.stringify(Internal.metadata));  

		metadata.filter = Internal.getRegionFilter(regionType, region, '', true);
		metadata.filterRaster = Internal.getRegionFilterForRaster(regionType, region);
		metadata.titlePrefix = 'Municípios do(a) ';

		Internal.getSpatialDb(function(spatialDb) {
			var sqlRegionFilter = Internal.getRegionFilter(regionType, region, '', false);
			var sql = Internal.getCitieSql(sqlRegionFilter);

			spatialDb.all(sql, function(err, rows) {
				metadata.cities = rows;
				request.finalizeResultMetadata = metadata,
				next();
			})

		});
	}

	Spatial.query = function(request, response, next) {
		var regionType = request.param('regionType', 'state');
		var region = request.param('region', 'GO');
		var language = request.param('lang');
		var city = request.param('city', '');

		Internal.queryLayers(regionType, region, city, language, function(result) {
			request.finalizeResultQuery = result;
			next();
		});
	}

	Spatial.queryAllRegion = function(request, response, next) {
		var regionType = request.param('regionType', 'state');
		var region = request.param('region', 'GO');
		var language = request.param('lang');

		Internal.queryAllRegion(regionType, region, language, function(result) {
			request.finalizeResultQuery = result;
			next();
		});
	}

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
						result[i].info = translateTitleMetadata.title;
						result[i].qtip = translateTitleMetadata.description;
						if(result[i].layerLabel) {
							result[i].layerLabel = translateTitleMetadata.layerTitle
						}
					}
				}
			}
			
			response.send(result)
			response.end()
		}
	}

	Spatial.translateMetadata = function(request, response){
		if(response){
			var result = request.finalizeResultMetadata;
			var language = request.param('lang');

			if (language.toLowerCase() != 'pt-br'){

				for(i=0; i<result.fields.length; i++){
					name = result.fields[i].name;
					translateTitleMetadata = translateEN.fields[name];

					if (translateEN.fields[name] != undefined){
						result.fields[i].label = translateTitleMetadata.title;
						result.fields[i].metadata = translateTitleMetadata.description;
						if(result.fields[i].layerLabel) {
							result.fields[i].layerLabel = translateTitleMetadata.layerTitle
						}
					}
				}
			}
			
			response.send(result)
			response.end()
		}
	}

	return Spatial;
}
