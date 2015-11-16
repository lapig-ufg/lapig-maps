var buffer = require('buffer')
	  archiver = require('archiver')
	  path = require('path')
	  fs = require('fs')
	  async = require('async');


module.exports = function(app) {

	var Tms = {};
	var Internal = {};

	var config = app.config;
	var cache = app.libs.cache;

	Internal.removeBComma = function(str){
		str = str.replace(/B/g,'');
		str = str.replace(/,/g,'');
		return str
	}

	Internal.parsinglayersString = function(str){

		slicedStr = str.slice(8,10) + str.slice(5,7) + str.slice(2,4);
		return slicedStr;

	}


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
					"<ResourceURL format='image/jpeg' resourceType='tile' template='https://earthengine.googleapis.com/map/b4d983aebb7871d900ecac80bc6eeba8/{TileMatrix}/{TileCol}/{TileRow}?token=ca7028b854b65d592842e953197189a0'/>\n" +
					"</layers>";
		
			}
		
			return xml;
			
	}

	Internal.dateRange = function(startDate, finalDate, temporalResolution, temporalResolutionType){


		
    var dates = [];
		temporal = parseInt(temporalResolution);

		if(temporalResolutionType == 'day'){
			
			var Start = new Date(startDate);
			var Final = new Date(finalDate);
		
			var count = Start.getFullYear()

			var monthInitial = Start.getMonth() + 1;
		

			dates.push(Start.getFullYear()+'-'+monthInitial+'-'+Start.getDate());

			while(Start <= Final){

				monthInitial = Start.getMonth() + 1;
				dates.push(Start.getFullYear()+'-'+monthInitial+'-'+Start.getDate());
				
				Start.setDate(Start.getDate() + temporal);

				if(Start.getFullYear() == count + 1){
					var Start = new Date(Start.getFullYear()+'-'+1+'-'+1);
					count = Start.getFullYear()
				}

			}

			console.log(dates);

		}else{

			var Start = new Date(startDate);
			var Final = new Date(finalDate);

			var count = Start.getFullYear();

			var monthInitial = Start.getMonth() + 1;

			dates.push(Start.getFullYear()+'-'+monthInitial+'-'+Start.getDate());

			while(Start <= Final){

		
				dates.push(Start.getFullYear()+'-'+monthInitial+'-'+Start.getDate());

				monthInitial = monthInitial + temporal;

				if(Start.getFullYear() == count + 1){
					var Start = new Date(Start.getFullYear()+'-'+1+'-'+1);
					count = Start.getFullYear();
				}

			}

			console.log(dates);

		}
	
	}

	Internal.getLayers = function(configLayers){				

		var layersList = [];
			
		for (var i = 0; i < configLayers.length; i++){
			
			x = Internal.dateRange(configLayers[i].start_date, configLayers[i].end_date, configLayers[i].temporal_resolution, configLayers[i].temporal_resolution_type);
			//aqui passarei a data inicial e final, temporal_resolution, temporal_resolution_type para uma função que me retornará todas as datas do range entre inicial e final;

			for (var j = 0; j < configLayers[i].composites.length; j++){
				
				var layer = {
											'id':configLayers[i].layer + '_' + Internal.parsinglayersString(configLayers[i].start_date) + '_' + Internal.parsinglayersString(configLayers[i].end_date) + '_' + Internal.removeBComma(configLayers[i].composites[j])
										};

				layersList.push(layer);

			}

		}

		return layersList;

	}


	Tms.process = function(request, response) {

		pathXML = config.pathXML;
	
		var layers = Internal.getLayers(config.layers);

		var xmlLayers = Internal.xmlGenerator(layers);	

		fs.readFile(pathXML, 'utf8', function (err, data) {

			result = data.replace('{xmlLayers}', xmlLayers);

			response.setHeader('content-type', 'application/xml');

			response.send(result);

			response.end();


		});
		
	}

	return Tms;
}