var appRoot = require('app-root-path');

module.exports = function(app) {

	var pathTmp = '/mnt/tmpfs/';

	var config = {
				'appRoot': appRoot
			,	'pathCreateMapID':appRoot+'/integration/py/create_mapid.py'
			, 'redisHost': 'localhost'
			,	'port': 5000
			, 'pathWmts': appRoot+'/Template/wmts.xml'
			, 'eeTms': "https://earthengine.googleapis.com"
			, 'layers': [
					{
				    "layer": "EE_KEYS:l8",
						"temporal_resolution": "16",
				    "temporal_resolution_type": "day",
				    "start_date": "2014/01/01",
				    "end_date": "2014/02/01",
				    "collection_id": "LANDSAT/LC8_L1T_TOA",
				    "composites": ["B6,B5,B4"],
				    "b_box": ["-76.60","-35.06","-33.43","5.13"],
				    "satellite":"Landsat 8"
					}]
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