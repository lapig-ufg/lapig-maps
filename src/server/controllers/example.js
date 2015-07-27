module.exports = function(app) {

	var Example = {};

	Example.test = function(request, response) {
	  
	  var layerCollection = app.repository.collections.layers;

		layerCollection.find({}).toArray(function(err, docs) {
				response.send(docs);
				response.end('Testando...');
		});

	};

	return Example;

}