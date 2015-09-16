var appRoot = require('app-root-path');

module.exports = function(app) {
	//appRoot faz parte da documentação do js
	var config = {
		"appRoot": appRoot, 
		"pathTimeSeries":appRoot+"/integration/py/time-series/time_series.py",
		"hostUrl": 'http://localhost:5000',
		"ows": "http://su03:5500",
		"clientDir": appRoot + "/../client/build",
		"mongo": {
			"host": "localhost",
			"port": "27017",
			"dbname": "lapig-maps"
		},
		"port": 5000
	};

	if(process.env.NODE_ENV == 'prod') {
		config["port"] = 3000;
		config["ows"] =  "http://localhost:5500",
		config["hostUrl"] = 'http://maps.lapig.iesa.ufg.br';
	}

	return config;

}