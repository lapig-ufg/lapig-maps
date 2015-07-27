/**
 * @require widgets/Viewer.js
 */
Ext.namespace("gxp");

gxp.LapigViewer = Ext.extend(gxp.Viewer, {
    
    addLayers: function() {
        var mapConfig = this.initialConfig.map;
        if(mapConfig && mapConfig.layers) {
            var conf, source, record, baseRecords = [], overlayRecords = [];
            for (var i=0; i<mapConfig.layers.length; ++i) {
                conf = mapConfig.layers[i];
                source = this.layerSources[conf.source];
                // source may not have loaded properly (failure handled elsewhere)
                if (source) {
                    record = source.createLayerRecord(conf);
                    if (record) {
                        if (record.get("group") === "background") {
                            baseRecords.push(record);
                        } else {
                            overlayRecords.push(record);
                        }
                    }
                } else if (window.console) {
                    console.warn("Non-existing source '" + conf.source + "' referenced in layer config.");
                } 
            }
            
            var panel = this.mapPanel;
            var map = panel.map;
            
            var records = baseRecords.concat(overlayRecords);
            if (records.length) {
                var baseRec = [];
                var markerRec = [];
                var wmsRec = [];

                var orderRec = [];

                records.forEach(function(rec) {
                    var layer = rec.data.layer;

                    if(layer instanceof OpenLayers.Layer.WMS)
                        wmsRec.push(rec)
                    else if(layer instanceof OpenLayers.Layer.Markers)
                        markerRec.push(rec)
                    else
                        baseRec.push(rec)
                    
                })
                
                baseRec.forEach(function(layer) {
                    orderRec.push(layer);
                })
                
                wmsRec.forEach(function(layer) {
                    orderRec.push(layer);
                })
                
                markerRec.forEach(function(layer) {
                    orderRec.push(layer);
                })

                panel.layers.add(orderRec);
            }
            
        }        
    }
    
});