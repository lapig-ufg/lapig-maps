var 	querystring = require('querystring')
	  ,	requester = require('request')
	  ,	zlib = require('zlib');
	  ;

module.exports = function(app) {
	
	var config = app.config;

	var Internal = {};
	var Proxy = {};

	Internal.doRequest = function(request, response, baseUrl) {

		var requestType = request.param('REQUEST');  
	  var url = baseUrl + request.path;
	  var params  = querystring.stringify(request.query);
	  
	  if(request.param('url'))
	    url = request.param('url');
	  else
	    url += '?'+params;

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

	Proxy.ows = function(request, response) {
		var baseUrl = config.ows;
		Internal.doRequest(request, response, baseUrl);
	}

	Proxy.tms = function(request, response) {
		var baseUrl = config.tms;
		Internal.doRequest(request, response, baseUrl);
	}
	return Proxy;
}