var 	querystring = require('querystring')
	  ,	requester = require('request')
	  ,	zlib = require('zlib');
	  ;

module.exports = function(app) {
	
	var config = app.config;

	var Proxy = {};

	Proxy.ows = function(request, response) {

		var requestType = request.param('REQUEST');  

	  var url     = config.ows + request.path;
	  var params  = querystring.stringify(request.query);
	  
	  if(request.param('url'))
	    url = request.param('url');
	  else
	    url += '?'+params;

	  console.log({
	  			'Accept': request.headers['accept']
	  		,	'User-Agent': request.headers['user-agent']
	  		,	'X-Requested-With': request.headers['x-requested-with']
	  		,	'Accept-Language': request.headers['accept-language']
	  		,	'Accept-Encoding': request.headers['accept-encoding']
	  	});

	  requester({
	  		uri: url
	  	,	timeout: config.timeout
	  	, headers: {
	  			'Accept': request.headers['accept']
	  		,	'User-Agent': request.headers['user-agent']
	  		,	'X-Requested-With': request.headers['x-requested-with']
	  		,	'Accept-Language': request.headers['accept-language']
	  		,	'Accept-Encoding': request.headers['accept-encoding']
	  	}
	  }, function(error, proxyResponse, body) {
	  	
	  	if(error) {
	  		console.log(error);
	  		response.end();	
	  	} else {
	  		console.log(proxyResponse.statusCode, url);
	  	}

	  })
	  .pipe(response)

	}

	return Proxy;
}