module.exports = function (app) {

	var timeSerie = app.controllers.timeSerie;
	app.get('/raster-series', timeSerie.data);
	
	
}