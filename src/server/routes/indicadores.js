module.exports = function (app) {

	var indicadores = app.controllers.indicadores;

	app.get('/indicadores/regions', indicadores.regions);
	app.get('/indicadores/lista', indicadores.lista, indicadores.translateLista);
	app.get('/indicadores/ranking', indicadores.ranking);
	app.get('/indicadores/csv', indicadores.csv);

}