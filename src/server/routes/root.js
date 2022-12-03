module.exports = function (app) {

	app.get('/', function(req, res) {
		response.send({ "server": "LAPIG-MAPS Server API", "ststus": "runing"});
		res.end();
	});

}
