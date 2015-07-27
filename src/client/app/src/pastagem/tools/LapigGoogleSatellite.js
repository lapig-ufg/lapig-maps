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
 *  class = LapigGoogleSatellite
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
 *  .. class:: LapigGoogleSatellite(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.LapigGoogleSatellite = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_LapigGoogleSatellite */
    ptype: "gxp_lapiggooglesatellite",
    
    /** api: config[removeMenuText]
     *  ``String``
     *  Text for remove menu item (i18n).
     */
    removeMenuText: "Google Maps",

    /** api: config[removeActionTip]
     *  ``String``
     *  Text for remove action tooltip (i18n).
     */
    removeActionTip: "Google Maps",
    
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.LapigGoogleSatellite.superclass.addActions.apply(this, [{
            menuText: this.removeMenuText,
            iconCls:  "gxp-icon-googleearth",
            tooltip: this.removeActionTip,
            handler: function() {
                
                window.mapPanel = this.target.mapPanel;

                this.target.mapPanel.map.layers.forEach( function(layer) {
                    if(layer instanceof OpenLayers.Layer.Google && layer.typeName == 'SATELLITE')
                        layer.setVisibility(true)
                })

            },
            scope: this
        }]);
        

        
        return actions;
    }
        
});

Ext.preg(gxp.plugins.LapigGoogleSatellite.prototype.ptype, gxp.plugins.LapigGoogleSatellite);
