var requester = require('request');
var querystring = require('querystring');

module.exports = function(app){
	var eetms = app.config.eeTms;	
	var Proxy = {};
	var layers = app.libs.init.layers;
	var Internal = {};


	Internal.layerMapIdObjectGenerator = function(layers){
		var layerMapIdObject = {};

		console.log(layers)

		for(var i = 0; i < layers.length; i++){
			layerMapIdObject[layers[i].mapid] = true;
		}

		console.log(layerMapIdObject);

		return layerMapIdObject;

	}



	Proxy.process = function(request, response) {

	  var path = request.path;
	  
	  pathWithoutSlash = path.split('/');
	  console.log(path);
	  var x=Internal.layerMapIdObjectGenerator(layers);


	  
	  for(var i = 0; i<pathWithoutSlash.length; i++){
	  	console.log('aqui', path+"/?token="+x[i]);
	  	if(path[x[i]]){
				var path2 = path+"/token="+x[i];
				console.log(path2);
	  	}
	  }
	  

		
		var url = eetms + request.path;
	  var params = querystring.stringify(request.query);


	  


	  if(request.param('url'))
	    url = request.param('url');
	  else
	    url += '?'+params;
	  
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

