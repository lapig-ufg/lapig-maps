module.exports = function (app) {

	var print = app.controllers.print;

	app.get('/print', print.map);
	app.get('/print/pdf', print.mapPdf);
		
}