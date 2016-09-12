var appRoot = require('app-root-path');

module.exports = function(app) {

	var pathTmp = '/mnt/tmpfs/';

	var config = {
			  'appRoot': appRoot
			, 'pathCreateMapID':appRoot+'/create_mapid.py'
			, 'port': 5555
			, 'pathWmts': appRoot+'/Template/wmts.xml'
			, 'eeTms': "https://earthengine.googleapis.com"
			, 'hostName':'http://localhost:5555'
			, 'midNight':'23 53 16 * * *'
			, 'layers': [
					{
					    "layer": "EE_KEYS:l8",
							"temporal_resolution": "16",
					    "temporal_resolution_type": "day",
					   	"start_date": "2015/01/01",
					    "end_date": "2015/12/31",
					    "collection_id": "LANDSAT/LC8_L1T_TOA",
					    "composites": ["B5,B6,B4"],
					    "b_box": ["-76.60","-35.06","-33.43","5.13"],
					    "satellite":"Landsat 8"
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
		config.redis.host = '200.137.217.157'
		config['port'] = '3300'
		config['hostName'] = 'http://maps.lapig.iesa.ufg.br'
	}

	return config;


};