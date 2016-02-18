module.exports = function (app) {

	var layer = app.controllers.layer;

	app.get('/layers/tree', layer.tree, layer.translate);
	app.post('/layers/search', layer.search);
	app.get('/layers/attributes', layer.attributes);
	
	app.get('/layers/years/:id',layer.getYears);
	app.get('/layers/:id',layer.byId)
	app.post('/layers',layer.byBasepaths)

}