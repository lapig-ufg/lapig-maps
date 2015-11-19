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
					
		while(Start <= Final){

			if(Start.getFullYear() == count + 1){
				var Start = new Date(Start.getFullYear()+'-'+01+'-'+01);
				count = Start.getFullYear()
			}

			monthInitial = Start.getMonth() + 1;
			dayInitial = Start.getDate();
			yearInitial = Start.getFullYear();

			strMonthInitial = monthInitial.toString();
			strDayInitial = dayInitial.toString();
			strYearInitial = yearInitial.toString();

			if(strMonthInitial.length == 1)
				strMonthInitial = "0"+strMonthInitial

			if(strDayInitial.length == 1)
				strDayInitial = "0"+strDayInitial					
			
			strDate = strYearInitial+'-'+strMonthInitial+'-'+strDayInitial;

			dates.push(strDate);
			
			if(temporalResolutionType == 'day'){

				Start.setDate(Start.getDate() + temporal);

			} else {

				Start.setMonth(Start.getMonth() + temporal);				

			}

		}

		return dates;
			
	}



	Internal.getLayers = function(configLayers){				

		var layersList = [];
		
		for (var i = 0; i < configLayers.length; i++){

			Dates = Internal.dateRange(configLayers[i].start_date, configLayers[i].end_date, configLayers[i].temporal_resolution, configLayers[i].temporal_resolution_type);
			configLayers[i]['Dates'] = Dates;
			

			for(var j = 0; j < configLayers[i].Dates.length; j++){
				
				if(configLayers[i].Dates[j+1]==undefined){
						break;
				}

				var x = Internal.parsinglayersString(configLayers[i].Dates[j]);
				var y = Internal.parsinglayersString(configLayers[i].Dates[j+1]);
				

				for(var k = 0; k < configLayers[i].composites.length; k++){	

					var layer = {
												'id':configLayers[i].layer + '_' + x + '_' + y + '_' + Internal.removeBComma(configLayers[i].composites[k])
											};

					layersList.push(layer);					

				}
			
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

/**
var layer = {
												'id':configLayers[i].layer + '_' + Internal.parsinglayersString(configLayers[i].pairsDates[pairs]) + '_' + Internal.parsinglayersString(configLayers[i].pairsDates[pairs]) + '_' + Internal.removeBComma(configLayers[i].composites[j])
											};

					layersList.push(layer);
**/