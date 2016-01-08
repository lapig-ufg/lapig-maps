var appRoot = require('app-root-path');

module.exports = function(app) {
	//appRoot faz parte da documentação do js
	var config = {
		"appRoot": appRoot, 
		"pathTimeSeries":appRoot+"/integration/py/time-series/time_series.py",
		"spatialIntelligenceDb": "/home/leandro/Tmp/spatial-intelligence.sqlite",
		"hostUrl": 'http://10.0.0.5:5000',
		"ows": "http://10.0.0.13:5500",
		"clientDir": appRoot + "/../client/build",
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
		}
	};

	if(process.env.NODE_ENV == 'prod') {
		config["port"] = 3000;
		config["ows"] =  "http://localhost:5500",
		config["hostUrl"] = 'http://maps.lapig.iesa.ufg.br';
		config.redis['host'] = '200.137.217.157'
		config.redis['enable'] = true;
	}

	return config;

}