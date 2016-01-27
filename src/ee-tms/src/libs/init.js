var load = require('express-load');
var async = require('async');
var async = require('async');
var ChildProcess = require("child_process");
var path = require('path');
var fs = require('fs');

module.exports = function(app){
	
	var Init = {};
	var Main = {};
	var config = app.config;
	var Internal = {};

	Internal.removeBComma = function(str){
		str = str.replace(/B/g,'');
		str = str.replace(/,/g,'');
		return str
	}
	

	Internal.parsinglayersString = function(str){

		slicedStr = str.slice(2,4) + str.slice(5,7) + str.slice(8,10);
				
		return slicedStr;

	}

	Internal.strDate = function(dt, sep) {
		monthInitial = dt.getMonth() + 1;
		dayInitial = dt.getDate();
		yearInitial = dt.getFullYear();

		strMonthInitial = monthInitial.toString();
		strDayInitial = dayInitial.toString();
		strYearInitial = yearInitial.toString();

		if(strMonthInitial.length == 1)
			strMonthInitial = "0"+strMonthInitial

		if(strDayInitial.length == 1)
			strDayInitial = "0"+strDayInitial					
		
		return strYearInitial + sep + strMonthInitial + sep + strDayInitial;
	}

	Internal.dateRange = function(startDate, finalDate, temporalResolution, temporalResolutionType){
		
	  var dates = [];
		temporal = parseInt(temporalResolution);

		var Start = new Date(startDate);
		var Final = new Date(finalDate);
					
		while(Start <= Final){

			if(Internal.strDate(Start, '/') != startDate) {
				Start.setDate(Start.getDate() + 1 );
			}

			dt1 = Internal.strDate(Start, '-')
			
			dt1Year = Start.getFullYear();

			if(temporalResolutionType == 'day'){
				Start.setDate(Start.getDate() + (temporal-1) );
			} else {
				Start.setMonth(Start.getMonth() + temporal);				
			}

			dt2Year = Start.getFullYear();

			if(dt1Year != dt2Year) {
				Start = new Date(dt1Year+'/12/31');
			}

			dt2 = Internal.strDate(Start, '-')

			dates.push([dt1, dt2])

		}

		return dates;
		
	}



	Internal.getLayers = function(configLayers){		

		var layersList = [];
		
		for (var i = 0; i < configLayers.length; i++){

			PairDates = Internal.dateRange(configLayers[i].start_date, configLayers[i].end_date, configLayers[i].temporal_resolution, configLayers[i].temporal_resolution_type);
			
			for(var j = 0; j < PairDates	.length; j++){										

				for(var k = 0; k < configLayers[i].composites.length; k++){	

						var layer = {
													'id':configLayers[i].layer + '_' + Internal.parsinglayersString(PairDates[j][0]) + '_' + Internal.parsinglayersString(PairDates[j][1]) + '_' + Internal.removeBComma(configLayers[i].composites[k]),
													'collection': configLayers[i].collection_id,
													'startDate': PairDates[j][0],
													'enDate':PairDates[j][1],
													'composite': configLayers[i].composites[k],
													'b_box': configLayers[i].b_box,
													'satellite': configLayers[i].satellite
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

			callback(layerWithToken);
			
		}

		overLayer = function(layer, nextLayer){

			cmd = "python"+" "+"/home/jose/Documentos/github/lapig-maps/src/ee-tms/create_mapid.py"+" "+layer.collection+" "+layer.startDate+" "+layer.enDate+" "+layer.composite+" "+layer.b_box;
			console.log(cmd);
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



	Init.init = function(functionApp){

		var pathXML = app.config.pathXML;

		var config = app.config.layers;

		var layers = Internal.getLayers(config);

		Internal.EEAccess(layers, function(layerWithToken){
			
			Init.layers = layerWithToken;

			functionApp();

		});

	}

	return Init
	

}

