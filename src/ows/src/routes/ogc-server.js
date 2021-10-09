module.exports = function (app) {

	const ogcServer = app.controllers.ogcServer;

	const filterUrl = async function (request, response,  next) {
		try {
		    const params = request.query; 

		    if ('OUTPUTFORMAT' in params){

			if(params.TYPENAME === 'pasture_quality' && params.OUTPUTFORMAT === 'shape-zip') {
				response.status(403).json({ ok: false, message: 'resource not allowed' });
			} else {
				next()
			}

		    } else {
			next()
		    }

		}catch (e) {
		    console.error(e)
		    response.status(400).json({ auth: false, message: 'Failed to proccess your resquest!' });
		}
	}

	app.get('/ows', ogcServer.ows);
	app.get('/sld/:filename', ogcServer.sld);

	app.get('/', function(req, res) { res.end(); });
}
