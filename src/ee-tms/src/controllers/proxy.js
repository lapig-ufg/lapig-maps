var requester = require('request');
var querystring = require('querystring');
var x = require('request');
var fs = require('fs');

module.exports = function(app){
	var eetms = app.config.eeTms;	
	var Proxy = {};
	var layerFunction = app.libs.init.getLayer;
	var Internal = {};
	var cache = app.libs.cache;


	Internal.layerMapIdObjectGenerator = function(layers){
		var layerMapIdObject = {};
		for(var i = 0; i < layers.length; i++){
			layerMapIdObject[layers[i].mapid] = true;
		}
		return layerMapIdObject;
	}

	Internal.getMapId = function(pathWithOutSlash, layersKeys){
		var mapid;
		for(var i = 0;i < pathWithOutSlash.length; i++){
	  	if(layersKeys[pathWithOutSlash[i]]){
	  		mapid = pathWithOutSlash[i];
	  	}
	  }
	  return mapid;
	}

	Internal.getToken = function(layers, mapid){
		var token;
		for(var i = 0; i < layers.length; i++){
			if(layers[i].mapid == mapid){
				token = layers[i].token;
			}
		}
		return token;
	}

	Proxy.process = function(request, response) {

	  var path = request.path;  
	  var pathWithOutSlash = path.split('/'); 
	  var id = pathWithOutSlash[2];

	  layerFunction(id, function(layer){

		  var token = layer.token;
			var mapid = layer.mapid;
			var url = eetms + request.path;
		  var params = querystring.stringify(request.query);
		  var body = '';

		  if(request.param('url'))
		    url = request.param('url');
		  else
		    url += "?token=" + token;

		  url = url.replace(id,mapid);

		  console.log(url);
		  console.log('path', path);
		  var img = new Buffer([]);

		 	cache.get(path, function(data){
		 		
		 		if(data){	 				
	 				response.set('Content-Type', 'image/png');
					response.write(data, "binary");
					response.end(); 			

		 		}
		 		else{
		 			requester({
		  		uri: url
		  	, headers: {
		  			'Accept': request.headers['accept']
		  		,	'User-Agent': request.headers['user-agent']
		  		,	'X-Requested-With': request.headers['x-requested-with']
		  		,	'Accept-Language': request.headers['accept-language']
		  		,	'Accept-Encoding': request.headers['accept-encoding']
		  	}
			  }, function(error, proxyResponse, body) {
			  	
			  	if(error) {
			  		console.log('error',error);
			  		response.end();	
			  	} else {
			  		console.log('url',proxyResponse.statusCode, url);
			  	}

			  }).on('data', function(data) {    
				  var data = new Buffer(data);
				  img = Buffer.concat([img, data])
				})
				.on('end', function(data) {    
					cache.set(path, img)
				}).pipe(response)

		 	}
		
			});

		});

	}

	return Proxy;

}