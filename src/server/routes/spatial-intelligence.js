module.exports = function (app) {

	var spatialIntelligence = app.controllers.spatialIntelligence;

	app.get('/spatial/metadata', spatialIntelligence.metadata);
	app.get('/spatial/query', spatialIntelligence.query);
	app.get('/spatial/csv', spatialIntelligence.csv);

}