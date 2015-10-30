var buffer = require('buffer')
	  archiver = require('archiver')
	  path = require('path')
	  fs = require('fs')
	  async = require('async')
	  ;

//fazer função para tratar as datas

function toSliceComposite(str){

	str = str.replace(/B/g,'');
	str = str.replace(/,/g,'');
	return str

}

function toSLiceStr(str){

	slicedStr = str.slice(8,10) + str.slice(5,7) + str.slice(2,4);

	return slicedStr
}

module.exports = function(app) {

	var Tms = {};
	var Internal = {};
	var config = app.config;
	var cache = app.libs.cache;

	Tms.process = function(request, response) {

		var setLayers = config.layers;
		console.log("Print");
		
		for (var i = 0; i < setLayers.length; i++){
			
			for (var j = 0; j < setLayers[i].composites.length; j++){

				console.log(setLayers[i].layer + '_' + toSLiceStr(setLayers[i].start_date) + '_' + toSLiceStr(setLayers[i].end_date) + '_' + toSliceComposite(setLayers[i].composites[j]));

			}

		}
		
		

		
		var result = config

		response.send(result);
		response.end();
	}

	return Tms;
}