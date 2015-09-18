module.exports = function (app) {

	var example = app.controllers.example;

	app.get('/example', example.test);
	app.post('/grid/teste', example.grid);

}