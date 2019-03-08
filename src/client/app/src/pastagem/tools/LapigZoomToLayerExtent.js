/**
 * @requires util.js
 * @requires plugins/LayerSource.js
 * @requires OpenLayers/Layer/WMS.js
 * @requires OpenLayers/Format/WMSCapabilities/v1_1_0.js
 * @requires OpenLayers/Format/WMSCapabilities/v1_1_1.js
 * @requires OpenLayers/Format/WMSCapabilities/v1_3_0.js
 * @requires OpenLayers/Protocol/WFS/v1_1_0.js
 * @requires GeoExt/data/WMSCapabilitiesReader.js
 * @requires GeoExt/data/WMSCapabilitiesStore.js
 * @requires GeoExt/data/WMSDescribeLayerStore.js
 * @requires GeoExt/data/AttributeReader.js
 * @requires GeoExt/data/AttributeStore.js
 * @require plugins/ZoomToLayerExtent.js
 */

Ext.namespace("gxp.plugins");

gxp.plugins.LapigZoomToLayerExtent = Ext.extend(gxp.plugins.ZoomToLayerExtent, {

	ptype: "gxp_lapigzoomtolayerextent",

	extent: function() {
    var layer = this.selectedRecord.getLayer(),
        dataExtent;
    if (OpenLayers.Layer.Vector) {
        dataExtent = layer instanceof OpenLayers.Layer.Vector &&
            layer.getDataExtent();
    }
    return layer.restrictedExtent || dataExtent || layer.extent;
    }
});

Ext.preg(gxp.plugins.LapigZoomToLayerExtent.prototype.ptype, gxp.plugins.LapigZoomToLayerExtent);