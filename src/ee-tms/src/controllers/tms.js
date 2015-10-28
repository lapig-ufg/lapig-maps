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
		
		response.send('funcionou');
		response.end()
	}

	return Tms;
}