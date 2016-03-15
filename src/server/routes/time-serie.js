module.exports = function (app) {

	var timeSerie = app.controllers.timeSerie;
	
	
	app.get('/time-series/tree', timeSerie.tree, timeSerie.translateTree);
	app.get('/time-series/:id',timeSerie.byId, timeSerie.translateById)
	app.get('/time-series/:id/values',timeSerie.data)
	
	app.get('/time-series/:id/csv',timeSerie.csv)
	
}