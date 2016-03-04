module.exports = function (app) {

	var spatialIntelligence = app.controllers.spatialIntelligence;

	app.get('/spatial/:subject/metadata', spatialIntelligence.metadata, spatialIntelligence.translateMetadata);
	app.get('/spatial/:subject/query', spatialIntelligence.query, spatialIntelligence.translateQuery);
	app.get('/spatial/:subject/csv', spatialIntelligence.csv);

}