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
	var pathWmts = app.config.pathWmts;

	Internal.xmlGenerator = function(layers){		

		var xml = "";

		console.log(layers);
		
		for (var i = 0; i < layers.length; i++){
				
			xml+="<Layer>\n"+
				"<ows:Title>"+layers[i].satellite+" "+layers[i].startDate+" "+"("+layers[i].composite+")"+"</ows:Title>\n"+
				"<ows:Identifier>"+layers[i].id+"</ows:Identifier>\n"+
				"<ows:WGS84BoundingBox crs='urn:ogc:def:crs:OGC:2:84'>\n"+
				"<ows:LowerCorner>"+layers[i].b_box[0]+" "+layers[i].b_box[1]+"</ows:LowerCorner>\n"+
				"<ows:UpperCorner>"+layers[i].b_box[2]+" "+layers[i].b_box[3]+"</ows:UpperCorner>\n"+
				"</ows:WGS84BoundingBox>\n"+
				"<Style isDefault='true'>\n"+
				"<ows:Identifier>default</ows:Identifier>\n"+
				"</Style>\n"+
				"<Format>image/jpeg</Format>\n"+
				"<TileMatrixSetLink>\n" +
				"<TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>\n" +
				"</TileMatrixSetLink>\n" +
				//<ResourceURL format='image/jpeg' resourceType='tile' template='https:localhost:5000/map/"+layers[i].mapid+"/"+layers[i].token+"'/>\n" +
				"<ResourceURL format='image/jpeg' resourceType='tile' template='https://earthengine.googleapis.com/map/"+layers[i].mapid+"/{TileMatrix}/{TileCol}/{TileRow}?token="+layers[i].token+"'"+"/>\n" +
				"</Layer>";
	
		}
	
		return xml;
			
	}

	Tms.process = function(request, response) {

		var xml = Internal.xmlGenerator(init.layers);

		console.log(pathWmts)

		fs.readFile(pathWmts, 'utf8', function (err, data) {
				result = data.replace('{xmlLayers}', xml);

				response.setHeader('content-type', 'application/xml');
				response.send(result);
				response.end();
		
			});
		
	}

	return Tms;

}