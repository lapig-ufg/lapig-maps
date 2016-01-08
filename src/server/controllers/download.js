var 	fs = require('fs')
		,	requester = require('request')
		,	StreamConcat = require('stream-concat')
		,	archiver = require('archiver')
		;

module.exports = function(app) {

	var config = app.config
	var layerModel = app.models.layer;
	var Download = {};

	Download.allLayers = function(request, response) {

		var id = request.param('id');
		layerModel.findById(id, function(layer) {
			
			var layers = []
			var layerLabel = layer.name;

			var metadataWasSend = false
			layer.fileObj.forEach(function(fileObjLayer) {
				
				var name = fileObjLayer.name;
				var type = fileObjLayer.type;
				var label = layer.name + ' - ' + fileObjLayer.date

				var metadataParam = ''
				if(!metadataWasSend) {
					metadataParam = '&METADATA='+layer.metadata;
				}

				var url = config.hostUrl+"/ows?";
				if(type == 'VECTOR') {
							url += 'REQUEST=GetFeature&SERVICE=WFS&VERSION=1.0.0'
									+ '&TYPENAME='+name
									+ '&OUTPUTFORMAT=shape-zip'
									+ metadataParam;
				} else {
							url += 'REQUEST=GetCoverage&SERVICE=WCS&VERSION=2.0.0'
									+ '&COVERAGEID='+name
									+ '&FORMAT=IMAGE/TIFF'
				}
				
				layers.push({ label: label, url: url });

			});

			response.render('download-all.ejs', { label: layerLabel, layers: layers });

		});

	};

	return Download;

}
