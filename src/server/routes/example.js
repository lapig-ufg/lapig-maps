module.exports = function (app) {

	var example = app.controllers.example;

	app.get('/example', example.test);

}