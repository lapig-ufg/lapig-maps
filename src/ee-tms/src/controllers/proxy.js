var requester = require('request');
var querystring = require('querystring');

module.exports = function(app){
	var eetms = app.config.eeTms;	
	var Proxy = {};

	Proxy.process = function(request, response) {
		
		var url = eetms + request.path;
	  var params  = querystring.stringify(request.query);
	  
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


