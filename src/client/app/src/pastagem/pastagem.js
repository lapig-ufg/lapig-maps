/**
 * @require tools/LapigViewer.js
 */

var zoomLevel = 4;
var center = [-45, -15];
var project = [ 'pastagem.org'];
var layers = [ 'pa_br_areas_pastagens_250_2016_lapig', 'pa_br_estados_250_2013_ibge', '' ];
new gxp.LapigViewer(layers, center[0], center[1], zoomLevel, project);