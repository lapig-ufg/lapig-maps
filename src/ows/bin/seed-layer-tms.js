var t = require('tiles-in-bbox'),
		async = require('async'),
		request = require('request');
var bottom = -33.752081
var left = -73.990450
var top = 5.271841
var right = -28.835908
var layername = process.argv[2]
//var otherParams = "startyear=2000&endyear=2015"
var otherParams = ""
var multipleRequests = 10
//var bbox = { bottom : -33.752081, left : -73.990450, top : 5.271841, right : -28.835908 } //Brazil
var bbox = { bottom : -24.6846260, left : -60.1094198, top : -2.3262773, right : -41.5220189 } //Cerrado

var urls = []
for(var zoom=0; zoom <= 10; zoom++) {
	var tiles = t.tilesInBbox(bbox, zoom)

	tiles.forEach(function(tile) {
		var url = "http://ows.lapig.iesa.ufg.br/ows"
							+ "?layers=" + layername
							+ "&mode=tile"
							+ "&tilemode=gmap"
							+ "&map.imagetype=png"
							+ "&tile=" + [tile.x, tile.y, tile.z].join('+')
							+ "&" + otherParams

		urls.push(url)
	})
}

var requests = []

urls.forEach(function(url) {
	requests.push(function(next) {
		console.log("Caching " + url)
		request(url, function (error, response, body) {
			next()
		});
	});
})

async.parallelLimit(requests, multipleRequests)
