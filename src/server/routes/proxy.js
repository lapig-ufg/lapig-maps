module.exports = function (app) {

	var proxy = app.controllers.proxy;

	app.get('/ows*', proxy.ows);
	app.post('/ows*', proxy.ows);
	
	app.get('/tms*', proxy.tms);
	app.post('/tms*', proxy.tms);

	app.get('/map*', proxy.tms);
	app.post('/map*', proxy.tms);
}