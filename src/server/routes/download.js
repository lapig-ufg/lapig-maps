module.exports = function (app) {

	var download = app.controllers.download;

	app.post('/download/time-series', download.requestAllLayer);

}