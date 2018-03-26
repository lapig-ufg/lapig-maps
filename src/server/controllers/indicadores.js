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
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB":{
									"Columm": "AREA_HA",
									"Table": "area_soja_regions_view",
									"Group": " GROUP BY ANO",
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
							"descricao": "Dados de desmatamentos ocorridos, produzidos a partir de compilação de dados do PRODES(Bioma Amazônia: 2005 - 2016), SIAD(Bioma Cerrado: 2003 - 2016) e SOS Mata Atlântica(Bioma Mata Atlântica: 2011 - 2016).",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"desmatamento_regions_view",
									"Group": " GROUP BY ANO",
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
							"descricao": "Número de pessoas envolvidas por município, em ações de trabalhos forçados, jornada exaustiva ou por sujeitá-lo á condições degradantes de trabalho, no período de 2000/2002 e de 2008 a 2016, produzidos pela Comissão Pastoral da Terra (CPT) e espacializados pelo LAPIG.",
							"unidade": "pessoas",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QTD_PESSOAS",
									"Table":"trabalho_escravo_regions_view",
									"Group": " GROUP BY ANO",
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
							"categ": ["Ambiental"],
							"nome": "Unidades de Conservação de Proteção Integral",
							"descricao": "Localização das unidades de conservação de proteção integral brasileiras, incluindo a Base ao Milionésimo do IBGE de 2014.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB":{
									"Columm": "AREA_HA",
									"Table": "unidades_conservacao_integral_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];
									}
							}
						},
						{
							"id": "area_queimada",
							"categ": ["Agricultura", "Pecuária"],
							"nome": "Áreas de queimadas",
							"descricao": "Dados de queimadas ocorridos no Brasil, para o período de 2002 à 2015, produzidos a partir de imagens MODIS (MCD45A1).",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"area_queimada_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoQueimada = []
										var valorQueimada = []

										rows.forEach(function(queimada){
												anoQueimada.push(queimada.ANO)
												valorQueimada.push(queimada.AREA_HA)
										})
										metadata['ano'] = anoQueimada
										metadata['valor'] = valorQueimada
									}
							}
						},
						{
							"id": "areas_terras_indigenas",
							"categ": ["Social"],
							"nome": "Áreas de terras indígenas",
							"descricao": "Áreas de terras indígenas brasileiras incluindo situação (regularizada, delimitada, etc), produzidos pela Fundação Nacional do Índio (FUNAI).",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"areas_terras_indigenas_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];
									}
							}
						},
						{
							"id": "terras_indigenas",
							"categ": ["Social"],
							"nome": "Terras indígenas",
							"descricao": "Quantidade de terras indígenas por município do Brasil até o ano de 2015, segundo dados produzidos pela Fundação Nacional do Índio(FUNAI) e espacializados pelo LAPIG.",
							"unidade": "unidades",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "TOTAL",
									"Table":"terras_indigenas_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].TOTAL];
										metadata['ano'] = [rows[0].ANO];
									}
							}
						},
						{
							"id": "vegetacao",
							"categ": ["Ambiental"],
							"nome": "Cobertura vegetal remanescente",
							"descricao": "Compilação de mapeamentos de vegetação nativa organizado pelo LAPIG/UFG.Para o bioma Amazônia considerou-se os dados do TerraClass Amazônia, com referência em 2012. Para o bioma Cerrado utilizou-se os dados TerraClass Cerrado, com referência em 2012. Os dados produzidos pela SOS Mata Atlântica, com referência em 2014, foram utilizados no bioma Mata Atlântica. O Mapeamento da cobertura vegetal da Bacia do Alto Paraguai, com referência em 2014, foi utilizado para o bioma Pantanal. Nos biomas Caatinga e Pampa considerou-se os dados produzidos no âmbito do PMDBBS, com referência em 2008",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"vegetacao_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];
									}
							}
						},
						{
							"id": "areas_prioritarias_biodiversidade",
							"categ": ["Ambiental"],
							"nome": "Áreas prioritárias para conservação da biodiversidade",
							"descricao": "Revisão de áreas prioritárias para a conservação da biodiversidade, classificadas quanto a importância biológica. Produzido pelo Minitério do Meio Ambiente (MMA)",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"areas_prioritarias_biodiversidade_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "centrais_hidreletricas",
							"categ": ["Econômico"],
							"nome": "Centrais hidrelétricas",
							"descricao": "Localização de pequenas centrais hidrelétricas, dado produzido pela Agência Nacional de Energia Elétrica (ANEEL).",
							"unidade": "unidades",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_UN",
									"Table":"centrais_hidreletricas_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].QUANT_UN];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "deficit_app",
							"categ": ["Ambiental"],
							"nome": "Déficit de APP",
							"descricao": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "DEFICI_APP",
									"Table":"deficit_app_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].DEFICI_APP];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "deficit_rl",
							"categ": ["Ambiental"],
							"nome": "Déficit de Reserva Legal",
							"descricao": "Dado produzido pelo CSR/UFMG e LAGESA/UFMG com o apoio da Climate and Land Use Alliance, com abrangência territorial para todo Brasil.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "DEFICIT_RL",
									"Table":"deficit_rl_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].DEFICIT_RL];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "deficit_hidrico",
							"categ": ["Ambiental"],
							"nome": "Déficit hídrico",
							"descricao": "Dados acumulados do ano de 2012 do máximo de água doce disponível para infiltração e escoamento (Blue Water) para as ottobacias de nível 6 localizadas no Brasil, produzidos a partir de imagens do produto MOD16A2 e satélite TRMM.",
							"unidade": "mm",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "DEFICIT_MM",
									"Table":"deficit_hidrico_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].DEFICIT_MM];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "corpos_agua",
							"categ": ["Ambiental"],
							"nome": "Corpos d'água",
							"descricao": "Mapeamento dos corpos de água dos biomas: Caatinga (2008/2009), Mata Atlântica (2008/2009), Cerrado (2008/2009/2010), Pampa (2008/2009) e Pantanal (2008/2009) com base no Projeto de Monitoramento do Desmatamento dos Biomas Brasileiros por Satélite (PMDBBS).",
							"unidade": "km",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_KM",
									"Table":"corpos_agua_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_KM];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "quilombos",
							"categ": ["Social"],
							"nome": "Quilombos",
							"descricao": "Áreas de Quilombos que possuem titulação de territórios quilombolas, produzido pelo Instituto Nacional de Colonização e Reforma Agrária (INCRA).",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"quilombos_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "pivos_centrais",
							"categ": ["Agricultura"],
							"nome": "Pivôs centrais",
							"descricao": "Mapeamento realizado pela Embrapa da área irrigada e do número de equipamentos de irrigação por pivô central no Brasil em 2013.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"pivos_centrais_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "pastagem",
							"categ": ["Pecuária"],
							"nome": "Áreas de pastagens",
							"descricao": "Mapeamento de áreas de pastagem, a partir de compilação de dados TerraClass Amazon; Funcate;  PROBIO; Canasat e TNC. A área de pastagem mapeada é de 175.396.874 ha, os mapeamentos que compõem são: Bioma Pantanal - Mapeamento da Bacia do Alto Paraguai para 2014; Bioma Caatinga ( Mapeamento Lapig - Versão 2 2014-2016) - Esse mapeamento classificou as áreas de pasto limpo, pasto sujo e área degradada (solo exposto); Bioma Mata Atlântica (Mapeamento Lapig 2014-2016) - Esse mapeamento classificou as áreas de pasto limpo, pasto sujo e área degradada (solo exposto); Bioma Pampa - Mapeamento realizado pelo IBGE para o  estado do Rio Grande do Sul (2012); Bioma Amazônia - Mapeamento TerraClass Amazônia 2014; Bioma Cerrado - Mapeamento TerraClass Cerrado 2013.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"pastagem_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "frigorificos",
							"categ": ["Pecuária"],
							"nome": "Frigoríficos e matadouros",
							"descricao": "Dado produzido a partir de informações de Matadouros e/ou Frigoríficos Bovinos do Brasil aptos a exportação, inspecionados visualmente pelo LAPIG.",
							"unidade": "unidades",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_UN",
									"Table":"frigorificos_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].QUANT_UN];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "floresta_plantada",
							"categ": ["Agricultura"],
							"nome": "Floresta plantada",
							"descricao": "Dados produzido pela ONG Transparent World com o apoio do WRI, com abrangência territorial para todo o Brasil.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"floresta_plantada_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "armazens",
							"categ": ["Agricultura"],
							"nome": "Armazéns",
							"descricao": "Número de armazéns destinados a armazenamento e controle de produção no Brasil. Gerado a partir da compilação de dados da Agrosatélite e da CONAB – Companhia Nacional de Abastecimento, espacializados pelo LAPIG – Laboratório de Processamento de Imagens e Geoporcessamento.",
							"unidade": "unidades",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_UN",
									"Table":"armazens_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].QUANT_UN];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "assentamentos_rurais",
							"categ": ["Agricultura"],
							"nome": "Assentamentos Rurais",
							"descricao": "Localização dos assentamentos rurais, produzido pelo Instituto Nacional de Colonização e Reforma Agrária (INCRA).",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"assentamentos_rurais_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];;
									}
							}
						},
						{
							"id": "rebanho_bovino",
							"categ": ["Pecuária"],
							"nome": "Rebanho bovino",
							"descricao": "Quantidade de bovinos nos municípios brasileiros. Informação produzida pelo Instituto Brasileiro de Geografia e Estatística (IBGE) e espacializada pelo LAPIG.",
							"unidade": "cabeças",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"rebanho_bovino_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoRebanho = []
										var valorRebanho = []

										rows.forEach(function(rebanho){
												anoRebanho.push(rebanho.ANO)
												valorRebanho.push(rebanho.AREA_HA)
										})
										metadata['ano'] = anoRebanho
										metadata['valor'] = valorRebanho
									}
							}
						},
						{
							"id": "idh",
							"categ": ["Social"],
							"nome": "Índice de Desenvolvimento Humano",
							"descricao": "Índice de Desenvolvimento Humano Municipal, calculado pela média geométrica dos índices das dimensões de Renda, Educação e Longevidade. Esse cálculo foi realizado a partir das informações dos 3 últimos Censos Demográficos do IBGE – 1991, 2000 e 2010 e espacializado pelo LAPIG.",
							"unidade": "índice",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "INDICE",
									"Table":"idh_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoIDH = []
										var valorIDH = []

										rows.forEach(function(idh){
												anoIDH.push(idh.ANO)
												valorIDH.push(idh.INDICE)
										})
										metadata['ano'] = anoIDH
										metadata['valor'] = valorIDH
									}
							}
						},
						{
							"id": "conflitos_terras_ocorrencias",
							"categ": ["Social"],
							"nome": "Conflitos por terra (n° ocorrências)",
							"descricao": "Número de conflitos por município em ações de resistência e enfrentamento pela posse, uso e propriedade da terra e pelo acesso aos recursos naturais, no período de 2010 á 2015, produzidos pela CPT - Comissão Pastoral da Terra -  espacializados pelo Lapig.",
							"unidade": "ocorrências",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_OCOR",
									"Table":"conflitos_terras_ocorrencias_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoCONFLITERROCOR = []
										var valorCONFLITERROCOR = []

										rows.forEach(function(conflitoso){
												anoCONFLITERROCOR.push(conflitoso.ANO)
												valorCONFLITERROCOR.push(conflitoso.QUANT_OCOR)
										})
										metadata['ano'] = anoCONFLITERROCOR
										metadata['valor'] = valorCONFLITERROCOR
									}
							}
						},
						{
							"id": "conflitos_terras_pessoas",
							"categ": ["Social"],
							"nome": "Conflitos por terra (n° pessoas)",
							"descricao": "Número de pessoas envolvidas em conflitos ocorridos  por município, em ações de resistência e enfrentamento pela posse, uso e propriedade da terra e pelo acesso aos recursos naturais,  no período de 2010 á 2015, produzidos pela CPT - Comissão Pastoral da Terra -  espacializados pelo Lapig.",
							"unidade": "pessoas",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_PESS",
									"Table":"conflitos_terras_pessoas_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoCONFLITERRPESS = []
										var valorCONFLITERRPESS = []

										rows.forEach(function(conflitosp){
												anoCONFLITERRPESS.push(conflitosp.ANO)
												valorCONFLITERRPESS.push(conflitosp.QUANT_PESS)
										})
										metadata['ano'] = anoCONFLITERRPESS
										metadata['valor'] = valorCONFLITERRPESS
									}
							}
						},
						{
							"id": "conflitos_agua_ocorrencias",
							"categ": ["Social"],
							"nome": "Conflitos por água (n° ocorrências)",
							"descricao": "Número de ocorrências de ações de resistência por município, em geral coletivas, que visam garantir o uso e a preservação das águas, no período de 2006 á 2015, produzidos pela CPT - Comissão Pastoral da Terra -  espacializados pelo Lapig.",
							"unidade": "ocorrências",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_OCOR",
									"Table":"conflitos_agua_ocorrencias_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoCONFLIAGUAOCOR = []
										var valorCONFLIAGUAOCOR = []

										rows.forEach(function(conflitoso){
												anoCONFLIAGUAOCOR.push(conflitoso.ANO)
												valorCONFLIAGUAOCOR.push(conflitoso.QUANT_OCOR)
										})
										metadata['ano'] = anoCONFLIAGUAOCOR
										metadata['valor'] = valorCONFLIAGUAOCOR
									}
							}
						},
						{
							"id": "area_plantada_cana",
							"categ": ["Agricultura"],
							"nome": "Área plantada de cana-de-açúcar",
							"descricao": "Áreas de plantação de cana-de-açúcar por municípios do Brasil, por hectares, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"area_plantada_cana_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoAREACANA = []
										var valorAREACANA = []

										rows.forEach(function(area){
												anoAREACANA.push(area.ANO)
												valorAREACANA.push(area.AREA_HA)
										})
										metadata['ano'] = anoAREACANA
										metadata['valor'] = valorAREACANA
									}
							}
						},
						{
							"id": "producao_cana_quantidade",
							"categ": ["Agricultura"],
							"nome": "Produção de cana-de-açúcar - ton",
							"descricao": "Quantidade de cana-de-açúcar produzida por municípios do brasil, em Toneladas, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "ton",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_TON",
									"Table":"producao_cana_quantidade_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoQUANTCANA = []
										var valorQUANTCANA = []

										rows.forEach(function(quant){
												anoQUANTCANA.push(quant.ANO)
												valorQUANTCANA.push(quant.QUANT_TON)
										})
										metadata['ano'] = anoQUANTCANA
										metadata['valor'] = valorQUANTCANA
									}
							}
						},
						/*{
							"id": "producao_cana_valor",
							"categ": ["Agricultura"],
							"nome": "Produção de cana-de-açúcar - R$",
							"descricao": "Valor da produção de Cana em Reais, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "R$",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "VALOR",
									"Table":"producao_cana_valor_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoVALORCANA = []
										var valorVALORCANA = []

										rows.forEach(function(valor){
												anoVALORCANA.push(valor.ANO)
												valorVALORCANA.push(valor.VALOR)
										})
										metadata['ano'] = anoVALORCANA
										metadata['valor'] = valorVALORCANA
									}
							}
						},*/
						{
							"id": "producao_soja_quantidade",
							"categ": ["Agricultura"],
							"nome": "Produção de Soja - ton",
							"descricao": "Quantidade de soja em grão produzida por municípios do brasil, em Toneladas, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "ton",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_TON",
									"Table":"producao_soja_quantidade_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoQUANTSOJA = []
										var valorQUANTSOJA = []

										rows.forEach(function(quant){
												anoQUANTSOJA.push(quant.ANO)
												valorQUANTSOJA.push(quant.QUANT_TON)
										})
										metadata['ano'] = anoQUANTSOJA
										metadata['valor'] = valorQUANTSOJA
									}
							}
						},
						/*{
							"id": "producao_soja_valor",
							"categ": ["Agricultura"],
							"nome": "Produção de Soja - R$",
							"descricao": "Valor da produção de soja em Reais, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "R$",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "VALOR",
									"Table":"producao_soja_valor_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoVALORSOJA = []
										var valorVALORSOJA = []

										rows.forEach(function(valor){
												anoVALORSOJA.push(valor.ANO)
												valorVALORSOJA.push(valor.VALOR)
										})
										metadata['ano'] = anoVALORSOJA
										metadata['valor'] = valorVALORSOJA
									}
							}
						},*/
						{
							"id": "area_plantada_milho",
							"categ": ["Agricultura"],
							"nome": "Área Plantada de Milho",
							"descricao": "Áreas de plantação de Milho em grão por municípios do Brasil, por hectares, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"area_plantada_milho_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoAREAMILHO = []
										var valorAREAMILHO = []

										rows.forEach(function(area){
												anoAREAMILHO.push(area.ANO)
												valorAREAMILHO.push(area.AREA_HA)
										})
										metadata['ano'] = anoAREAMILHO
										metadata['valor'] = valorAREAMILHO
									}
							}
						},
						{
							"id": "producao_milho_quantidade",
							"categ": ["Agricultura"],
							"nome": "Produção de Milho - ton",
							"descricao": "Quantidade de milho em grão produzido por municípios do brasil, em Toneladas, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "ton",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_TON",
									"Table":"producao_milho_quantidade_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoQUANTMILHO = []
										var valorQUANTMILHO = []

										rows.forEach(function(quant){
												anoQUANTMILHO.push(quant.ANO)
												valorQUANTMILHO.push(quant.QUANT_TON)
										})
										metadata['ano'] = anoQUANTMILHO
										metadata['valor'] = valorQUANTMILHO
									}
							}
						},
						/*{
							"id": "producao_milho_valor",
							"categ": ["Agricultura"],
							"nome": "Produção de Milho - R$",
							"descricao": "Valor da produção de Milho em Reais, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "R$",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "VALOR",
									"Table":"producao_milho_valor_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoVALORMILHO = []
										var valorVALORMILHO = []

										rows.forEach(function(valor){
												anoVALORMILHO.push(valor.ANO)
												valorVALORMILHO.push(valor.VALOR)
										})
										metadata['ano'] = anoVALORMILHO
										metadata['valor'] = valorVALORMILHO
									}
							}
						},*/
						{
							"id": "producao_leite_quantidade",
							"categ": ["Pecuária"],
							"nome": "Produção de leite - lt",
							"descricao": "Quantidade de leite em litros produzido por municípios do brasil, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "l",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_LIT",
									"Table":"producao_leite_quantidade_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoQUANTLEITE = []
										var valorQUANTLEITE = []

										rows.forEach(function(quant){
												anoQUANTLEITE.push(quant.ANO)
												valorQUANTLEITE.push(quant.QUANT_LIT)
										})
										metadata['ano'] = anoQUANTLEITE
										metadata['valor'] = valorQUANTLEITE;
									}
							}
						},
						/*{
							"id": "producao_leite_valor",
							"categ": ["Pecuária"],
							"nome": "Produção de Leite - R$",
							"descricao": "Valor da produção de leite em Reais, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "R$",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "VALOR",
									"Table":"producao_leite_valor_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoVALORLEITE = []
										var valorVALORLEITE = []

										rows.forEach(function(valor){
												anoVALORLEITE.push(valor.ANO)
												valorVALORLEITE.push(valor.VALOR)
										})
										metadata['ano'] = anoVALORLEITE
										metadata['valor'] = valorVALORLEITE
									}
							}
						},*/
						{
							"id": "area_plantada_algodao",
							"categ": ["Agricultura"],
							"nome": "Área Plantada de Algodão",
							"descricao": "Áreas de plantação de algodão em caroço por municípios do Brasil, por hectares, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "AREA_HA",
									"Table":"area_plantada_algodao_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoAREAALGODAO = []
										var valorAREAALGODAO = []

										rows.forEach(function(area){
												anoAREAALGODAO.push(area.ANO)
												valorAREAALGODAO.push(area.AREA_HA)
										})
										metadata['ano'] = anoAREAALGODAO
										metadata['valor'] = valorAREAALGODAO
									}
							}
						},
						{
							"id": "producao_algodao_quantidade",
							"categ": ["Agricultura"],
							"nome": "Produção de Algodão - ton",
							"descricao": "Quantidade de algodão em caroço produzido por municípios do brasil, em Toneladas, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "ton",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_TON",
									"Table":"producao_algodao_quantidade_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoQUANTALGODAO = []
										var valorQUANTALGODAO = []

										rows.forEach(function(quant){
												anoQUANTALGODAO.push(quant.ANO)
												valorQUANTALGODAO.push(quant.QUANT_TON)
										})
										metadata['ano'] = anoQUANTALGODAO
										metadata['valor'] = valorQUANTALGODAO
									}
							}
						},
						/*{
							"id": "producao_algodao_valor",
							"categ": ["Agricultura"],
							"nome": "Produção de Algodão - R$",
							"descricao": "Valor da produção de Algodão em Reais, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "R$",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "VALOR",
									"Table":"producao_algodao_valor_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoVALORALGODAO = []
										var valorVALORALGODAO = []

										rows.forEach(function(valor){
												anoVALORALGODAO.push(valor.ANO)
												valorVALORALGODAO.push(valor.VALOR)
										})
										metadata['ano'] = anoVALORALGODAO
										metadata['valor'] = valorVALORALGODAO
									}
							}
						},*/
						{
							"id": "producao_lenha_quantidade",
							"categ": ["Agricultura"],
							"nome": "Produção de Lenha - m³",
							"descricao": "Quantidade de Lenha produzida por municípios do brasil, em Metros Cúbicos, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "m³",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "QUANT_M3",
									"Table":"producao_lenha_quantidade_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoQUANTLENHA = []
										var valorQUANTLENHA = []

										rows.forEach(function(quant){
												anoQUANTLENHA.push(quant.ANO)
												valorQUANTLENHA.push(quant.QUANT_M3)
										})
										metadata['ano'] = anoQUANTLENHA
										metadata['valor'] = valorQUANTLENHA
									}
							}
						},
						/*{
							"id": "producao_lenha_valor",
							"categ": ["Agricultura"],
							"nome": "Produção de Lenha - R$",
							"descricao": "Valor da produção de Lenha por municípios do Brasil em Reais, no período de 2000 a 2015, conforme dados censitários do IBGE.",
							"unidade": "R$",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB": {
									"Columm": "VALOR",
									"Table":"producao_lenha_valor_regions_view",
									"Group": " GROUP BY ANO",
									"process": function(rows,metadata) {
										var anoVALORLENHA = []
										var valorVALORLENHA = []

										rows.forEach(function(valor){
												anoVALORLENHA.push(valor.ANO)
												valorVALORLENHA.push(valor.VALOR)
										})
										metadata['ano'] = anoVALORLENHA
										metadata['valor'] = valorVALORLENHA
									}
							}
						},*/
						{
							"id": "areas_embargadas",
							"categ": ["Social"],
							"nome": "Áreas Embargadas",
							"descricao": "Áreas que sofrerão sanções administrativas e/ou medidas cautelar, tendo por objetivo propiciar a regeneração do meio ambiente e dar viabilidade à recuperação da área degradada, fonte IBAMA.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "espacial",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB":{
									"Columm": "AREA_HA",
									"Table": "areas_embargadas_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];
									}
							}
						},
						{
							"id": "desmatamento_acumulado",
							"categ": ["Agricultura", "Pecuária"],
							"nome": "Desmatamento Acumulado",
							"descricao": "Desmatamento acumulado nos últimos 5 anos (2012 a 2016), nos Biomas Amazônia, Cerrado e Mata atlântica. Utilizando dados do PRODES/INPE para a Amazônia, SIAD/LAPIG para o Cerrado, SOS Mata Atlântica para a Mata Atlântica.",
							"unidade": "ha",
							"regiao": "Brasil",
							"area_ha": '',
							"valor": [],
							"ano": [],
							"tipo": "numerico",
							"bbox": "-73.9904499673534,-33.7515830040535,-28.835907629926,5.27184107509129",
							"DB":{
									"Columm": "AREA_HA",
									"Table": "desmatamento_acumulado_regions_view",
									"Group": "",
									"process": function(rows,metadata) {
										metadata['valor'] = [rows[0].AREA_HA];
										metadata['ano'] = [rows[0].ANO];
									}
							}
						}

		];

		Indicadores.infoBbox = [
              ['BRASIL', [-33.752414, -73.794489], [5.047586,-35.117489]],   
							['Arco do Desmatamento', [-13.8706697433894, -70.6208697166754], [-1.04397682863616, -44.8983096783213]],
							['MATOPIBA', [-15.2647043201696,-50.742063982783],[-2.2193566757778,-41.7958843801099]],
							['AMAZÔNIA', [-16.2905190391443,-73.9904499596311], [5.27184107515087, -43.0177679425571]],
							['CAATINGA', [-16.0884759016231,-44.5084182970686], [-2.78423064952074, -35.0985861479423]],
							['CERRADO', [-24.6846259981298,-60.1094168432324], [-2.32633300152119, -41.5221150102917]],
							['MATA ATLÂNTICA', [-29.9727657537398,-55.7812928486603], [-3.83006497691515, -28.835907628963]],
							['PAMPA', [-33.751583006014,-57.6433158444357], [-28.0951804998136, -49.6776313399901]],
							['PANTANAL', [-22.1504419255242,-59.186801362403], [-15.1329088319936, -54.9218143293872]],
							['AC', [-11.14483312889739,-73.990943646787], [-7.111457313901811, -66.61936007121035]],
							['AL', [-10.49991242751231,-38.23723765847232], [-8.812707713946306, -35.15226052810746]],
							['AM', [-9.817660810954109,-73.80098229366574], [2.24657473081615, -56.0970746653338,]],
							['AP', [-1.235630097206611,-54.87577460655976], [4.437060299108815, -49.87577596849272]],
							['BA', [-18.34893845945487,-46.61667238804129], [-8.533077608153793, -37.34080010786623]],
							['CE', [-7.857773760556362,-41.42314276802073], [-2.784032263859355, -37.25264223538931]],
							['DF', [-16.05131120480394,-48.28665562853161], [-15.49971572791068, -47.30776135069044]],
							['ES', [-21.301288430759,-41.87939124095406], [-17.89146972697392, 9.66563575186419]],
							['GO', [-19.49869140776348,-53.25072227861539], [-12.39550507262561, -45.90654432747818]],
							['MA', [-10.26124031754762,-48.7547164838366], [-1.044135365616286, -41.79623316434894]],
							['MG', [-22.92226694061974,-51.04546754380609], [-14.23273478616196, -39.85645274188406]],
							['MS', [-24.06790392043327,-58.16704468477753], [-17.16619496179095, -50.92265438320943]],
							['MT', [-18.04113392716333,-61.63282458549314], [-7.348647867021772, -50.22435669088633]],
							['PA', [-9.840743617778214,-58.89713089740838], [2.591355735126576, -46.0605348905208]],
							['PB', [-8.302540221840562,-38.76499490088651], [-6.025516029553926, -34.79333472998506]],
							['PE', [-9.482478264310442,-41.35795780124156], [-3.830062812902576, -32.39219016381675]],
							['PI', [-10.92833248807644,-45.99387843152558], [-2.738941203025053, -40.37014141599888]],
							['PR', [-26.71680856248925,-54.61863413982433], [-22.51582628641998, -48.02306675959305]],
							['RJ', [-23.36769836480608,-44.88849349002591], [-20.76353799938587, -40.9563947928047]],
							['RN', [-6.982330999424829,-38.58118965671923], [-4.831325868341867, -34.96821735468426]],
							['RO', [-13.6932892296135,-66.80573435974838], [-7.968911558440769, -59.77383540127021]],
							['RR', [-1.580279010122118,-64.82471613282798], [5.272155629716081, -58.8863839458957]],
							['RS', [-33.75158274659308,-57.6432174962109], [-27.08011349617855, -49.69114252468573]],
							['SC', [-29.35093805532915,-53.83584077230005], [-25.9555923981206, -48.35831004252309]],
							['SE', [-11.56820208985067,-38.24469318793231], [-9.514607787467376, -36.39353085815849]],
							['SP', [-25.31182903176157,-53.10935612642795], [-19.77919383235752, -44.16051713806287]],
							['TO', [-13.46727761938996,-50.74160818574438], [-5.167998438250915, -45.69711366617483]]
            ];

		Consults.getIndicadoresDb = function(callback) {
				var indicadoresDb = new sqlite3.Database(config.indicadoresDb);
				indicadoresDb.spatialite(function() {
						callback(indicadoresDb);
				});
		}

		Indicadores.csv = function(request, response, next){
			var json2csv = require('json2csv');
			var table = request.param('id', '');
			var sql = 'SELECT * FROM "'+table+'_regions_view"';

			Consults.getIndicadoresDb(function(indicadoresDb){
					indicadoresDb.all(sql, function(err, rows){
						if(err){
							response.setHeader("Access-Control-Allow-Origin", "*");
							response.send("Desculpe, tabela não encontrada!");
							response.end();
						}else{
							rows.forEach(function(r){
								delete r.Geometry;
								delete r.bbox;
								delete r.bboxleaflet;
								delete r.REGION_FK;
								delete r.PK_UID;
							})

							var csv = json2csv({ data: rows});
			
							response.setHeader("Access-Control-Allow-Origin", "*");
							response.set('Content-Type', 'text/csv');
							response.attachment(table+'.csv');
							response.status(200).send(csv);
							response.end();
						};
					});
			});			
		}

		Indicadores.getQuerySql = function(columm, table, filter, group ) {
				var sqlOperation = 'sum';

				return 		"SELECT ANO, bboxleaflet, " +sqlOperation + "(" + columm + ") as " + columm 
								+ " FROM \""+ table +"\" "
								+ filter
								+ group
		}

		Indicadores.getQuerySqlRanking = function(columm, table, filter, group, order) {		
				var sqlOperation = 'sum';

				return 		"SELECT COD_MUNICI, MUNICIPIO, UF, " + sqlOperation + "(" + columm + ") as VALOR, ANO"
								+ " FROM \""+ table +"\" "
								+ filter
								+ group
								+ " ORDER BY VALOR " +order
		}

		Indicadores.getRegionFilter = function(regionType, region, columm) {	
				var filterPreffix = '';
				var filterSuffix = '';

				if (regionType == 'estado') {
					return "WHERE " + filterPreffix + 'UF' + filterSuffix + " = '" + region + "'";
				} else if (regionType == 'municipio') {
					return "WHERE " + filterPreffix + 'COD_MUNICI' + filterSuffix + " = '" + region + "'";
				}else if (regionType == 'bioma') {
					return "WHERE " + filterPreffix + 'BIOMA' + filterSuffix + " = '" + region + "'";
				} else if (regionType == 'regiao' && region == 'Arco do Desmatamento') {
					return "WHERE " + filterPreffix + 'ARCODESMAT' + filterSuffix + " = '1'";
				} else if (regionType == 'regiao' && region == 'MATOPIBA') {
					return "WHERE " + filterPreffix + 'MATOPIBA' + filterSuffix + " = '1'";
				}
		}

		Indicadores.lista = function(request, response, next) {
				var metadata = Indicadores['metadata'];
				var infoBbox = Indicadores.infoBbox;
				var bbox = "[[-33.752414, -73.794489], [5.047586, -35.117489]]";
				var result = [];
				var aux;

				var regionType = request.param('regionType', '');
				var region = request.param('region', '');
				var filter = '';

				infoBbox.forEach(function(info){
					if(regionType != "municipio"){
						if(region == info[0]){
							bbox = "[["+info[1]+"], ["+info[2]+"]]";
						}
					}
				});

				var interate =  function(metadata, next){

						var fieldResult = {
								"id": metadata.id,
								"categ": metadata.categ,
								"nome": metadata.nome,
								"descricao": metadata.descricao,
								"unidade": metadata.unidade,
								"regiao":metadata.regiao,
								"area_ha":metadata.area_ha,
								"valor": metadata.valor,
								"ano": metadata.ano,
								"tipo": metadata.tipo,
								"bbox": bbox
						};
						
						if (regionType){
								filter = Indicadores.getRegionFilter(regionType, region, metadata.DB.Columm);
								fieldResult['regiao'] = region;
						}else{
								fieldResult['regiao'] = 'Brasil';
						};

						var sql = Indicadores.getQuerySql(metadata.DB.Columm, metadata.DB.Table, filter, metadata.DB.Group);
						var sql2 = 'SELECT sum(POL_HA) as AREA_REG FROM "regions" '+filter;
						
						Consults.getIndicadoresDb(function(indicadoresDb){
								indicadoresDb.all(sql, function(err, rows){
									if(regionType == 'municipio' && rows[0])
											fieldResult['bbox'] = "[["+rows[0].bboxleaflet+"]]";
									
									metadata.DB.process(rows, fieldResult);
										indicadoresDb.all(sql2, function(err, rows){
											fieldResult['area_ha'] = rows[0].AREA_REG;
											result.push(fieldResult)
											next();
										});
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

		Indicadores.ranking = function(request, response, callback) {
				var metadata = Indicadores['metadata'];

				var indicadorId = request.param('id', '');
				var ano = request.param('ano', '');
				var regionType = request.param('regionType', '');
				var region = request.param('region', '');

				var colDB = '';
				var tblDB = '';
				var filter = '';
				var filterRanking = '';

				var structureJson = {
						"id": indicadorId,
						"ano": ano,
						"region": region,
						"ranking": {"maior": [null], "menor": [null]}
				};

				metadata.forEach(function(metadata){
					if(metadata.id == indicadorId){
						colDB = metadata.DB.Columm;
						tblDB = metadata.DB.Table
					}
				});

				if (regionType){
						filter = Indicadores.getRegionFilter(regionType, region, colDB);
						if(ano){
								filterRanking = filter + "AND ANO = "+ano+ " ";
						}else{
								filterRanking = filter + " ";
						}
						structureJson['region'] = region;
				}else{
						if(ano){
								filterRanking = "WHERE " + colDB +" > 0 AND ANO = "+ano+ " ";
						}else{
								filterRanking = "WHERE " + colDB +" > 0 ";
						}
						structureJson['region'] = 'Brasil';
				};

				var group = "GROUP BY REGION_FK, ANO ";
				var desc = "DESC";
				var sqlRanking = Indicadores.getQuerySqlRanking(colDB, tblDB, filterRanking, group, desc);
				
				if(regionType == "municipio"){
							if(ano){
									filterRankingBr = "SELECT COD_MUNICI, MUNICIPIO, UF, sum("+colDB+") as VALOR, ANO FROM "+tblDB+" WHERE "+ colDB +" > 0 AND ANO = "+ano+" ";
									var sqlRankingUf = "SELECT UF FROM "+tblDB+" WHERE COD_MUNICI = "+ region+" AND "+ colDB +" > 0 AND ANO = "+ano+" LIMIT 1";
							}else{
									filterRankingBr = "SELECT COD_MUNICI, MUNICIPIO, UF, sum("+colDB+") as VALOR, ANO FROM "+tblDB+" WHERE "+ colDB +" > 0 ";
									var sqlRankingUf = "SELECT UF FROM "+tblDB+" WHERE COD_MUNICI = "+ region+" AND "+ colDB +" > 0 LIMIT 1";
							}
							var desc2 = "ORDER BY VALOR DESC";
							var sqlRankingBr = filterRankingBr+group+desc2;
							structureJson["rankingUF"] = {"maior": [null], "menor": [null]};
				}

				Consults.getIndicadoresDb(function(indicadoresDb){
						
						var processRanking = function(rows, structureJson) {
							
								var posicao = 0;
								var maior = [];
								var menor = [];

								rows.forEach(function(resultado){
										posicao = posicao+1;
										resultado.RANKING = posicao;

										maior = rows.slice(0, 10);
										if(rows.length > 10){
												menor = rows.slice(rows.length - 10, rows.length);
										}else{
												menor = rows.slice(0, rows.length);
										}

								});
							
								structureJson["ranking"].maior = maior;
								structureJson["ranking"].menor = menor;
								if (structureJson["ranking"].RKmunicipioBR){
										delete structureJson["ranking"].RKmunicipioBR;
								};
						};

						var processRankingBr = function(err, rows) {
								var posicao = 0;
								var rankingMaiorBR = [];
								var rankingMenorBR = [];
								
								rows.forEach(function(resultado){
										posicao = posicao+1;
										resultado.RANKING = posicao;

										rankingMaiorBR = rows.slice(0, 10);
										if(rows.length > 10){
												rankingMenorBR = rows.slice(rows.length - 10, rows.length);
										}else{
												rankingMenorBR = rows.slice(0, rows.length);
										}

										if(resultado.COD_MUNICI == region){
												structureJson['ranking'].RKmunicipioBR = resultado																	
										};
								});

								if(structureJson['ranking'].RKmunicipioBR){
										structureJson["ranking"].maior = rankingMaiorBR;
										structureJson["ranking"].menor = rankingMenorBR;
								}else{
										structureJson["ranking"].maior = null;
										structureJson["ranking"].menor = null;
								};
						};

						var processRankingUf = function(err, uf, callback) {

								if(uf.length > 0){
										var UFresult = " UF = "+"'"+uf[0].UF+"'";
										if(ano){
												var sqlRankingMunicipioUf = "SELECT COD_MUNICI, MUNICIPIO, UF, sum("+colDB+") as VALOR, ANO FROM "+tblDB+" WHERE"+UFresult+" AND "+ colDB +" > 0 AND ANO = "+ano+" "+group+desc2;
										}else{
												var sqlRankingMunicipioUf = "SELECT COD_MUNICI, MUNICIPIO, UF, sum("+colDB+") as VALOR, ANO FROM "+tblDB+" WHERE"+UFresult+" AND "+ colDB +" > 0 "+group+desc2;
										}
										indicadoresDb.all(sqlRankingMunicipioUf , function(err, results){
												var posicao = 0;
												var rankingMaiorUF = [];
												var rankingMenorUF = [];
												
												results.forEach(function(resultado){
														posicao = posicao+1;
														resultado.RANKING = posicao;

														rankingMaiorUF = results.slice(0, 10);
														if(results.length > 10){
																rankingMenorUF = results.slice(results.length - 10, results.length);
														} else {
																rankingMenorUF = results.slice(0, results.length);
														};

														if(resultado.COD_MUNICI == region){
																structureJson["rankingUF"].RKmunicipioUF = resultado;
														};
												});
												
												if(structureJson['rankingUF'].RKmunicipioUF){
														structureJson["rankingUF"].maior = rankingMaiorUF;
														structureJson["rankingUF"].menor = rankingMenorUF;
												} else {
														structureJson["rankingUF"].maior = null;
														structureJson["rankingUF"].menor = null;
												};
												callback();
										});
								} else {
										callback()
								}
						};

						indicadoresDb.all(sqlRanking , function(err, rows){
							processRanking(rows, structureJson);

							if(regionType == "municipio"){
									indicadoresDb.all(sqlRankingBr , function(err, rows){
										processRankingBr(err, rows);

											indicadoresDb.all(sqlRankingUf, function(err, uf){
												processRankingUf(err, uf, function() {
													response.setHeader("Access-Control-Allow-Origin", "*");
													response.send(structureJson);
													response.end();
												})
											});

									});
							}else{
									response.setHeader("Access-Control-Allow-Origin", "*");
									response.send(structureJson);
									response.end();
							};
						});

				});

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

												response.setHeader("Access-Control-Allow-Origin", "*");
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

				response.setHeader("Access-Control-Allow-Origin", "*");
    		//response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
				response.send(result)
				response.end()
			}
		}

		return Indicadores;

}