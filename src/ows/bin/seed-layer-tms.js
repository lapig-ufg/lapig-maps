var t = require('tiles-in-bbox')

var bottom = -33.752081
var left = -73.990450
var top = 5.271841
var right = -28.835908
var layername = "fip_municipios_desmatamento"
var otherParams = "startyear=2000&endyear=2015"

var bbox = {
    bottom : -33.752081,
    left : -73.990450,
    top : 5.271841,
    right : -28.835908,
}

var urls = []
for(var zoom=0; zoom <= 7; zoom++) {
	var tiles = t.tilesInBbox(bbox, zoom)

	tiles.forEach(function(tile) {
		var url = "http://maps.lapig.iesa.ufg.br/ows"
							+ "?layers=" + layername
							+ "&mode=tile"
							+ "&tilemode=gmap"
							+ "&map.imagetype=png"
							+ "&tile=" + [tile.x, tile.y, tile.z].join('+')
							+ "&" + otherParams

		urls.push(url)
	})
}
console.log(urls)
