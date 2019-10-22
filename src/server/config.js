var appRoot = require('app-root-path');
var passwords = require(appRoot + '/passwords.json')

module.exports = function(app) {
	//appRoot faz parte da documentação do js
	var config = {
		"appRoot": appRoot, 
		"pathTimeSeries":appRoot+"/integration/py/time-series/time_series.py",
		"spatialIntelligenceDb": "/data/dados-lapig/catalog/Ocultos/spatial-intelligence.sqlite",
		"indicadoresDb":"/data/dados-lapig/catalog/Ocultos/indicadores.sqlite",
		"geocampoDb":"/data/dados-lapig/catalog/Ocultos/geocampo.sqlite",
		"hostUrl": 'http://localhost:5000',
		/* "ows": "http://200.137.217.158:5501", */
		"ows": "http://localhost:5500",
		"tms": "http://localhost:5555",
		"clientDir": appRoot + "/../client/build",
		"langDir": appRoot + "/lang",
		"mongo": {
			"host": "localhost",
			"port": "27017",
			"dbname": "lapig-maps"
		},
		"port": 5000,
		"email": {
			'gmailUser': passwords.gmailUser,
			'gmailPassword': passwords.gmailPassword,
			'replyTo': 'contato@pastagem.org'
		}
	};

	if(process.env.NODE_ENV == 'prod') {
		config["port"] = 3000;
		config["ows"] =  "http://ows.lapig.iesa.ufg.br",
		config["hostUrl"] = 'http://maps.lapig.iesa.ufg.br';
		config["spatialIntelligenceDb"] = "/data/catalog/Ocultos/spatial-intelligence.sqlite"
		config["indicadoresDb"] = "/data/catalog/Ocultos/indicadores.sqlite"
		config["geocampoDb"] = "/data/catalog/Ocultos/geocampo.sqlite"
	}

	return config;

}