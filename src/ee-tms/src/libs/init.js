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
				console.log(cmd)
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

