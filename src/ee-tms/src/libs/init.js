var load = require('express-load');
var async = require('async');
var async = require('async');
var ChildProcess = require("child_process");
var path = require('path');
var fs = require('fs');
var schedule = require('node-schedule');

module.exports = function(app){
	
	var Init = {};
	var Main = {};
	var db = app.libs.db;
	var Internal = {};

	var pathMapID = app.config.pathCreateMapID

	
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

	Internal.getLayerForWmts = function(configLayers){		
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

		finishLayers = function(){
			callback(layerWithToken);			
		}

		overLayer = function(layer, nextLayer){
			cmd = "python"+" "+pathMapID+" "+layer.collection+" "+layer.startDate+" "+layer.enDate+" "+layer.composite+" "+layer.b_box;
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

		async.eachSeries(layers,overLayer,finishLayers);

	}

	
	Internal.layerWmtsIdObjectGenerator = function(layerWmts){
		var layerWmtslayerWmtsIdObject = {};

		for(var i = 0; i < layerWmts.length; i++){
			layerWmtslayerWmtsIdObject[layerWmts[i].id] = true;
		}
		return layerWmtslayerWmtsIdObject;

	}


	Internal.getRedisLayers = function(layersFoundRedis, callback){
		
		var layersFromRedis = [];


		finishlayersFoundRedis = function(){
			callback(layersFromRedis);
		}

		overlayersFoundRedis = function(redisWmtsId, nextId){
			db.get(redisWmtsId, function(data){
				layersFromRedis.push(data);
				nextId();						
			});
		}

		async.eachSeries(layersFoundRedis,overlayersFoundRedis,finishlayersFoundRedis);

	}

	Internal.layersNotFoundRedis = function(layerWmts, layerWmtsIdObject){
		var layersNotFoundRedis = [];

		for(key in layerWmts){
			if(layerWmtsIdObject[layerWmts[key].id]){
				layersNotFoundRedis.push(layerWmts[key]);
			}
		}
		
		return layersNotFoundRedis;

	}

	Internal.Conciditional = function(layersNotFoundRedis, layersFoundRedis, callback){

		var result = layersFoundRedis;	
		
		Internal.EEAccess(layersNotFoundRedis, function(layerWmtsWithToken){		
			
			for (i in layerWmtsWithToken){
				db.set(layerWmtsWithToken[i].id, layerWmtsWithToken[i]);
				result.push(layerWmtsWithToken[i]);
			}				
			callback(result);

		});

	}
	
	Internal.inspectionRedis = function(layerWmts, inspectionRedisCallback){
		var layersNotFoundRedis = [];
		var layerWmtsIdObject = Internal.layerWmtsIdObjectGenerator(layerWmts);	

		db.getAll("EE_KEYS:*", function(keysFoundRedis){

			for(i in keysFoundRedis){
				if(!layerWmtsIdObject[keysFoundRedis[i]]){
					db.del(layerWmtsIdObject[keysFoundRedis[i]]);
				}else{
					delete layerWmtsIdObject[keysFoundRedis[i]];
				}				
			}

			layersNotFoundRedis = Internal.layersNotFoundRedis(layerWmts, layerWmtsIdObject);
			
			Internal.getRedisLayers(keysFoundRedis, function(layersFoundRedis){

				
				Internal.Conciditional(layersNotFoundRedis, layersFoundRedis, function(capabilities){

					inspectionRedisCallback(capabilities);

				});

			});

		});					
		
	}

	Init.getAllLayers = function(callback) {
		db.getAll("EE_KEYS:*", function(keysFoundRedis){
			Internal.getRedisLayers(keysFoundRedis, function(layersFoundRedis){
				callback(layersFoundRedis);
			});
		});
	}

	Init.getLayer = function(id, callback){
		var layer;
		Internal.getRedisLayers(["EE_KEYS:"+id], function(layerFoundRedis){			
			layer = layerFoundRedis[0];
			callback(layer);
		
		});
	}

	Init.init = function(functionApp){
		
		var configLayer = app.config.layers;			
		var layerWmts = Internal.getLayerForWmts(configLayer);			
		
		Internal.inspectionRedis(layerWmts, function(capabilities){
			functionApp();
		});		
	
	}		

	return Init;

}	
	
	
