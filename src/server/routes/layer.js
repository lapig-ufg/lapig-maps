module.exports = function (app) {

	var layer = app.controllers.layer;

	app.get('/layers/treeSubjects', layer.treeSubjects, layer.translateTree);
	app.get('/layers/treeRegions', layer.treeRegions, layer.translateTree);
	app.post('/layers/search', layer.search, layer.translateSearch);
	app.get('/layers/attributes', layer.attributes);
	
	app.get('/layers/years/:id',layer.getYears);
	app.get('/layers/:id',layer.byId, layer.translateById)
	app.post('/layers',layer.byBasepaths, layer.translateByBasepaths)

}