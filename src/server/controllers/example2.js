module.exports = function(app) {

	var Example = {};

	Example.test = function(request, response) {
	  	
	  	//função de acesso ao banco de dados;
		//var layerCollection = app.repository.collections.layers;
		var childProcess = require('child_process'), ls;
	  	
	  	//var lon = request.param('longitude');
		var lon = "longitude";
	  	//var lat = request.param('latitude');
		var lat = "latitude";
	  	//var col = request.param('collection');
		var coll = "coleção";

		//exemplo de coordenadas no pastagem, fazer testes com argumentos diferentes nos textados abaixo.
		
		ls = childProcess.exec('python /home/jose/Documentos/github/lapig-maps/src/server/integration/py/TimeSeriesEE.py LANDSAT5_NDVI -49.87 -17.15', function (error, stdout, stderr) {
			if (error) {
		     	console.log(error.stack);
		     	console.log('Error code: '+error.code);
		     	console.log('Signal received: '+error.signal);
		   	}
		   	console.log('Child Process STDOUT: '+stdout);
		   	console.log('Child Process STDERR: '+stderr);
		   	stdout=stdout.replace(/\'/g, '"');
		   	var result = JSON.parse(stdout)
		   	response.send(result)
		   	response.end()
	 	});

		/**
		bloco de acesso ao banco de dados.
		layerCollection.find({}).toArray(function(err, docs) {
				//response.send(docs);
				response.end(coll+","+lat+","+lon);
		});
		contrução do gráfico será com a resposta da requisição(js)
		**/

	};

	return Example;

}
