var appRoot = require('app-root-path');

module.exports = function(app) {

	var pathTmp = '/mnt/tmpfs/';

	var config = {
			  'appRoot': appRoot
			, 'pathCreateMapID':appRoot+'/create_mapid.py'
			, 'redisHost': 'localhost'
			, 'port': 5555
			, 'pathWmts': appRoot+'/Template/wmts.xml'
			, 'eeTms': "https://earthengine.googleapis.com"
			, 'hostName':'http://localhost:5555'
			, 'midNight':'20 53 16 * * *'
			, 'layers': [
					{
					    "layer": "EE_KEYS:l8",
							"temporal_resolution": "16",
					    "temporal_resolution_type": "day",
					    "start_date": "2013/04/11",
					    "end_date": "2013/05/11",
					    "collection_id": "LANDSAT/LC8_L1T_TOA",
					    "composites": ["B4,B3,B2"],
					    "b_box": ["-76.60","-35.06","-33.43","5.13"],
					    "satellite":"Landsat 8"
					},
					{
					    "layer": "EE_KEYS:l7",
							"temporal_resolution": "16",
					    "temporal_resolution_type": "day",
					    "start_date": "2016/03/05",
					    "end_date": "2016/04/05",
					    "collection_id": "LANDSAT/LE7_L1T_TOA",
					    "composites": ["B3,B2,B1"],
					    "b_box": ["-76.60","-35.06","-33.43","5.13"],
					    "satellite":"Landsat 7"
					},
					{
					    "layer": "EE_KEYS:l5",
							"temporal_resolution": "16",
					    "temporal_resolution_type": "day",
					    "start_date": "1984/04/06",
					    "end_date": "1984/05/06",
					    "collection_id": "LANDSAT/LT5_L1T_TOA",
					    "composites": ["B3,B2,B1"],
					    "b_box": ["-76.60","-35.06","-33.43","5.13"],
					    "satellite":"Landsat 5"
					}
			  ]
			, "redis": {
				'host': 'localhost',
				'port': '6379',
				'expiration': 0,
				'enable': true,
		}
					
	}

	if(process.env.NODE_ENV == 'prod') {
		config['redisHost'] = '200.137.217.157'
	}

	return config;


};