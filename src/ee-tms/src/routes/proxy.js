module.exports = function (app) {

	var proxy = app.controllers.proxy;
	
	app.get('/map*', proxy.process);
}