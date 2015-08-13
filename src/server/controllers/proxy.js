var querystring = require('querystring')
	  requester = require('request')
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


	  requester({
	  		uri: url
	  	,	timeout: config.timeout
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