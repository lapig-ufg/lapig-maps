module.exports = function (app) {

	var spatialIntelligence = app.controllers.spatialIntelligence;

	app.get('/spatial/:subject/query', spatialIntelligence.query);

}