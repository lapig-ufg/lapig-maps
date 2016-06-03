var 	ChildProcess = 	require('child_process')
		,	async = require('async')
		, unidecode = require('unidecode')
		,	csvWriter = require('csv-write-stream');

module.exports = function(app) {

	var TimeSerie = {};
	var Internal = {};

	var config = app.config;
	var translateEN = require(config.langDir + '/Time-Series_en.json');

	Internal.getCircleCoords = function(longitude, latitude, radius){
		var lon = 0;
		var lat = 0;
		var numPoints = 20;
		var theta = 350.00 / numPoints;

		//Considera a terra uma esfera perfeita
		var radiusDegrees = (0.00001 * radius)/1.1132;
		var coords = [];
		for (var i = 0; i < numPoints; i++) {

		    // calc x/y
		    lon = radiusDegrees * Math.cos(2*Math.PI*i/numPoints + theta) + parseInt(longitude);
		    lat = radiusDegrees * Math.sin(2*Math.PI*i/numPoints + theta) + parseInt(latitude);

		    coords[i] = [lon, lat];
		}

		return coords;
	}

	Internal.createGeoJson = function(longitude, latitude, radius){
		var geoJsonGeometry = "{";
		if(radius != undefined && radius > 0){
			var coords = Internal.getCircleCoords(longitude, latitude, radius);

			geoJsonGeometry += '"type": "Polygon",';
			geoJsonGeometry += '"coordinates": [[';
			geoJsonGeometry += '['+coords.join('],[')+']';
			geoJsonGeometry += ',['+coords[0]+']'
			geoJsonGeometry += ']';
		}else{
			geoJsonGeometry += '"type": "Point",';
			geoJsonGeometry += '"coordinates": [';
			geoJsonGeometry += longitude + ',' + latitude;
		}

		geoJsonGeometry+= ']}';
		
		return geoJsonGeometry;
	}

	Internal.requestTimeSeries = function(id, longitude, latitude, mode, radius, callback) {
		var geoJsonGeometry = Internal.createGeoJson(longitude, latitude, radius);

		var pythonEnv = "export PYTHON_ENV=" + process.env.NODE_ENV;

		var params = "TS " + id +" "+ mode +" '"+ geoJsonGeometry + "'";
		var cmd = pythonEnv + ";python " +"'"+ config.pathTimeSeries +"'"+" " + params;

		console.log(cmd)

		ChildProcess.exec(cmd, function (error, stdout, stderr) {
				
			if(stderr){
				console.log(stderr)
			}

	   	stdout=stdout.replace(/\'/g, '"');

	   	var result = JSON.parse(stdout);
	   	
	   	callback(result);
	 	});
	}

	Internal.requestTrend = function (bfastParams, callback) {
		// bfastParams[1]==longitude; bfastParams[2]==latitude; bfastParams[9]==radius;
		var geoJsonGeometry = Internal.createGeoJson(bfastParams[1], bfastParams[2], bfastParams[9]);

		// remove as coordenadas e o raio dos parâmetros, pois estes são substituidos pelo GeoJson
		bfastParams.splice(0, 3, bfastParams[0]);
		bfastParams.pop();
		
		var pythonEnv = "export PYTHON_ENV=" + process.env.NODE_ENV;
		
		var params = "BFAST " + bfastParams.join(" ") +" '"+ geoJsonGeometry + "'";
		var cmd = pythonEnv + "python " +"'"+ config.pathTimeSeries +"'"+ " " + params;

		console.log(cmd)

		ChildProcess.exec(cmd, function (error, stdout, stderr){
			if(stderr){
				if(stderr.indexOf("minimum segment size error") == -1){
					console.log(stderr)
				}else{
					callback({
						error: 'Tempo em que ocorre mudanças deve ser menor que metade da série temporal.'
					});
					return;
				}
			}

			stdout = stdout.replace(/\'/g, '"');
			console.log(stdout);

			var result = JSON.parse(stdout);

			callback(result);
		});
	}

	TimeSerie.data = function(request, response) {
		
  	var id = request.param('id');
  	var latitude = request.param('latitude');
  	var longitude = request.param('longitude');
  	var mode = request.param('mode');
  	var radius = request.param('radius');

		Internal.requestTimeSeries(id, longitude, latitude, mode, radius, function(result) {
	  		response.send(result);
	  		response.end();
		})
	};

	TimeSerie.trend = function(request, response){

		var bfastParams = [];
		bfastParams.push(request.param('id'));
  	bfastParams.push(request.param('longitude'));
		bfastParams.push(request.param('latitude'));
  	bfastParams.push(request.param('startYear'));
    bfastParams.push(request.param('endYear'));
    bfastParams.push(request.param('interpolation'));
    bfastParams.push(request.param('groupData'));
    bfastParams.push(request.param('timeChange'));
    bfastParams.push(request.param('timeChangeUnits'));
    bfastParams.push(request.param('radius'));

    Internal.requestTrend(bfastParams, function(result){
    	response.send(result);
			response.end();
    });
	};

	TimeSerie.byId = function(request, response, next){

		var timeSeriesCollection = app.repository.collections.timeSeries;

		var id = request.param('id');

		timeSeriesCollection.findOne({_id : id}, function(err, timeSeries) {
			request.finalizeResultById = timeSeries;
			next();
		})
	};

	TimeSerie.tree = function(request, response, next) {
		
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

				request.finalizeResultTree = result;
				next();
			}

			async.each(subjects, interate, finalize);

		});
	};
	
	TimeSerie.csv = function(request, response) {
		var id = request.param('id');
  	var latitude = request.param('latitude');
  	var longitude = request.param('longitude');
  	var mode = request.param('mode');
		
  	var callback = function(result) {

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
		}

		if (mode == 'series') {
	  	var radius = request.param('radius')
			Internal.requestTimeSeries(id, longitude, latitude, mode, radius, callback);
		} else if(mode == 'trend'){
			var bfastParams = [];
			bfastParams.push(id);
	  	bfastParams.push(longitude);
			bfastParams.push(latitude);
	  	bfastParams.push(request.param('startYear'));
	    bfastParams.push(request.param('endYear'));
	    bfastParams.push(request.param('interpolation'));
	    bfastParams.push(request.param('groupData'));
	    bfastParams.push(request.param('timeChange'));
	    bfastParams.push(request.param('timeChangeUnits'));
	    bfastParams.push(request.param('radius'));

			Internal.requestTrend(bfastParams, callback);
		}
	}

	TimeSerie.translateTree = function(request, response){
		if (response){
				var result = request.finalizeResultTree;
				var language = response.req.query.lang;

				if(language != 'pt-br'){
						result.forEach(function(layer) {
								nameCat = layer.text;
								categoriaEn = translateEN.subjects[nameCat];
								layer.text = categoriaEn;

								for(i=0; i<layer.children.length; i++){
										idLayer = layer.children[i].id;
										nameEn = translateEN.layers[idLayer];

										if (translateEN.layers[idLayer] != undefined){
												layer.children[i].text = nameEn.name
										}
								}
						})
				}

				response.send(result);
				response.end();
		}
	}

	TimeSerie.translateById = function(request,response){
			if(response){
					var result = request.finalizeResultById
					var language = request.param('lang')

					if(language !='pt-br'){
							idLayer = result._id;
							translateNameDesc = translateEN.layers[idLayer];
							
							result.name = translateNameDesc.name;
							result.description = translateNameDesc.description;
							result.date = result.date.replace("Atualmente", "Currently")

							if (result.pixelMeasure=='Não se aplica')
									result.pixelMeasure = 'Not applicable'
							else if(result.pixelMeasure=='mm de água')
									result.pixelMeasure = 'mm of water'
					}

					response.send(result);
					response.end();
			}
	}
	
	return TimeSerie;
}