module.exports = function (app) {

	var spatialIntelligence = app.controllers.spatialIntelligence;

	app.get('/spatial/metadata', spatialIntelligence.metadata);
	app.get('/spatial/query', spatialIntelligence.query, spatialIntelligence.translateQuery);
	app.get('/spatial/csv', spatialIntelligence.csv);

}