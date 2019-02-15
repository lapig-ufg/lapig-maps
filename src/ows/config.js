var appRoot = require('app-root-path');

module.exports = function(app) {

	var pathTmp = '/mnt/tmpfs/';

	var config = {
			  'path_tmp': pathTmp
			,	'path_static': appRoot + 'public'
			,	'path_basemapfile': appRoot + '/data_dir/ows_base.map'
			/*, 'path_catalog': '/data/dados-lapig/catalog/' */
			, 'path_catalog': '/home/fmalaquias/Documentos/Projeto/Dados_local/' 
  		,	'path_metadata': '/home/fmalaquias/Documentos/Projeto/Dados_local/Metadados'
			,	'path_logfile': appRoot + '/log/ows-mapserv.log'
			,	'path_mapfile': pathTmp + 'ows_runtime.map'
			,	'path_undefined_img': appRoot + '/img/undefined.png'
			/*,	'path_mapserv': '/usr/src/mapserver-7.0.6/build/mapserv'*/
			, 'path_mapserv': 'mapserv'
			,	'path_fonts_list': appRoot + '/data_dir/ows_fonts.list'

			,	'path_projlib': '/usr/share/proj'
			, 'port': 5500

			,	'log_level': '5'
			, 'default_epsgproj': '4674'

			,	'ows_onlineresource': 'http://localhost:5000/ows'
			,	'ows_srs': 'EPSG:900913'
			,	'ows_title': 'LAPIG-OWS'

			, 'wms_getfeatureinfo_formatlist': 'gml'
			, 'wms_bbox_extended': 'TRUE'
			,	'wms_encoding': 'UTF-8'

			, 'pattern_mapfile': '*.map'

			,	'cacheDir': '/data/dados-lapig/ows-cache/layers'
			, 'cachePrefix': "pastagem.org"
			,	'cacheEnable': false

			, 'vectorBaseExt': 'shp'
			, 'vectorDownloadExts': ['.shp', '.shx', '.dbf', '.prj', '.sld']

			, 'rasterBaseExt': 'tif'
			, 'rasterDownloadExts': ['.tif']
		,	
	};

	if(process.env.NODE_ENV == 'prod') {
		config['path_catalog'] = '/data/catalog/'
		config['path_metadata'] = config['path_catalog']
		config['path_fonts_list'] =  appRoot + '/data_dir/ows_fonts_prod.list';
		/*config['path_logfile'] = '/var/log/lapig-maps/mapserver.log'*/
		config['path_mapserv'] = 'mapserv'
		config['ows_onlineresource'] = 'http://ows.lapig.iesa.ufg.br/ows';
		config['cacheEnable'] = true;
	}

	return config;

}