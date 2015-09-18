module.exports = function (app) {

	var timeSerie = app.controllers.timeSerie;
	
	
	app.get('/time-series/tree', timeSerie.tree);
	app.get('/time-series/:id',timeSerie.byId)
	app.get('/time-series/:id/values',timeSerie.data)
	
}