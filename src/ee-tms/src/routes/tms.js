module.exports = function (app) {

	var tms = app.controllers.tms;
	
	app.get('/tms', tms.process);
	app.get('/', function(req, res) { res.end(); });
}