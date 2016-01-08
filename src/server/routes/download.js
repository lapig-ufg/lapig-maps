module.exports = function (app) {

	var download = app.controllers.download;

	app.get('/download/:id/all', download.allLayers);

}