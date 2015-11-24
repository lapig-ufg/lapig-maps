var 	ChildProcess = 	require('child_process')
		,	async = require('async')
		, unidecode = require('unidecode')
		,	csvWriter = require('csv-write-stream');

module.exports = function(app) {

	var TimeSerie = {};
	var Internal = {};

	var cache = app.libs.cache;
	var config = app.config;

	Internal.getCacheKey = function(id, longitude, latitude, callback) {
		return [id, longitude, latitude].join(',');
	}

	Internal.getTimeSeries = function(id, longitude, latitude, callback) {
		var cacheKey = Internal.getCacheKey(id, longitude, latitude);

  	cache.get(cacheKey, function(result) {
  		if(result) {
  			callback(result)
  		} else {
				Internal.requestTimeSeries(id, longitude, latitude, function(result) {
					cache.set(cacheKey, result);
					callback(result)
				});
  		}
  	});
	}

	Internal.requestTimeSeries = function(id, longitude, latitude, callback) {
		
		var params = id + " " + longitude + " " + latitude;
		var cmd ="python " + config.pathTimeSeries + " " + params;
		
		console.log(cmd);

		ChildProcess.exec(cmd, function (error, stdout, stderr) {
				
			if(stderr)
				console.log(stderr)
			
	   	stdout=stdout.replace(/\'/g, '"');
	 		console.log(stdout);

	   	var result = JSON.parse(stdout);
	   	
	   	callback(result);
	   	
	 	});

	}

	TimeSerie.data = function(request, response) {
		
  	var id = request.param('id');
  	var latitude = request.param('latitude');
  	var longitude = request.param('longitude');
		
		Internal.getTimeSeries(id, longitude, latitude, function(result) {
	  	response.send(result);
	  	response.end();
		})

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
	
	TimeSerie.csv = function(request, response) {
		var id = request.param('id');
  	var latitude = request.param('latitude');
  	var longitude = request.param('longitude');
		
		Internal.getTimeSeries(id, longitude, latitude, function(result) {

			var filename = ('time-series-' + id).toLowerCase();

			response.set('Content-Type', 'text/csv');
	  	response.set('Content-Disposition', 'attachment;filename=' + filename + '.csv');

	  	var headers = ['Data']

	  	result.series.forEach(function(serie) {
	  		headers.push(serie.label)
	  	});

	  	headers.push('Longitude')
	  	headers.push('Latitude')
	  	
	  	var writer = csvWriter({
			  separator: ';',
			  newline: '\n',
			  headers: headers,
			  sendHeaders: true
			});

	  	writer.pipe(response, { end: false })

	  	result.values.forEach(function(value) {
	  		value.push(longitude);
	  		value.push(latitude);
	  		for(var i=0; i < value.length; i++) {
	  			if (String(value[i]).indexOf('.') > 0) {
	  				value[i] = String(value[i]).replace('.', ',');
	  			}
	  		}
	  		console.log(value)
	  		writer.write(value)
	  	})

			writer.on('end', function() {
				response.end();
			})

			writer.end();
		})

	}
	
	return TimeSerie;
}