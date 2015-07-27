module.exports = function(app) {

	var Utils = {};

	Utils.printf = function(str, params) {
	  for(var i in params)
	    str = str.replace('{'+i+"}", params[i]);
	  
	  return str;
	};

	return Utils;
	
}; 