module.exports = function (app) {

	app.get('/', function(req, res) {
		res.send({ "server": "LAPIG-MAPS Server API", "ststus": "runing"});
		res.end();
	});

}
