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
 * @require plugins/WMSCSource.js
 */

Ext.namespace("gxp.plugins");

gxp.plugins.LapigWMSCSource = Ext.extend(gxp.plugins.WMSCSource, {
    
    ptype: "gxp_lapigwmscsource",

    constructor: function(config) {
        /*config.url = [
                'm1.lapig.iesa.ufg.br'
            ,   'm2.lapig.iesa.ufg.br'
            ,   'm3.lapig.iesa.ufg.br'
            ,   'm4.lapig.iesa.ufg.br'
        ];*/
        gxp.plugins.WMSCSource.superclass.constructor.apply(this, arguments);
    },

    createLayerRecord: function(config) {
        var record, original;
        
        var index = this.store.findExact("name", config.name);

        if (index > -1) {
            original = this.store.getAt(index);
        } else if (Ext.isObject(config.capability)) {
            original = this.store.reader.readRecords({capability: {
                request: {getmap: {href: this.trimUrl(this.url, this.baseParams)}},
                layers: [config.capability]}
            }).records[0];
        } else if (this.layerConfigComplete(config)) {
            original = this.createLazyLayerRecord(config);
        }
        if (original) {

            var layer = original.getLayer().clone();

            /**
             * TODO: The WMSCapabilitiesReader should allow for creation
             * of layers in different SRS.
             */
            var projection = this.getMapProjection();
            
            // If the layer is not available in the map projection, find a
            // compatible projection that equals the map projection. This helps
            // us in dealing with the different EPSG codes for web mercator.
            var layerProjection = this.getProjection(original);
            if (layerProjection) {
                layer.addOptions({projection: layerProjection});
            }

            var projCode = (layerProjection || projection).getCode(),
                bbox = original.get("bbox"), maxExtent;

            // determine maxExtent in map projection
            if (bbox && bbox[projCode]){
                maxExtent = OpenLayers.Bounds.fromArray(bbox[projCode].bbox, layer.reverseAxisOrder());
            } else {
                var llbbox = original.get("llbbox");
                if (llbbox) {
                    llbbox[0] = Math.max(llbbox[0], -180);
                    llbbox[1] = Math.max(llbbox[1], -90);
                    llbbox[2] = Math.min(llbbox[2], 180);
                    llbbox[3] = Math.min(llbbox[3], 90);
                    maxExtent = OpenLayers.Bounds.fromArray(llbbox).transform("EPSG:4326", projection);
                }
            }
            
            // update params from config
            layer.mergeNewParams({
                STYLES: config.styles,
                FORMAT: config.format,
                TRANSPARENT: config.transparent,
                CQL_FILTER: config.cql_filter,
                FILTER: config.filter
            });
            
            var singleTile = false;
            if ("tiled" in config) {
                singleTile = !config.tiled;
            } else {
                // for now, if layer has a time dimension, use single tile
                if (original.data.dimensions && original.data.dimensions.time) {
                    singleTile = true;
                }
            }

            layer.setName(config.oldName || layer.name);
            layer.addOptions({
                attribution: layer.attribution || config.attribution,
                maxExtent: maxExtent,
                restrictedExtent: maxExtent,
                singleTile: singleTile,
                ratio: config.ratio || 1,
                visibility: ("visibility" in config) ? config.visibility : true,
                opacity: ("opacity" in config) ? config.opacity : 1,
                buffer: ("buffer" in config) ? config.buffer : 1,
                dimensions: original.data.dimensions,
                transitionEffect: '',
                minScale: config.minscale,
                maxScale: config.maxscale,
                tileSize: new OpenLayers.Size(512,512)
            });
            
            // data for the new record
            var data = Ext.applyIf({
                "abstract": config.description || config.oldDescription,
                title: config.oldName,
                group: config.group,
                infoFormat: config.infoFormat,
                getFeatureInfo:  config.getFeatureInfo,
                source: config.source,
                properties: "gxp_wmslayerpanel",
                fixed: config.fixed,
                selected: "selected" in config ? config.selected : false,
                restUrl: this.restUrl,
                layer: layer
            }, original.data);
            
            // add additional fields
            var fields = [
                {name: "_id", type: "string"},
                {name: "source", type: "string"}, 
                {name: "group", type: "string"},
                {name: "properties", type: "string"},
                {name: "fixed", type: "boolean"},
                {name: "selected", type: "boolean"},
                {name: "restUrl", type: "string"},
                {name: "infoFormat", type: "string"},
                {name: "getFeatureInfo"}
            ];
            original.fields.each(function(field) {
                fields.push(field);
            });

            var Record = GeoExt.data.LayerRecord.create(fields);
            record = new Record(data, layer.id);
            record.json = config;

        } else {
            if (window.console && this.store.getCount() > 0 && config.name !== undefined) {
                console.warn("Could not create layer record for layer '" + config.name + "'. Check if the layer is found in the WMS GetCapabilities response.");
            }
        }

        var url = record.data.layer.url;
        var host = url.split("/")[2];

        if(host == 'maps.lapig.iesa.ufg.br') {
            record.data.layer.url = [
                    url.replace(host, "m1.lapig.iesa.ufg.br")
                ,   url.replace(host, "m2.lapig.iesa.ufg.br")
                //,   url.replace(host, "m3.lapig.iesa.ufg.br")
                //,   url.replace(host, "m4.lapig.iesa.ufg.br")
            ];
        }
        return record;
    }
    
});

Ext.preg(gxp.plugins.LapigWMSCSource.prototype.ptype, gxp.plugins.LapigWMSCSource);
