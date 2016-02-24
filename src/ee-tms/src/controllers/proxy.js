var requester = require('request');
var querystring = require('querystring');

module.exports = function(app){
	var eetms = app.config.eeTms;	
	var Proxy = {};
	var layers = app.libs.init.layers;
	var Internal = {};


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

	Internal.getToken = function(mapid){
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
	  var layersKeys = Internal.layerMapIdObjectGenerator(layers);
	  var mapid = Internal.getMapId(pathWithOutSlash, layersKeys);
	  var token = Internal.getToken(mapid);
		var url = eetms + request.path;
	  var params = querystring.stringify(request.query);
	  


	  if(request.param('url'))
	    url = request.param('url');
	  else
	    url += "?token=" + token;
	  
	  console.log("path=",request.path)
	  console.log("params=",params)

	  console.log(url)

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
	  		console.log('aqui',proxyResponse.statusCode, url);
	  	}

	  })
	  .pipe(response)
	
	}

	return Proxy;

}

