var appRoot = require('app-root-path');

module.exports = function(app) {

	var pathTmp = '/mnt/tmpfs/';

	var config = {
			  'appRoot': appRoot
			, 'pathCreateMapID':appRoot+'/create_mapid.py'
			, 'redisHost': 'localhost'
			, 'port': 5000
			, 'pathWmts': appRoot+'/Template/wmts.xml'
			, 'eeTms': "https://earthengine.googleapis.com"
			, 'hostName':'http://localhost:5000'
			, 'midNight':'20 53 16 * * *'
			, 'layers': [
					{
					    "layer": "EE_KEYS:l8",
							"temporal_resolution": "16",
					    "temporal_resolution_type": "day",
					    "start_date": "2014/08/01",
					    "end_date": "2014/09/01",
					    "collection_id": "LANDSAT/LC8_L1T_TOA",
					    "composites": ["B4,B3,B2"],
					    "b_box": ["-76.60","-35.06","-33.43","5.13"],
					    "satellite":"Landsat 8"
					},
					/*
					{
					    "layer": "EE_KEYS:l5",
						"temporal_resolution": "16",
					    "temporal_resolution_type": "day",
					    "start_date": "2003/08/01",
					    "end_date": "2003/09/01",
					    "collection_id": "LANDSAT/LT5_L1T_TOA",
					    "composites": ["B5,B6,B7"],
					    "b_box": ["-76.60","-35.06","-33.43","5.13"],
					    "satellite":"Landsat 5"
					}
					*/
			  ]
			, "redis": {
				'host': 'localhost',
				'port': '6379',
				'expiration': 0,
				//'prefix': "pastagem.org",
				'enable': true,
		}
					
	}
			
			



	if(process.env.NODE_ENV == 'prod') {
		config['redisHost'] = '200.137.217.157'
	}

	return config;


};