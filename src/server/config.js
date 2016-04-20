var appRoot = require('app-root-path');
var passwords = require(appRoot + '/passwords.json')

module.exports = function(app) {
	//appRoot faz parte da documentação do js
	var config = {
		"appRoot": appRoot, 
		"pathTimeSeries":appRoot+"/integration/py/time-series/time_series.py",
		"spatialIntelligenceDb": "/home/fernanda/Documentos/Projeto/lapig-maps/spatial-intelligence.sqlite",
		"hostUrl": 'http://localhost:5000',
		"ows": "http://maps.lapig.iesa.ufg.br/",
		"tms": "http://localhost:5555",
		"clientDir": appRoot + "/../client/build",
		"langDir": appRoot + "/lang",
		"mongo": {
			"host": "localhost",
			"port": "27017",
			"dbname": "lapig-maps"
		},
		"port": 5000,
		"redis": {
			'host': 'localhost',
			'port': '6379',
			'expiration': 1800,
			'prefix': "pastagem.org",
			'enable': true,
		},
		"email": {
			'gmailUser': passwords.gmailUser,
			'gmailPassword': passwords.gmailPassword,
			'replyTo': 'contato@pastagem.org'
		}
	};

	if(process.env.NODE_ENV == 'prod') {
		config["port"] = 3000;
		config["ows"] =  "http://localhost:5500",
		config["hostUrl"] = 'http://maps.lapig.iesa.ufg.br';
		config.redis['host'] = '200.137.217.157'
		config.redis['enable'] = true;
		config["spatialIntelligenceDb"] = "/data/catalog/Ocultos/spatial-intelligence.sqlite"
	}

	return config;

}