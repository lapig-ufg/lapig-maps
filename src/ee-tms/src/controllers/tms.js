var buffer = require('buffer')
	  archiver = require('archiver')
	  path = require('path')
	  fs = require('fs')
	  async = require('async')
	  ;

module.exports = function(app) {

	var Tms = {};
	var Internal = {};
	var config = app.config;
	var cache = app.libs.cache;

	Tms.process = function(request, response) {

		var setLayers = config.layers;
		console.log("Print");
		for (var i = 0; i < setLayers.length; i++){
			console.log(setLayers[i].layer + '_' + setLayers[i].start_date + '_' + setLayers[i].end_date)
		}
		

		
		var result = config

		response.send(result);
		response.end();
	}

	return Tms;
}