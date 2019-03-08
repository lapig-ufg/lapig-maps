module.exports = function (app) {

	var ogcServer = app.controllers.ogcServer;
	
	app.get('/ows', ogcServer.ows);
	app.get('/sld/:filename', ogcServer.sld);

	app.get('/', function(req, res) { res.end(); });
}