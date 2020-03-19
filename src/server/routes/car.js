module.exports = function (app) {

	var car = app.controllers.car;

	app.get('/car/info', car.info);

}