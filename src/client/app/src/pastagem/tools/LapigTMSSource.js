/**
 * @requires plugins/LayerSource.js
 * @requires OpenLayers/Layer/TMS.js
 * @requires OpenLayers/Format/TMSCapabilities.js
 * @requires plugins/TMSSource.js
 */

Ext.ns('gxp.data', 'gxp.plugins');

gxp.plugins.LapigTMSSource = Ext.extend(gxp.plugins.LayerSource, {
    
    ptype: "gxp_lapigtmssource",

    constructor: function(config) {
        gxp.plugins.LayerSource.superclass.constructor.apply(this, arguments);
    },
    
    createLayerRecord: function(config, callback, scope) {
        
        layerID = config.name
        layerName = config.oldName

        Record = GeoExt.data.LayerRecord.create([
            {name: "name", type: "string"},
            {name: "title", type: "string"},
            {name: "_id", type: "string"},
            {name: "last_date", type: "string"},
            {name: "type", type: "string"},
            {name: "source", type: "string"},
            {name: "epsgCode", type: "string"},
            {name: "extent", type: "string"},
            {name: "scale", type: "string"},
            {name: "year", type: "string"}

        ]);

        xyzParams = "?layers=" + layerID
        + "&mode=tile&tile=${x}+${y}+${z}"
        + "&tilemode=gmap" 
        + "&map.imagetype=png"

        var data = {
            layer: new OpenLayers.Layer.XYZ(
                    layerName,
                    [
                        /*'http://o1.lapig.iesa.ufg.br/ows'+xyzParams,
                        'http://o2.lapig.iesa.ufg.br/ows'+xyzParams,
                        'http://o3.lapig.iesa.ufg.br/ows'+xyzParams,
                        'http://o4.lapig.iesa.ufg.br/ows'+xyzParams*/
                        'http://200.137.217.158:5501/ows'+xyzParams
                    ], 
                    {
                       sphericalMercator: false,
                       projection: new OpenLayers.Projection('EPSG:900913'),
                       isLapigLayer: true,
                       extent: new OpenLayers.Bounds.fromArray(config.extent).transform("EPSG:4326", "EPSG:900913"),
                       visibility: config.visibility
                    }
            ),
            legendUrl:'http://200.137.217.158:5501/ows?TRANSPARENT=TRUE&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&LAYER='+layerID+'&format=image%2Fpng',
            name: layerID
        }

        var record = new Record(data, layerID)
        record.json = config;

       return record
    }

    
});

Ext.preg(gxp.plugins.LapigTMSSource.prototype.ptype, gxp.plugins.LapigTMSSource);
