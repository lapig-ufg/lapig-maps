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
        console.log('TMS aqui!!', config.name)
        
        layerName = config.name
        recordType = GeoExt.data.LayerRecord.create([
            {name: "name", type: "string"},
            {name: "title", type: "string"}
        ]);

        xyzParams = "?layers=" + layerName
        + "&mode=tile&tile=${x}+${y}+${z}"
        + "&tilemode=gmap" 
        + "&map.imagetype=png"

        return new recordType({
            layer: new OpenLayers.Layer.XYZ(
                    layerName,
                    [
                        'http://o1.lapig.iesa.ufg.br/ows'+xyzParams,
                        'http://o2.lapig.iesa.ufg.br/ows'+xyzParams,
                        'http://o3.lapig.iesa.ufg.br/ows'+xyzParams,
                        'http://o4.lapig.iesa.ufg.br/ows'+xyzParams
                    ], 
                    {
                       
                    }
            ),
            title: layerName,
            name: layerName
        })

    }

    
});

Ext.preg(gxp.plugins.LapigTMSSource.prototype.ptype, gxp.plugins.LapigTMSSource);
