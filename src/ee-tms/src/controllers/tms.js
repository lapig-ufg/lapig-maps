var buffer = require('buffer')
	  archiver = require('archiver')
	  path = require('path')
	  fs = require('fs')
	  async = require('async')
	  ;
var wmts = '/home/jose/Documentos/github/lapig-maps/src/ee-tms/wmts.xml';

function toSliceComposite(str){

	str = str.replace(/B/g,'');
	str = str.replace(/,/g,'');
	return str

}

function toSLiceStr(str){

	slicedStr = str.slice(8,10) + str.slice(5,7) + str.slice(2,4);
	return slicedStr;

}

function getId(setLayers){

	var layers = [];
		
	for (var i = 0; i < setLayers.length; i++){
		
		for (var j = 0; j < setLayers[i].composites.length; j++){
			
			var layer = {
										'id':setLayers[i].layer + '_' + toSLiceStr(setLayers[i].start_date) + '_' + toSLiceStr(setLayers[i].end_date) + '_' + toSliceComposite(setLayers[i].composites[j])
									};

			layers.push(layer);

		}

	}

	return layers;

}

function xmlGenerator(setLayers){
	var xml = "";
	
	for (var i = 0; i < setLayers.length; i++){
		
		for (var j = 0; j < setLayers[i].composites.length; j++){
			
			xml +="<Layer>\n" +
				"<ows:Title>"+setLayers[i].layer+"</ows:Title>\n" +
				"<ows:Identifier>nasa</ows:Identifier>\n" +
				"<ows:WGS84BoundingBox crs='urn:ogc:def:crs:OGC:2:84'>\n" +
				"<ows:LowerCorner>-73.9909 -33.7516</ows:LowerCorner>\n" +
				"<ows:UpperCorner>-32.3922 5.27216</ows:UpperCorner>\n" +
				"</ows:WGS84BoundingBox>\n" +
				"<Style isDefault='true'>\n" +
				"<ows:Identifier>default</ows:Identifier>\n" +
				"</Style>\n" +
				"<Format>image/jpeg</Format>\n" +
				"<TileMatrixSetLink>\n" +
				"<TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>\n" +
				"</TileMatrixSetLink>\n" +
				"<ResourceURL format='image/jpeg' resourceType='tile' template='https://earthengine.googleapis.com/map/b4d983aebb7871d900ecac80bc6eeba8/"+setLayers[i].composites+"/"+toSLiceStr(setLayers[i].start_date)+"/"+toSLiceStr(setLayers[i].end_date)+"?token=ca7028b854b65d592842e953197189a0'/>\n" +
				"</Layer>";
		}

	}

	return xml;

}

module.exports = function(app) {

	var Tms = {};
	var Internal = {};
	var config = app.config;
	var cache = app.libs.cache;

	Tms.process = function(request, response) {
		
		var result = config;
		var idLayer = getId(config.layers);
		var xml = xmlGenerator(config.layers);
		
		response.send(xml);
		response.end();


	}

	return Tms;
}


//http://code.runnable.com/U4XhQL8RBlweSlcc/loading-xml-file-into-nodejs-as-a-json-for-node-js-and-hello-world