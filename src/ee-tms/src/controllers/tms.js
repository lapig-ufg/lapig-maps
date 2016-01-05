var buffer = require('buffer')
	  archiver = require('archiver')
	  path = require('path')
	  fs = require('fs')
	  async = require('async');
	  ChildProcess = require("child_process")


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
				var temporarieList = []
				temporarieList.push(list[i], list[i+1]);
				listReturn.push(temporarieList)
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
					"<ResourceURL format='image/jpeg' resourceType='tile' template='https://earthengine.googleapis.com/map/"+layers[i].mapid+"/{TileMatrix}/{TileCol}/{TileRow}?token="+layers[i].token+"/>\n" +
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

		dates = Internal.PairsGenerate(dates);

		return dates;
		
	}



	Internal.getLayers = function(configLayers){		

		var layersList = [];
		
		for (var i = 0; i < configLayers.length; i++){

			PairDates = Internal.dateRange(configLayers[i].start_date, configLayers[i].end_date, configLayers[i].temporal_resolution, configLayers[i].temporal_resolution_type);
			configLayers[i]['Dates'] = PairDates;
			
			for(var j = 0; j < configLayers[i].Dates.length; j++){										

				for(var k = 0; k < configLayers[i].composites.length; k++){	

						if(configLayers[i].Dates[j+1] == undefined){
							break;
						}

						var layer = {
													'id':configLayers[i].layer + '_' + Internal.parsinglayersString(configLayers[i].Dates[j][0]) + '_' + Internal.parsinglayersString(configLayers[i].Dates[j][1]) + '_' + Internal.removeBComma(configLayers[i].composites[k]),
													'collection': configLayers[i].collection_id,
													'startDate': configLayers[i].Dates[j][0],
													'enDate':configLayers[i].Dates[j][1],
													'composite': configLayers[i].composites[k]
												};

						layersList.push(layer);					

				}
			
			}
			
		
		}

		return layersList;
		
	}

	Internal.EEAccess = function(layers, callback){

		var layerWithToken = [];

		finalize = function(){
			console.log('fim dos layers')
			callback(layerWithToken);
		}

		overLayer = function(layer, nextLayer){

			cmd = "python"+" "+"/home/jose/Documentos/github/lapig-maps/src/ee-tms/create_mapid.py"+" "+layer.collection+" "+layer.startDate+" "+layer.enDate+" "+layer.composite;
			
			ChildProcess.exec(cmd, function(err, stdout, stderr){

				if(stderr){					
						console.log(stderr);
				}
				
				stdout=stdout.replace(/'/g, '"');				
				stdout=JSON.parse(stdout);
				layer["token"] = stdout.token;
				layer["mapid"] = stdout.mapid;
				layerWithToken.push(layer);

				nextLayer();

			});

		}

		async.eachSeries(layers,overLayer,finalize);

	}


	Tms.process = function(request, response) {

		pathXML = app.config.pathXML;

		var config = app.config.layers;

		var layers = Internal.getLayers(config);

		Internal.EEAccess(layers, function(layerWithToken){
			
			xml = Internal.xmlGenerator(layerWithToken);

			fs.readFile(pathXML, 'utf8', function (err, data) {
				
				result = data.replace('{xmlLayers}', xml);

				response.setHeader('content-type', 'application/xml');
				response.send(result);
				response.end();
		
			});

		});

		
	}

	return Tms;

}