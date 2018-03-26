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
					"name": "POL_HA",
					"layer": "",
					"table": "producao_algodao_quantidade_regions_view",
					"ano": 2015,
					"label": "Área Total",
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
					"name": "AREA_HA",
					"layer": "mapeamento_algodao",
					"table": "mapeamento_algodao_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "Algodão - Mapeamento (2014)",
					"unit": "ha",
					"metadata": "Mapeamento produzido pela empresa Agrosatélite no âmbito do Projeto \"Geospatial analyses of the annual crops dynamic in the Brazilian Cerrado biome: 2000 to 2014\" financiado pela \"Gordon and Betty Moore Foundation\". Sua abrangência territorial compreende apenas o bioma Cerrado.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "area_plantada_algodao",
					"table": "area_plantada_algodao_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Algodão - Área Plantada (2015)",
					"unit": "ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUANT_TON",
					"layer": "producao_algodao_quantidade",
					"table": "producao_algodao_quantidade_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Algodão - Produção (2015)",
					"unit": "ton",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "VALOR",
					"layer": "producao_algodao_valor",
					"table": "producao_algodao_valor_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Algodão - Valor da Produção (2015)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "RENDIMENTO",
					"layer": "rendimento_algodao",
					"table": "rendimento_algodao_regions_view",
					"ano": 2016,
					"label": "Algodão - Rendimento Médio (2016)",
					"unit": "ton/ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"applyOperationInSql": true,					
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "area_queimada",
					"table": "area_queimada_regions_view",
					"ano": 2016,
					"type": "VECTOR",
					"label": "Áreas de queimadas",
					"unit": "ha",
					"metadata": "Dados de queimadas ocorridos no Brasil, para o ano de 2016, produzidos a partir de imagens MODIS (MCD45A1).",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "areas_embargadas",
					"table": "areas_embargadas_regions_view",
					"ano": 2017,
					"type": "VECTOR",
					"label": "Áreas Embargadas",
					"unit": "ha",
					"metadata": "Áreas que sofrerão sanções administrativas e/ou medidas cautelar, tendo por objetivo propiciar a regeneração do meio ambiente e dar viabilidade à recuperação da área degradada, fonte IBAMA.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "QUANT_UN",
					"layer": "armazens",
					"table": "armazens_regions_view",
					"ano": 2017,
					"type": "VECTOR",
					"label": "Armazéns",
					"unit": "un",
					"metadata": "Número de armazéns destinados a armazenamento e controle de produção no Brasil. Gerado a partir da compilação de dados da Agrosatélite e da CONAB – Companhia Nacional de Abastecimento, espacializados pelo LAPIG – Laboratório de Processamento de Imagens e Geoporcessamento.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "areas_prioritarias_biodiversidade",
					"table": "areas_prioritarias_biodiversidade_regions_view",
					"ano": 2007,
					"type": "VECTOR",
					"label": "Áreas prior. p/ conserv. da biodiversidade",
					"unit": "ha",
					"metadata": "Revisão de áreas prioritárias para a conservação da biodiversidade, classificadas quanto a importância biológica. Produzido pelo Minitério do Meio Ambiente (MMA)",
					"precision": 0,
					"operation": "sum",
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
					"name": "AREA_HA",
					"layer": "area_reserva_legal",
					"table": "area_reserva_legal_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "Área de Reserva Legal",
					"unit": "ha",
					"metadata": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "assentamentos_rurais",
					"table": "assentamentos_rurais_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Assentamentos Rurais",
					"unit": "ha",
					"metadata": "Localização dos assentamentos rurais, produzido pelo Instituto Nacional de Colonização e Reforma Agrária (INCRA).",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "ATIVO",
					"layer": "ativo_ambiental",
					"table": "ativo_ambiental_regions_view",
					"ano": 2014,
					"type": "VECTOR",
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
					"name": "ABATIDOS",
					"layer": "bovinos_abatidos",
					"table": "bovinos_abatidos_regions_view",
					"ano": 2006,
					"type": "VECTOR",
					"label": "Bovinos - Abatidos (2006)",
					"unit": "cbçs",
					"metadata": "Dado produzido pelo IBGE por meio do Censo Agropecuário, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "rebanho_bovino",
					"table": "rebanho_bovino_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Bovinos - Rebanho (2015)",
					"unit": "cbçs",
					"metadata": "Quantidade de bovinos nos municípios brasileiros. Informação produzida pelo Instituto Brasileiro de Geografia e Estatística (IBGE) e espacializada pelo LAPIG.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "mapeamento_cana",
					"table": "mapeamento_cana_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "Cana - Mapeamento (2014)",
					"unit": "ha",
					"metadata": "Dado produzido pela empresa Agrosatélite no âmbito do Canasat - sistema de monitoramento remoto via satélite das áreas de produção de cana-de-açúcar na região Centro-Sul do Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "area_plantada_cana",
					"table": "area_plantada_cana_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Cana - Área Plantada (2015)",
					"unit": "ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUANT_TON",
					"layer": "producao_cana_quantidade",
					"table": "producao_cana_quantidade_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Cana - Produção (2015)",
					"unit": "ton",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "VALOR",
					"layer": "producao_cana_valor",
					"table": "producao_cana_valor_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Cana - Valor da Produção (2015)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},  
				{
					"name": "RENDIMENTO",
					"layer": "rendimento_cana",
					"table": "rendimento_cana_regions_view",
					"ano": 2016,
					"label": "Cana - Rendimento Médio (2016)",
					"unit": "ton/ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"applyOperationInSql": true,					
					"sort": 'desc'
				},
				{
					"name": "CAP_CATTLE",
					"layer": "capacidade_suporte",
					"table": "capacidade_suporte_regions_view",
					"ano": 2017,
					"type": "VECTOR",
					"label": "Capacidade de Suporte",
					"unit": "UA/ha",
					"metadata": "Dado produzido (versão BETA) pelo LAPIG/UFG por meio do produto satelitário MOD17A2H, bem como dados obtidos em diversas campanhas de campo. Sua abrangência territorial compreende todo o Brasil.",
					"precision": 2,
					"operation": "avg",
					"applyOperationInSql": true,
					"sort": 'desc'
				},
				{
					"name": "QUANT_UN",
					"layer": "centrais_hidreletricas",
					"table": "centrais_hidreletricas_regions_view",
					"ano": 2017,
					"type": "VECTOR",
					"label": "Centrais hidrelétricas",
					"unit": "un",
					"metadata": "Localização de pequenas centrais hidrelétricas, dado produzido pela Agência Nacional de Energia Elétrica (ANEEL).",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "COMUNIDADE",
					"layer": "comunidades_tradicionais",
					"table": "comunidades_tradicionais_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Comunidades Tradicionais",
					"unit": "",
					"metadata": "Dado produzido pela Fundação Cultural Palmares, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUANT_OCOR",
					"layer": "conflitos_terras_ocorrencias",
					"table": "conflitos_terras_ocorrencias_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Conflitos por terra (n° ocorrências)",
					"unit": "",
					"metadata": "Número de conflitos por município em ações de resistência e enfrentamento pela posse, uso e propriedade da terra e pelo acesso aos recursos naturais, no ano de 2015, produzidos pela CPT - Comissão Pastoral da Terra -  espacializados pelo Lapig.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUANT_PESS",
					"layer": "conflitos_terras_pessoas",
					"table": "conflitos_terras_pessoas_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Conflitos por terra (n° pessoas)",
					"unit": "",
					"metadata": "Número de pessoas envolvidas em conflitos ocorridos  por município, em ações de resistência e enfrentamento pela posse, uso e propriedade da terra e pelo acesso aos recursos naturais,  no ano de 2015, produzidos pela CPT - Comissão Pastoral da Terra -  espacializados pelo Lapig.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "QUANT_OCOR",
					"layer": "conflitos_agua_ocorrencias",
					"table": "conflitos_agua_ocorrencias_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Conflitos por água (n° ocorrências)",
					"unit": "",
					"metadata": "Número de ocorrências de ações de resistência por município, em geral coletivas, que visam garantir o uso e a preservação das águas, no ano de 2015, produzidos pela CPT - Comissão Pastoral da Terra -  espacializados pelo Lapig.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_KM",
					"layer": "corpos_agua",
					"table": "corpos_agua_regions_view",
					"ano": 2009,
					"type": "VECTOR",
					"label": "Corpos d'água",
					"unit": "km",
					"metadata": "Mapeamento dos corpos de água dos biomas: Caatinga (2008/2009), Mata Atlântica (2008/2009), Cerrado (2008/2009/2010), Pampa (2008/2009) e Pantanal (2008/2009) com base no Projeto de Monitoramento do Desmatamento dos Biomas Brasileiros por Satélite (PMDBBS).",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "DECLIV",
					"layer": "mu_br_hillshade_30_lapig",
					"type": "RASTER",
					"label": "Declividade Média",
					"layerLabel": "Relevo Sombreado",
					"unit": "%",
					"metadata": "Dado gerado pelo LAPIG/UFG utilizando imagens STRM com resolução espacial de 30m e abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"applyOperationInSql": true,
					"sort": 'asc'
				},
				/*{
					"name": "DEFICI_APP",
					"layer": "deficit_app",
					"table": "deficit_app_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "Déficit de APP",
					"unit": "ha",
					"metadata": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "DEFICIT_RL",
					"layer": "deficit_rl",
					"table": "deficit_rl_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "Déficit de Reserva Legal",
					"unit": "ha",
					"metadata": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},*/
				{
					"name": "DEFICIT_MM",
					"layer": "deficit_hidrico",
					"table": "deficit_hidrico_regions_view",
					"ano": 2012,
					"type": "VECTOR",
					"label": "Déficit hídrico",
					"unit": "mm",
					"metadata": "Dados acumulados do ano de 2012 do máximo de água doce disponível para infiltração e escoamento (Blue Water) para as ottobacias de nível 6 localizadas no Brasil, produzidos a partir de imagens do produto MOD16A2 e satélite TRMM.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "desmatamento",
					"table": "desmatamento_regions_view",
					"ano": 2016,
					"type": "VECTOR",
					"label": "Desmatamento (Ano mais recente)",
					"unit": "ha",
					"metadata": "Dados de desmatamentos ocorridos, produzidos a partir de compilação de dados do PRODES(Bioma Amazônia: 2005 - 2016), SIAD(Bioma Cerrado: 2003 - 2016) e SOS Mata Atlântica(Bioma Mata Atlântica: 2011 - 2016).",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "desmatamento_acumulado",
					"table": "desmatamento_acumulado_regions_view",
					"ano": 2016,
					"type": "VECTOR",
					"label": "Desmatamento Acumulado (2012-2016)",
					"unit": "ha",
					"metadata": "Desmatamento acumulado nos últimos 5 anos (2012 a 2016), nos Biomas Amazônia, Cerrado e Mata atlântica. Utilizando dados do PRODES/INPE para a Amazônia, SIAD/LAPIG para o Cerrado, SOS Mata Atlântica para a Mata Atlântica.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUANT_UN",
					"layer": "frigorificos",
					"table": "frigorificos_regions_view",
					"ano": 2017,
					"type": "VECTOR",
					"label": "Frigorificos e Matadouros",
					"unit": "",
					"metadata": "Dado produzido a partir de informações de Matadouros e/ou Frigoríficos Bovinos do Brasil aptos a exportação, inspecionados visualmente pelo LAPIG.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "floresta_plantada",
					"table": "floresta_plantada_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "Floresta plantada",
					"unit": "ha",
					"metadata": "Dados produzido pela ONG Transparent World com o apoio do WRI, com abrangência territorial para todo o Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "INDICE",
					"layer": "idh",
					"table": "idh_regions_view",
					"ano": 2010,
					"type": "VECTOR",
					"label": "Índice de Desenvolvimento Humano",
					"unit": "",
					"metadata": "Índice de Desenvolvimento Humano Municipal, calculado pela média geométrica dos índices das dimensões de Renda, Educação e Longevidade. Esse cálculo foi realizado a partir das informações do último Censo Demográfico do IBGE – 2010 e espacializado pelo LAPIG.",
					"precision": 3,
					"operation": "avg",
					"applyOperationInSql": true,					
					"sort": 'desc'
				}, 
				{
					"name": "QUANT_LIT",
					"layer": "producao_leite_quantidade",
					"table": "producao_leite_quantidade_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Leite - Produção (2015)",
					"unit": "lt",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa Pecuária Municipal, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "VALOR",
					"layer": "producao_leite_valor",
					"table": "producao_leite_valor_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Leite - Valor da Produção (2015)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa Pecuária Municipal, com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "QUANT_M3",
					"layer": "producao_lenha_quantidade",
					"table": "producao_lenha_quantidade_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Lenha - Produção (2015)",
					"unit": "m³",
					"metadata": "Quantidade de Lenha produzida por municípios do brasil, em Metros Cúbicos, no ano de 2015, conforme dados censitários do IBGE.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "VALOR",
					"layer": "producao_lenha_valor",
					"table": "producao_lenha_valor_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Lenha - Valor da Produção (2015)",
					"unit": "R$",
					"metadata": "Valor da produção de Lenha por municípios do Brasil em Reais, no ano de 2015, conforme dados censitários do IBGE.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "mapeamento_milho",
					"table": "mapeamento_milho_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "Milho - Mapeamento (2014)",
					"unit": "ha",
					"metadata": "Mapeamento produzido pela empresa Agrosatélite no âmbito do Projeto \"Geospatial analyses of the annual crops dynamic in the Brazilian Cerrado biome: 2000 to 2014\" financiado pela \"Gordon and Betty Moore Foundation\". Sua abrangência territorial compreende apenas o bioma Cerrado.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "area_plantada_milho",
					"table": "area_plantada_milho_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Milho - Área Plantada (2015)",
					"unit": "ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUANT_TON",
					"layer": "producao_milho_quantidade",
					"table": "producao_milho_quantidade_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Milho - Produção (2015)",
					"unit": "ton",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "VALOR",
					"layer": "producao_milho_valor",
					"table": "producao_milho_valor_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Milho - Valor da Produção (2015)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},   
				{
					"name": "RENDIMENTO",
					"layer": "rendimento_milho",
					"table": "rendimento_milho_regions_view",
					"ano": 2016,
					"type": "VECTOR",
					"label": "Milho - Rendimento Médio (2016)",
					"unit": "ton/ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"applyOperationInSql": true,					
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "pastagem",
					"table": "pastagem_regions_view",
					"ano": 2016,
					"type": "VECTOR",
					"label": "Pastagem",
					"unit": "ha",
					"metadata": "Mapeamento de áreas de pastagem, a partir de compilação de dados TerraClass Amazon; Funcate;  PROBIO; Canasat e TNC. A área de pastagem mapeada é de 175.396.874 ha, os mapeamentos que compõem são: Bioma Pantanal - Mapeamento da Bacia do Alto Paraguai para 2014; Bioma Caatinga ( Mapeamento Lapig - Versão 2 2014-2016) - Esse mapeamento classificou as áreas de pasto limpo, pasto sujo e área degradada (solo exposto); Bioma Mata Atlântica (Mapeamento Lapig 2014-2016) - Esse mapeamento classificou as áreas de pasto limpo, pasto sujo e área degradada (solo exposto); Bioma Pampa - Mapeamento realizado pelo IBGE para o  estado do Rio Grande do Sul (2012); Bioma Amazônia - Mapeamento TerraClass Amazônia 2014; Bioma Cerrado - Mapeamento TerraClass Cerrado 2013.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "pivos_centrais",
					"table": "pivos_centrais_regions_view",
					"ano": 2013,
					"type": "VECTOR",
					"label": "Pivôs Centrais",
					"unit": "ha",
					"metadata": "Mapeamento realizado pela Embrapa da área irrigada e do número de equipamentos de irrigação por pivô central no Brasil em 2013.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "quilombos",
					"table": "quilombos_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Quilombolas",
					"unit": "ha",
					"metadata": "Áreas de Quilombos que possuem titulação de territórios quilombolas, produzido pelo Instituto Nacional de Colonização e Reforma Agrária (INCRA).",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "CAPACIDADE",
					"layer": "armazens_capacidade",
					"table": "armazens_capacidade_regions_view",
					"ano": 2017,
					"type": "VECTOR",
					"label": "Armazéns - Capacidade Max.",
					"unit": "ton",
					"metadata": "Capacidade máxima de armazéns destinados a armazenamento e controle de produção no Brasil. Gerado a partir da compilação de dados da Agrosatélite e da CONAB – Companhia Nacional de Abastecimento, espacializados pelo LAPIG – Laboratório de Processamento de Imagens e Geoporcessamento.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "mapeamento_soja",
					"table": "mapeamento_soja_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "Soja - Mapeamento (2014)",
					"unit": "ha",
					"metadata": "Mapeamento produzido pela empresa Agrosatélite no âmbito do Projeto \"Geospatial analyses of the annual crops dynamic in the Brazilian Cerrado biome: 2000 to 2014\" financiado pela \"Gordon and Betty Moore Foundation\". Sua abrangência territorial compreende apenas o bioma Cerrado.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "AREA_HA",
					"layer": "area_soja",
					"table": "area_soja_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Soja - Área Plantada (2015)",
					"unit": "ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QUANT_TON",
					"layer": "producao_soja_quantidade",
					"table": "producao_soja_quantidade_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Soja - Produção (2015)",
					"unit": "ton",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "VALOR",
					"layer": "producao_soja_valor",
					"table": "producao_soja_valor_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Soja - Valor da Produção (2015)",
					"unit": "R$",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},   
				{
					"name": "RENDIMENTO",
					"layer": "rendimento_soja",
					"table": "rendimento_soja_regions_view",
					"ano": 2016,
					"type": "VECTOR",
					"label": "Soja - Rendimento Médio (2016)",
					"unit": "ton/ha",
					"metadata": "Dado produzido pelo IBGE por meio da Pesquisa de Produção Agrícola Municipal (PAM), com abrangência territorial para todo Brasil.",
					"precision": 2,
					"operation": "avg",
					"applyOperationInSql": true,					
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "areas_terras_indigenas",
					"table": "areas_terras_indigenas_regions_view",
					"ano": 2012,
					"type": "VECTOR",
					"label": "Terras Indígenas - Áreas",
					"unit": "ha",
					"metadata": "Áreas de terras indígenas brasileiras incluindo situação (regularizada, delimitada, etc), produzidos pela Fundação Nacional do Índio (FUNAI).",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "TOTAL",
					"layer": "terras_indigenas",
					"table": "terras_indigenas_regions_view",
					"ano": 2015,
					"type": "VECTOR",
					"label": "Terras indígenas - Quantidade",
					"unit": "un",
					"metadata": "Quantidade de terras indígenas por município do Brasil até o ano de 2015, segundo dados produzidos pela Fundação Nacional do Índio(FUNAI) e espacializados pelo LAPIG.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				}, 
				{
					"name": "QTD_PESSOAS",
					"layer": "trabalho_escravo",
					"table": "trabalho_escravo_regions_view",
					"ano": 2016,
					"type": "VECTOR",
					"label": "Trabalho Escravo - Trabalhadores envolvidos",
					"unit": "",
					"metadata": "Número de pessoas envolvidas por município, em ações de trabalhos forçados, jornada exaustiva ou por sujeitá-lo á condições degradantes de trabalho, no ano de 2016, produzidos pela Comissão Pastoral da Terra (CPT) e espacializados pelo LAPIG.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "unidades_conservacao_sustentavel",
					"table": "unidades_conservacao_sustentavel_regions_view",
					"ano": 2016,
					"type": "VECTOR",
					"label": "U.C. - Uso Sustentável",
					"unit": "ha",
					"metadata": "Dado produzidos pelo IBGE, com refrência em 2016 e abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "unidades_conservacao_integral",
					"table": "unidades_conservacao_integral_regions_view",
					"ano": 2014,
					"type": "VECTOR",
					"label": "U.C. - Proteção Integral",
					"unit": "ha",
					"metadata": "Dado produzidos pelo IBGE, com refrência em 2014 e abrangência territorial para todo Brasil.",
					"precision": 0,
					"operation": "sum",
					"sort": 'desc'
				},
				{
					"name": "AREA_HA",
					"layer": "vegetacao",
					"table": "vegetacao_regions_view",
					"ano": 2014,
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
		var spatialDb = new sqlite3.Database(config.indicadoresDb);
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
			if(region == 'BRASIL') {
				return " " + cityFilter + filterPreffix + 'BIOMA' + filterSuffix + " != '0'";
			} else {
				return " " + cityFilter + filterPreffix + 'BIOMA' + filterSuffix + " = '" + region + "'";
			}
		} else if (regionType == 'ROI' && region == 'ARC_DEFORESTATION') {
			return " " + cityFilter + filterPreffix + 'ARCODESMAT' + filterSuffix + " = '1' ";
		} else {
			return " " + cityFilter + filterPreffix + 'MATOPIBA' + filterSuffix + " = '1'";
		}
	}

	Internal.getCitieSql = function(regionFilter) {

		return 		"SELECT DISTINCT COD_MUNICI, (MUNICIPIO || ' - ' || UF)  info, bbox "
						+ " FROM \"regions\" "
						+ " WHERE " + regionFilter
						+ " ORDER BY info ASC"
	}

	Internal.getQuerySql = function(table, ano, field, regionFilter, operation, sort, applyOperationInSql) {
		var sqlOperation = 'sum';
		if(applyOperationInSql)
			sqlOperation = operation;	

		return 		"SELECT COD_MUNICI, (MUNICIPIO || ' - ' || UF)  info, bbox, " + sqlOperation + "(" + field + ") as value"
						+ " FROM "+table+" "
						+ " WHERE " + regionFilter + " AND " + field + " > 0  AND ANO = " +ano
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
					cls: (city == '') ? '' : 'idQueryLayers',
					value: 0,
					count: 0,
					iconCls: (field.layer) ? 'spatial-intelligence-geosection' : 'spatial-intelligence-nogeosection',
					qtip: field.metadata,
					children: []
				};
				
				var sql = Internal.getQuerySql(field.table, field.ano, field.name, regionFilter, field.operation, field.sort, field.applyOperationInSql);
				console.log(sql)
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
			var regionFilter = Internal.getRegionFilter(regionType, region, '', false);

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

				var sql = Internal.getQuerySql(field.table, field.ano, field.name, regionFilter, field.operation, field.sort, field.applyOperationInSql);
				console.log('fer', sql)
				var rowEach = function(err, row) {
					row.leaf = true;
					row.iconCls = (field.layer) ? 'spatial-intelligence-geomap' : 'spatial-intelligence-nomap';
					section['value'] += row['value'];
					section['count'] += 1;
					//row['value'] = Utils.numberFormat(row['value'], field.precision, '.', ',') + " " + field.unit;
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
		var filename = ((city) ? 'cidade' : region).toLowerCase();

		Internal.getSpatialDb(function(spatialDb) {
			var result = {};
			var regionFilter = Internal.getRegionFilter(regionType, region, city, false);
			var sqlRegionFilter = Internal.getRegionFilter(regionType, region, '', false);
			var sql = Internal.getCitieSql(sqlRegionFilter);
			var arrayCodMunici;

			spatialDb.all(sql, function(err, rows) {
				arrayCodMunici = rows;
			})

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

				var sql = Internal.getQuerySql(field.table, field.ano, field.name, regionFilter, field.operation, field.sort, field.applyOperationInSql);

				var rowEach = function(err, row) {
					var columnName = field.name;

					if(result[row['info']] == undefined) {
						result[row['info']] = {};
					}

					var strMunic = row['info'].split(' - ')
					var uf = strMunic[1];
					strMunic = strMunic[0];

					for (var key in arrayCodMunici) {
						if(arrayCodMunici[key].info == row['info']) {
							result[row['info']]['COD_MUNICI'] = arrayCodMunici[key].COD_MUNICI;
						}
					}

					result[row['info']]['UF'] = uf;					
					result[row['info']]['MUNIC'] = strMunic;					

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

	Internal.queryLayersForCsvAllRegion = function(regionType, region, callback) {
		var metadata = Internal.metadata;
		var filename = region.toLowerCase();

		Internal.getSpatialDb(function(spatialDb) {
			var result = {};
			var regionFilter = Internal.getRegionFilter(regionType, region, '', false);
			
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

				var sql = Internal.getQuerySql(field.table, field.ano, field.name, regionFilter, field.operation, field.sort, field.applyOperationInSql);

				var rowEach = function(err, row) {
					var columnName = field.name;

					if(result[row['info']] == undefined) {
						result[row['info']] = {};
					}

					result[row['info']][metadata.label] = region;
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
			console.log('metadata sql::::::', sql)
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

	Spatial.csv = function(request, response, next) {
		var regionType = request.param('regionType', 'state');
		var region = request.param('region', 'GO');
		var city = request.param('city', '');
		var language = request.param('lang');

		Internal.queryLayersForCsv(regionType, region, city, function(filename, result) {
			request.finalizeResultQuery = {
				result: result,
				filename: filename
			};
			
			next();
		});
	}

	Spatial.csvAllRegion = function(request, response, next) {
		var regionType = request.param('regionType', 'state');
		var region = request.param('region', 'GO');
		var language = request.param('lang');

		Internal.queryLayersForCsvAllRegion(regionType, region, function(filename, result) {
			request.finalizeResultQuery = {
				result: result,
				filename: filename
			};
			
			next();
		});
	}

	Spatial.translateQueryCsv = function(request, response) {
		var language = request.param('lang');
		var result = request.finalizeResultQuery.result;
		var filename = request.finalizeResultQuery.filename;

		var getLabelForKey = function(key) {
			if(language.toLowerCase() == 'pt-br') {
				for (var i in Internal.metadata.fields) {
					if(Internal.metadata.fields[i].name == key) {
						return Internal.metadata.fields[i].label + " - " + Internal.metadata.fields[i].unit;
					}
				}
			} else {
				if (translateEN.fields[key] != undefined) {
					return translateEN.fields[key].title;
				}
			}
		}

		var writer = csvWriter({
			separator: ';',
			newline: '\n',
			headers: undefined,
			sendHeaders: true
		});

		var encoder = new iconv.Iconv('utf-8', 'latin1');
		var nameTitleCsv;

		for(info in result) {
			var row = {}
	
			for(var key in result[info]) {
				var label = getLabelForKey(key);

				if(key == 'COD_MUNICI') {
					row['Cod_Munic'] = result[info][key];
				} else if(key == 'UF') {					
					row['UF'] = result[info][key];			
				} else if (key == 'MUNIC') {
					if(filename == 'cidade') {
						nameTitleCsv = result[info][key];
					} else {
						nameTitleCsv = filename;
					}

					if(language == 'pt-br') {
						row['Município'] = result[info][key];
					} else {
						row['Municipalities'] = result[info][key];
					}
				} else {
					row[label] = result[info][key];
				}
			}

			writer.write(row)
		}

		response.set('Content-Type', 'text/csv');
		response.set('Content-Disposition', 'attachment;filename=' + nameTitleCsv + '.csv');
		
		writer.pipe(encoder, { end: false });
		encoder.pipe(response, { end: false });

		writer.on('end', function() {
			encoder.end();
			response.end();
		})

		writer.end();
	}

	Spatial.translateQueryCsvAllRegion = function(request, response) {
		var language = request.param('lang');
		var result = request.finalizeResultQuery.result;
		var filename = request.finalizeResultQuery.filename;

		var getLabelForKey = function(key) {
			if(language.toLowerCase() == 'pt-br') {
				for (var i in Internal.metadata.fields) {
					if(Internal.metadata.fields[i].name == key) {
						return Internal.metadata.fields[i].label + " - " + Internal.metadata.fields[i].unit;
					}
				}
			} else {
				if (translateEN.fields[key] != undefined) {
					return translateEN.fields[key].title;
				}
			}
		}

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
			var row = {}
			
			for(var key in result[info]) {
				var label = getLabelForKey(key);
				if(label == undefined) {
					if(language == 'pt-br') {
						label = 'Região';
					} else {
						label = 'Region';
					}
				}
				row[label] = result[info][key];
			}

			writer.write(row)
		}

		writer.on('end', function() {
			encoder.end();
			response.end();
		})

		writer.end();
	}

	Spatial.translateQuery = function(request, response) {
		if(response) {
			var result = request.finalizeResultQuery;
			var language = request.param('lang');

			if(language.toLowerCase() != 'pt-br') {
				for(i=0; i<result.length; i++) {
					name = result[i].name;
					translateTitleMetadata = translateEN.fields[name];

					if(translateEN.fields[name] != undefined) {
						result[i].info = translateTitleMetadata.title;
						result[i].qtip = translateTitleMetadata.description;
						if(result[i].layerLabel) {
							result[i].layerLabel = translateTitleMetadata.layerTitle
						}
					}
				}
			}
		}

		response.send(result)
		response.end()	
	}

	Spatial.translateMetadata = function(request, response) {
		if(response) {
			var result = request.finalizeResultMetadata;
			var language = request.param('lang');

			if (language.toLowerCase() != 'pt-br') {
				for(i=0; i<result.fields.length; i++) {
					name = result.fields[i].name;
					translateTitleMetadata = translateEN.fields[name];

					if (translateEN.fields[name] != undefined) {
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