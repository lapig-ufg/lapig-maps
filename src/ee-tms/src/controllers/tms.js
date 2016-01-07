var buffer = require('buffer');
	  archiver = require('archiver');
	  path = require('path');
	  fs = require('fs');
	  async = require('async');
	  ChildProcess = require("child_process");

module.exports = function(app) {

	var Tms = {};
	var Internal = {};

	var init = app.libs.init;
	var pathXML = app.config.pathXML;

	Internal.xmlGenerator = function(layers){

		var xml = "";
		
			for (var i = 0; i < layers.length; i++){
					
				xml +="<layers>\n" +
					"<ows:Title>"+layers[i].id+"</ows:Title>\n" +
					"<ows:Identifier>nasa</ows:Identifier>\n" +
					"<ows:WGS84BoundingBox crs='urn:ogc:def:crs:OGC:2:84'>\n" +
					"<ows:LowerCorner>-73.9909 -33.7516</ows:LowerCorner>\n" +
					"<ows:UpperCorner>-32.3922 5.27216</ows:UpperCorner>\n" +
					"</ows:WGS84BoundingBox>\n" +
					"<Style iStartefault='true'>\n" +
					"<ows:Identifier>default</ows:Identifier>\n" +
					"</Style>\n" +
					"<Format>image/jpeg</Format>\n" +
					"<TileMatrixSetLink>\n" +
					"<TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>\n" +
					"</TileMatrixSetLink>\n" +
					"<ResourceURL format='image/jpeg' resourceType='tile' template='https://earthengine.googleapis.com/map/"+layers[i].mapid+"/{TileMatrix}/{TileCol}/{TileRow}?token="+layers[i].token+"/>\n" +
					"</layers>";
		
			}
		
			return xml;
			
	}

	Tms.process = function(request, response) {

		var xml = Internal.xmlGenerator(init.layers);

		fs.readFile(pathXML, 'utf8', function (err, data) {
				
				result = data.replace('{xmlLayers}', xml);

				response.setHeader('content-type', 'application/xml');
				response.send(result);
				response.end();
		
			});
		
	}

	return Tms;

}