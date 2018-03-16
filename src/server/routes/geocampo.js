module.exports = function (app) {

	var geocampo = app.controllers.geocampo;

	app.get('/geocampo/pontos', geocampo.pontos);
}