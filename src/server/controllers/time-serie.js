var 	ChildProcess = 	require('child_process')
		,	async = require('async')
		, unidecode = require('unidecode');;

module.exports = function(app) {

	var TimeSerie = {};
	var config = app.config;
	var rasterTimeSeries = app.libs.rasterTimeSeries;

	TimeSerie.data = function(request, response) {
		
	  	var lon = request.param('longitude');
	  	var lat = request.param('latitude');
	  	var id = request.param('id');
		
		var path ="python "+config.pathTimeSeries+" "+id+" "+lon+" "+lat+" "+config.pathPythonIni;

		console.log(path);
		
		ls = ChildProcess.exec(path, function (error, stdout, stderr) {
			
			console.log(stderr)	
				
				if(stderr) {
					console.log(stderr)
				}
				
		   	stdout=stdout.replace(/\'/g, '"');
		 	console.log(stdout)

		   	var result = JSON.parse(stdout);
		   	
		   	response.send(result);		   	
		   	response.end();

	 	});
		
	};

	TimeSerie.byId = function(request, response){

		var timeSeriesCollection = app.repository.collections.timeSeries;

		var id = request.param('id');

		timeSeriesCollection.findOne({_id : id}, function(err, timeSeries) {
			response.send(timeSeries);
			response.end()
		})
	};

	TimeSerie.tree = function(request, response) {
		
		var timeSeriesCollection = app.repository.collections.timeSeries;

		var projects = request.param('projects', '').toUpperCase().split(',')

		timeSeriesCollection.distinct('subject', { 'project': { $in: projects } }, function(err,subjects) {

			var result = [];
			console.log(projects)
			var interate = function(subject, next){
				var subjectObj = {
							text:subject,
							iconCls: 'task-folder'
					};

				timeSeriesCollection.find({ 'subject': subject, 'project': { $in: projects } }).toArray(function (err, timeSeries){
					
					var childrens = [];
					timeSeries.sort(function(a,b) {
						var aText = unidecode(a.name);
						var baText = unidecode(b.name);

						if(aText < baText) return -1;
				    if(aText > baText) return 1;
				    return 0;
					})

					for(i in timeSeries){
						var layer = timeSeries[i];
						var children = {
						     text: layer.name,
						     id: layer._id,
						     leaf:true,
						     iconCls:'task'
					 }

						childrens.push(children);
					}

					subjectObj['children'] = childrens;

					result.push(subjectObj);
					next();
				});

			}

			var finalize = function(){

				result.sort(function(a,b) {
					var aText = unidecode(a.text);
					var baText = unidecode(b.text);

					if(aText < baText) return -1;
			    if(aText > baText) return 1;
			    return 0;
				})

				response.send(result);
				response.end();
			}

			async.each(subjects, interate, finalize);

		});

	};
	
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