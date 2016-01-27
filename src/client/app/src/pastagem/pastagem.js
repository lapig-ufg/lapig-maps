/**
 * @require tools/LapigViewer.js
 */

var zoomLevel = 4;
var center = [-45, -15];
var project = [ 'pastagem.org'];
var layers = [ 'pa_br_pastagem_ni_2006_ibge', 'pa_br_estados_250_2013_ibge', 'pa_br_matadouros_e_frigorificos_na_2014_lapig' ];
new gxp.LapigViewer(layers, center[0], center[1], zoomLevel, project);