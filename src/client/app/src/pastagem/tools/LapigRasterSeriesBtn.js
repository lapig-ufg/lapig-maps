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

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: LapigRasterSeriesBtn(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.LapigRasterSeriesBtn = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_LapigRasterSeriesBtn */
    ptype: "gxp_lapigrasterseriesbtn",
    
    /** api: config[removeMenuText]
     *  ``String``
     *  Text for remove menu item (i18n).
     */
    removeMenuText: 'Análise de Séries Temporais',

    /** api: config[removeActionTip]
     *  ``String``
     *  Text for remove action tooltip (i18n).
     */
    removeActionTip: 'Análise de Séries Temporais',
    
    /** api: method[addActions]
     */
    addActions: function() {
        var actions = gxp.plugins.LapigRasterSeriesBtn.superclass.addActions.apply(this, [{
            menuText: this.removeMenuText,
            tooltip: this.removeActionTip,
            icon   : 'theme/app/img/chart_xy.png',
            handler: function() {
                Ext.getCmp('southpanel').expand(true);
                Ext.getCmp('lapig_rasterseries::wdw-info').show(this);
            },
            scope: this
        }]);
        

        
        return actions;
    }
        
});

Ext.preg(gxp.plugins.LapigRasterSeriesBtn.prototype.ptype, gxp.plugins.LapigRasterSeriesBtn);
