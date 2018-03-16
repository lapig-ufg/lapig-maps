var appRoot = require('app-root-path');

module.exports = function(app) {

	var pathTmp = '/mnt/tmpfs/';

	var config = {
			  'path_tmp': pathTmp
			,	'path_static': appRoot + 'public'
			,	'path_basemapfile': appRoot + '/data_dir/ows_base.map'
			, 'path_catalog': appRoot + '/data_dir/catalog/'
  		,	'path_metadata': appRoot + '/data_dir/catalog/Metadados'
			,	'path_logfile': appRoot + '/log/ows-mapserv.log'
			,	'path_mapfile': pathTmp + 'ows_runtime.map'
			,	'path_undefined_img': appRoot + '/img/undefined.png'
			, 'path_mapserv': '/opt/mapserver-7.0.5/build/mapserv'
			,	'path_fonts_list': appRoot + '/data_dir/ows_fonts.list'

			,	'path_projlib': '/usr/share/proj'
			, 'port': 5500

			,	'log_level': '5'
			, 'default_epsgproj': '4674'

			,	'ows_onlineresource': 'http://localhost:5000/ows'
			,	'ows_srs': 'EPSG:4674 EPSG:4326 EPSG:900913'
			,	'ows_title': 'LAPIG-OWS'

			, 'wms_getfeatureinfo_formatlist': 'gml'
			, 'wms_bbox_extended': 'TRUE'
			,	'wms_encoding': 'UTF-8'

			, 'pattern_mapfile': '*.map'

			, 'redisHost': 'localhost'
			, 'redisPort': '6379'
			, 'cachePrefix': "pastagem.org"
			,	'cacheEnable': false

			, 'vectorBaseExt': 'shp'
			, 'vectorDownloadExts': ['.shp', '.shx', '.dbf', '.prj', '.sld']

			, 'rasterBaseExt': 'tif'
			, 'rasterDownloadExts': ['.tif']
		,	
	};

	if(process.env.NODE_ENV == 'prod') {
		config['path_fonts_list'] =  appRoot + '/data_dir/ows_fonts_prod.list';
		config['path_logfile'] = '/var/log/lapig-maps/mapserver.log'
		config['path_mapserv'] = 'mapserv'
		config['ows_onlineresource'] = 'http://maps.lapig.iesa.ufg.br/ows';
		config['redisHost'] = '200.137.217.157'
		config['cacheEnable'] = true;
	}

	return config;

}
