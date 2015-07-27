var nodePdf = require('nodepdf')
	, temp = require('temp')
	, fs = require('fs')
	, querystring = require('querystring')
	;

module.exports = function(app) {

	var config = app.config;

	var Print = {};

	Print.map = function(request, response) {
		var url = '/ows';
		var srs = request.param('srs', 'EPSG:900913');
		var layers = request.param('layers', '');
		var labels = request.param('labels', '');
		var bbox = request.param('bbox', '');
		var size = request.param('size', '');
		var title = request.param('title', 'Mapa exportado de Pastagem.org');

		if(size) {
			var sizeSplit = size.split(',');
			var h = sizeSplit[0];
			var w = sizeSplit[1];

			var mapHeight = 490;
			var mapWidth = 700;

			var bboxSplit = bbox.split(',');
			var left = Number(bboxSplit[0]);
			var bottom = Number(bboxSplit[1]);
			var right = Number(bboxSplit[2]);
			var top = Number(bboxSplit[3]);

			var xOffset = (((right - left) * mapWidth) / w);
			var yOffset = (((top - bottom) * mapHeight) / h);

			bbox =  left + ',' + bottom + ',' 
			      + (left + xOffset) + ',' + (bottom + yOffset);
		}

		var map = url  + '?SERVICE=WMS'
		            + '&LAYERS=' + layers.split(';;').join(',')
		            + '&FORMAT=image%2Fpng'
		            + '&TRANSPARENT=TRUE'
		            + '&VERSION=1.1.1'
		            + '&REQUEST=GetMap'
		            + '&STYLES='
		            + '&SRS=' + srs
		            + '&BBOX=' + bbox
		            + '&WIDTH=700'
		            + '&HEIGHT=490';

		var legends = [];

		var split = layers.split(';;');
		var labelsSplit = labels.split(';;');

		for(var i=0; i < split.length; i++) {
			var layer = split[i];
			var label = unescape(labelsSplit[i]);

			legends.push({
			    "label": label
			  , "url": url  + '?SERVICE=WMS'
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

		response.render('print-map.ejs', { title: title, map: map, legends: legends });
	};

	Print.mapPdf = function(request, response) {

		var params  = querystring.stringify(request.query);
		var url = config.hostUrl + '/print?' + params;

		console.log(url);

		temp.open('map', function(err, info) {
			console.log(info.path);
			var pdf = new nodePdf(url, info.path, {
			    'viewportSize': {
			        'width': 3000,
			        'height': 9000
			    },
			    'paperSize': {
			        'pageFormat': 'A4',
			        'orientation': 'landscape',
			        'margin': {
			            'top': '1cm'
			        },
			        'footer': {
			            'height': '1cm',
			            'contents': function() {
			              return '<h1 class="float: right;">opaaaaaaaaaaa</h1>'
			            }
			        }
			    },
			    'zoomFactor': 1.1
			    ,'args': '--debug=true'
			});

			pdf.on('error', function(msg){
			  console.log(msg);
			  response.end();
			});

			pdf.on('done', function(pathToFile){
				console.log(pathToFile)
			  var readStream = fs.createReadStream(pathToFile);
			  readStream.pipe(response);
			});

			pdf.on('stdout', function(stdout){
			     // handle
			     console.log(stdout)
			});

			// listen for stderr from phantomjs
			pdf.on('stderr', function(stderr){
			    // handle
			    console.log(stderr)
			});

		});

	}

	return Print;
}