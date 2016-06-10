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

Ext.namespace("lapig.tools");

lapig.tools.LapigSpatialIntelligenceBtn = Ext.extend(gxp.plugins.Tool, {
    
    
    ptype: "lapig_spatialintelligencebtn",
    menuText: 'Análise de Informações Geoǵráficas',
    actionTip: 'Análise de Informações Geoǵráficas',

    addActions: function() {
        var actions = lapig.tools.LapigSpatialIntelligenceBtn.superclass.addActions.apply(this, [{
            text: this.menuText,
            tooltip: this.actionTip,
            icon   : 'theme/app/img/spatial-intelligence.png',
            handler: function() {
                Ext.getCmp('eastpanel').expand(true);
            },
            scope: this
        }]);
        
        return actions;
    }
        
});

Ext.preg(lapig.tools.LapigSpatialIntelligenceBtn.prototype.ptype, lapig.tools.LapigSpatialIntelligenceBtn);
