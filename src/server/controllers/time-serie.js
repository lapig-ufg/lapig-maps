module.exports = function(app) {

	var TimeSerie = {};
	var rasterTimeSeries = app.libs.rasterTimeSeries;

	TimeSerie.chart = function(request, response) {
  
	  response.connection.setTimeout(0);

	  var lineLayer = request. param('lineLayer', '');
	  var barLayer = request. param('barLayer', '');
	  var lat = request. param('lat', -16.4804);
	  var lon = request. param('lon', -48.8232);

	  var result = {
	      bar: {},
	      line: {},
	      value: {}
	  };
	  var data = {};

	  rasterTimeSeries.pixelValue(lineLayer, lat, lon, function(lineResult) {
	    rasterTimeSeries.pixelValue(barLayer, lat, lon, function(barResult) {

	      if(lineResult) {

	        result.line = {
	          key: lineResult.key,
	          name: lineResult.name
	        };

	        for (var strDate in lineResult.values) {
	            var name = lineResult.name;

	            if(!result.value[strDate])
	              result.value[strDate] = { lon: lon, lat: lat, strDate: strDate};

	            result.value[strDate].date = lineResult.values[strDate][0];
	            result.value[strDate][name] = lineResult.values[strDate][1];
	        }

	      }

	      if(barResult) {

	        result.bar = {
	          key: barResult.key,
	          name: barResult.name
	        };

	        for (var strDate in barResult.values) {
	            var name = barResult.name;

	            if(!result.value[strDate])
	              result.value[strDate] = { lon: lon, lat: lat, strDate: strDate};

	            result.value[strDate].date = barResult.values[strDate][0];
	            result.value[strDate][name] = barResult.values[strDate][1];
	        }
	      }

	      var valuesArray = [];
	      for (var i in result.value)
	        valuesArray.push(result.value[i]);

	      valuesArray.sort(function(a, b ){
	        return a.date - b.date;
	      });

	      result.value = valuesArray;

	      response.render('chart-page.ejs', { resultado: result });

	    });
	  });

	};

	return TimeSerie;
}