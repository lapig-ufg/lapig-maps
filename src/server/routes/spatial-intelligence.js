module.exports = function (app) {

	var spatialIntelligence = app.controllers.spatialIntelligence;

	app.get('/spatial/:subject/metadata', spatialIntelligence.metadata);
	app.get('/spatial/:subject/query', spatialIntelligence.query);
	app.get('/spatial/:subject/csv', spatialIntelligence.csv);

}