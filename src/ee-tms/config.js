var appRoot = require('app-root-path');

module.exports = function(app) {

	var pathTmp = '/mnt/tmpfs/';

	var config = {
			  'redisHost': 'localhost'
			, 'redisPort': '6379'
			,	'port': 5000
			, 'pathXML': appRoot+'/Template/wmts.xml'
			, 'layers': [
					{
				    "layer": "l8",
						"temporal_resolution": "16",
				    "temporal_resolution_type": "day",
				    "start_date": "2013-04-11",
				    "end_date": "2013-07-31",
				    "collection_id": "LANDSAT/LC8_L1T_TOA",
				    "composites": ["B6,B5,B4","B5,B4,B3","B4,B3,B2"],
				    "b_box": ["-76.60","-35.06","-33.43","5.13"]
					}]
					
	}
			
			



	if(process.env.NODE_ENV == 'prod') {
		config['redisHost'] = '200.137.217.157'
	}

	return config;


};