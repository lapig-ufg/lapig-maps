var nodePdf = require('nodepdf')
	, temp = require('temp')
	, fs = require('fs')
	, querystring = require('querystring')
	;

module.exports = function(app) {

	var config = app.config;

	var Print = {};

	Print.map = function(request, response) {
		var host = '/ows';
		
		var lang = require(config.langDir + '/en-us.json')
		
		var srs = request.param('srs', 'EPSG:900913');
		var layersParam = request.param('layers', '');
		var labelsParam = request.param('labels', '');
		var filtersParam = request.param('filters', '');
		var title = request.param('title', 'Fernanda');
		var lon = request.param('lon', lon);
		var lat = request.param('lat', lat);
		var zoom = request.param('zoom', zoom);
		var layers = [];

		var layerArray = layersParam.split(';;');
		var labelsArray = labelsParam.split(';;');
		var filtersArray = filtersParam.split(';;')

		for(var i=0; i < layerArray.length; i++) {

			var layer = layerArray[i];
			var label = unescape(labelsArray[i]);
			var filter = filtersArray[i];

			console.log(filter);
			layers.push({
			    "label": label
			  ,	"host": host
			  ,	"layername": layer
			  , "filter": filter
			  , "legendUrl": host  + '?SERVICE=WMS'
							+ '&VERSION=1.1.1'
							+ '&request=GetLegendGraphic'
			                + '&format=image/png'
			                + '&width=20'
			                + '&height=20'
			                + '&layer=' + layer
			                + '&format=image/png'
			                + '&SCALE=34942571.6116478'			                
			});
		}

		var strFonte = [];
		var fontes = layerArray.toString().split(',');

		for(var i=0; i<fontes.length; i++) {
					fonte = fontes[i].split('_')
					if(fonte.length >= 5) {
						fonte = fonte.reverse();
						fonte = fonte[0]
						strFonte.push(fonte);
					} else {
						strFonte.push('LAPIG');
					}
					
			}

		var listFonte = [];
		var splitFonte = strFonte.toString();
		splitFonte = splitFonte.split(',');

		for(var i=0; i<splitFonte.length; i++) {
			if(listFonte.indexOf(splitFonte[i]) != -1) {
				console.log("Fonte equals");
			} else {
				listFonte.push(splitFonte[i])
			}
		}

		listFonte = listFonte.toString()
		var fonte = listFonte.toUpperCase();
		fonte = fonte.replace(/,/g, "/ ");
		fonte = request.param('fonte', fonte);

		response.render('print-map.ejs', { title: title, layers: layers.reverse(), lang: lang, lon: lon, lat: lat, zoom: zoom, fonte: fonte});
	};

	Print.mapPdf = function(request, response) {

		var params  = querystring.stringify(request.query);
		var url = config.hostUrl + '/print?' + params;

		temp.open('map', function(err, info) {
			console.log(info.path);
			var pdf = new nodePdf(url, info.path, {
			    'viewportSize': {
			    	'margin': '10px',    	
			        'width': 700,
			        'height': 800
			    },
		   		'paperSize': {
			        'pageFormat': 'A4',
			        'orientation': 'landscape',
			        'margin': {
			            'top': '0.2cm',
			            'bottom': '0.2cm',
			            'left': '0.2cm',
			            'right': '0.2cm'
			        }
			    },
				'captureDelay': 0,
			    'zoomFactor': 1.1,
			    'args': '--debug=true'
			});
			

			pdf.on('error', function(msg){
			  response.end();
			});

			pdf.on('done', function(pathToFile){
			  var readStream = fs.createReadStream(pathToFile);
			  readStream.pipe(response);
			});

			pdf.on('stdout', function(stdout){
			    // handle
			});

			// listen for stderr from phantomjs
			pdf.on('stderr', function(stderr){
			    // handle
			});
		});
	}

	return Print;
}