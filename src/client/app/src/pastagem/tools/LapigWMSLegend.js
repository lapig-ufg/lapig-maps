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
 * @requires GeoExt/widgets/WMSLegend.js
 */

 Ext.namespace('GeoExt');

 GeoExt.LapigWMSLegend = Ext.extend(GeoExt.WMSLegend, {

		getLegendUrl: function(layerName, layerNames) {
        var rec = this.layerRecord;
        return rec.get("legendUrl");
    },

    update: function() {
        var layer = this.layerRecord.getLayer();
        // In some cases, this update function is called on a layer
        // that has just been removed, see ticket #238.
        // The following check bypass the update if map is not set.
        if(!(layer && layer.map)) {
            return;
        }
        GeoExt.LapigWMSLegend.superclass.update.apply(this, arguments);
        
        var layerNames, layerName, i, len;

        //layerNames = [layer.params.LAYERS].join(",").split(",");
        layerNames = [this.layerRecord.json.name]

        var destroyList = [];
        var textCmp = this.items.get(0);
        this.items.each(function(cmp) {
            i = layerNames.indexOf(cmp.itemId);
            if(i < 0 && cmp != textCmp) {
                destroyList.push(cmp);
            } else if(cmp !== textCmp){
                layerName = layerNames[i];
                var newUrl = this.getLegendUrl(layerName, layerNames);
                if(!OpenLayers.Util.isEquivalentUrl(newUrl, cmp.url)) {
                    cmp.setUrl(newUrl);
                }
            }
        }, this);
        for(i = 0, len = destroyList.length; i<len; i++) {
            var cmp = destroyList[i];
            // cmp.destroy() does not remove the cmp from
            // its parent container!
            this.remove(cmp);
            cmp.destroy();
        }

        for(i = 0, len = layerNames.length; i<len; i++) {
            layerName = layerNames[i];
            if(!this.items || !this.getComponent(layerName)) {
                this.add({
                    xtype: "gx_legendimage",
                    url: this.getLegendUrl(layerName, layerNames),
                    itemId: layerName
                });
            }
        }
        this.doLayout();
    }

});

Ext.reg('gx_lapigwmslegend', GeoExt.LapigWMSLegend);