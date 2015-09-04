var appRoot = require('app-root-path');

module.exports = function(app) {

	var config = {
		"appRoot": appRoot,
		"hostUrl": 'http://10.0.0.157:5000',
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
		config["hostUrl"] = 'http://maps.lapig.iesa.ufg.br';
	}

	return config;

}