/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = LapigMetadata
 */

Ext.IframeWindow = Ext.extend(Ext.Window, {
    onRender: function() {
        this.bodyCfg = {
            tag: 'iframe',
            src: this.src,
            cls: this.bodyCls,
            style: {
                border: '0px none',
                "background-color": 'white'
            }
        };
        Ext.IframeWindow.superclass.onRender.apply(this, arguments);
    }
});

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: LapigMetadata(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.LapigMetadata = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_Metadatalayer */
    ptype: "gxp_lapigmetadata",
    
    /** api: config[menuText]
     *  ``String``
     *  Text for remove menu item (i18n).
     */
    menuText: "Metadados",

    /** api: config[removeActionTip]
     *  ``String``
     *  Text for remove action tooltip (i18n).
     */
    removeActionTip: "Metadados da camada",
    
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.LapigMetadata.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            text: this.menuText,
            iconCls: "gxp-icon-metadatalayer",
            disabled: true,
            tooltip: this.removeActionTip,
            handler: function() {
                this.removeOutput();
                this.addOutput(selectedLayer);
            },
            scope: this
        }]);
        var removeLayerAction = actions[0];

        this.target.on("layerselectionchange", function(record) {
            selectedLayer = record;
            removeLayerAction.setDisabled(
                this.target.mapPanel.layers.getCount() <= 1 || !record
            );
        }, this);
        var enforceOne = function(store) {
            removeLayerAction.setDisabled(
                !selectedLayer || store.getCount() <= 1
            );
        };
        this.target.mapPanel.layers.on({
            "add": enforceOne,
            "remove": enforceOne
        });
        
        return actions;
    },

    addOutput: function(selectedLayer) {
        /*config = config || {};
        var record = this.target.selectedLayer;
        var origCfg = this.initialConfig.outputConfig || {};
        this.outputConfig.title = origCfg.title ||
            this.menuText + ": " + record.get("title");
        
        //TODO create generic gxp_layerpanel
        var xtype = record.get("properties") || "gxp_layerpanel";
        var panelConfig = this.layerPanelConfig;
        if (panelConfig && panelConfig[xtype]) {
            Ext.apply(config, panelConfig[xtype]);
        }*/
        
        if(selectedLayer.json && selectedLayer.json.name) {

            var layerName   = selectedLayer.json.name;
            var title       = 'Metadados - '+selectedLayer.data.title;

            var url = "/ogc-server/metadados"+
                        "?layer="+layerName;

            var w = new Ext.IframeWindow({
                id:id,
                title: title,
                width: 750,
                height: 480,
                minWidth: 300,
                minHeight: 200,
                src:url,
                layout: 'fit',
                plain: true,
                bodyStyle: 'padding:5px;'
            });

            w.show()

            return w;
        }

        return null;
    }
        
});

Ext.preg(gxp.plugins.LapigMetadata.prototype.ptype, gxp.plugins.LapigMetadata);
