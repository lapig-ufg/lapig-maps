module.exports = function (app) {

	var proxy = app.controllers.proxy;

	app.get('/ows*', proxy.ows);
	app.post('/ows*', proxy.ows);

}