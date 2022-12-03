module.exports = function (app) {

	app.get('/', function(req, res) {
		res.send({ "server": "LAPIG-MAPS Server API", "status": "running"});
		res.end();
	});

}
