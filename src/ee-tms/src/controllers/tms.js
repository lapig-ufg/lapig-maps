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

		stri = str.replace(/-/g,'');
		stri = str.slice(2,4) +'0'+str.slice(6,10);

		console.log(str, stri);		

		//slicedStr = str.slice(7,9) //+ str.slice(5,7) + str.slice(2,4);

		//console.log(slicedStr, str);
		//return slicedStr;

	}

	Internal.PairsGenerate = function(list){
		var listReturn = [];

		for (var i = 0; i < list.length; i++){
			if (list[i+1] == undefined){
				break;
			}else{				
				listReturn.push(list[i], list[i+1]);	
			}
			
		}

		return listReturn;

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

		var Start = new Date(startDate);
		var Final = new Date(finalDate);

		var count = 0;

		if(temporalResolutionType == 'day'){
					
			
			while(Start <= Final){

				monthInitial = Start.getMonth() + 1;


				if(monthInitial.toString().length == 1){
					
					if(Start.getDate().toString().length == 1){

						dates.push(Start.getFullYear()+'-'+'0'+monthInitial+'-'+'0'+Start.getDate());						

					}else{
						
						dates.push(Start.getFullYear()+'-'+'0'+monthInitial+'-'+Start.getDate());						

					}

				}
				else{

					if(Start.getDate().toString().length == 1){

						dates.push(Start.getFullYear()+'-'+monthInitial+'-'+'0'+Start.getDate());		

					}else{
						
						dates.push(Start.getFullYear()+'-'+monthInitial+'-'+Start.getDate());			

					}
				}
				
				Start.setDate(Start.getDate() + temporal);

				if(Start.getFullYear() == count + 1){
					var Start = new Date(Start.getFullYear()+'-'+01+'-'+01);
					count = Start.getFullYear()
				}

			}

		}else{

			Start.setMonth(Start.getMonth()+1);			

			while(Start <= Final){

				if(Start.getMonth() == 1){					
					dates.push(Start.getFullYear()+'-'+'0'+(Start.getMonth()+1)+'-'+Start.getDate());	
				}else
					dates.push(Start.getFullYear()+'-'+(Start.getMonth()+1)+'-'+Start.getDate());
				}

				Start.setMonth(Start.getMonth() + temporal);

				if(Start.getFullYear() == count + 1){					
					var Start = new Date(Start.getFullYear()+'-'+01+'-'+01);
					count = Start.getFullYear();
				}

			}

		console.log(dates)
		return Internal.PairsGenerate(dates);
			
	}
	


	Internal.getLayers = function(configLayers){				

		var layersList = [];
		
		pairsDates = Internal.dateRange(configLayers[0].start_date, configLayers[0].end_date, configLayers[0].temporal_resolution, configLayers[0].temporal_resolution_type);


		configLayers[0]['pairsDates'] = pairsDates;
				

		for (var i = 0; i < configLayers.length; i++){						
			
				for (var j = 0; j < configLayers[i].composites.length; j++){

					var layer = {
												'id':configLayers[i].layer + '_' + Internal.parsinglayersString(configLayers[i].pairsDates[pairs]) + '_' + Internal.parsinglayersString(configLayers[i].pairsDates[pairs]) + '_' + Internal.removeBComma(configLayers[i].composites[j])
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