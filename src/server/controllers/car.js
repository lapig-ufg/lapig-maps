const { Pool, Client } = require('pg')

module.exports = function(app) {

	var databaseConf = app.config.database
	var Contoller = {};

	pool = new Pool(databaseConf.connectionParams)
	
	Contoller.info = function(request, response) {
		lon = request.param('lon','-42')
		lat = request.param('lat','-35')
		query = request.param('query','geo_car_imovel')

		var sqlQuery = databaseConf.queries[query]

		pool.query(sqlQuery, [lon, lat], (err, query_result) => {
		  
			features = []

			for(var i=0; i < query_result.rows.length; i++) {
				
				geometry = JSON.parse(query_result.rows[i].geojson)
				delete query_result.rows[i].geojson

				features.push({
					"type": "Feature",
					 "geometry": geometry,
					 "properties": query_result.rows[i]

				})
				
			}

		  response.send({
  			"type": "FeatureCollection",
  			"features": features
  		})

			response.end()

		})

	}

	return Contoller;

}
