/**
 * @require tools/LapigViewer.js
 */

var zoomLevel = 4;
var center = [-45, -15];
var project = [ 'pastagem.org'];
var layers = [ 'bi_ce_alertas_desmatamento_500_2014_lapig' ];
new gxp.LapigViewer(layers, center[0], center[1], zoomLevel, project);