var appRoot = require('app-root-path');

module.exports = function(app) {

	var pathTmp = '/mnt/tmpfs/';

	var config = {
			  'redisHost': 'localhost'
			, 'redisPort': '6379'
			,	'port': 5000
			, 'pathXML': appRoot+'/Template/wmts.xml'
			, 'eeTms': "https://earthengine.googleapis.com"
			, 'layers': [
					{
				    "layer": "l8",
						"temporal_resolution": "16",
				    "temporal_resolution_type": "day",
				    "start_date": "2014/01/01",
				    "end_date": "2014/01/17",
				    "collection_id": "LANDSAT/LC8_L1T_TOA",
				    "composites": ["B6,B5,B4"],
				    "b_box": ["-76.60","-35.06","-33.43","5.13"],
				    "satellite":"Landsat 8"
					}]
					
	}
			
			



	if(process.env.NODE_ENV == 'prod') {
		config['redisHost'] = '200.137.217.157'
	}

	return config;


};