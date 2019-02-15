/**
 * @require tools/LapigViewer.js
 */

var zoomLevel = 4;
var center = [-45, -15];
var project = [ 'lapig', 'pastagem.org' ];
var layers = [ "pa_br_bioma_5000_2004_ibge"];
new gxp.LapigViewer(layers, center[0], center[1], zoomLevel, project);