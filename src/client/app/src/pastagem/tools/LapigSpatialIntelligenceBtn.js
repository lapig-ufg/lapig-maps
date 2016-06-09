Ext.namespace("lapig.tools");

lapig.tools.LapigSpatialIntelligenceBtn = Ext.extend(gxp.plugins.Tool, {
    
    
    ptype: "lapig_spatialintelligencebtn",
    menuText: 'Análise de Informações Geoǵráficas',
    actionTip: 'Análise de Informações Geoǵráficas',

    addActions: function() {
        var actions = lapig.tools.LapigSpatialIntelligenceBtn.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            tooltip: this.actionTip,
            icon   : 'theme/app/img/spatial-intelligence.png',
            handler: function() {
                console.log("Estou no Spatial Intelligence")
                lapigAnalytics.clickTool('Tools', 'Spatial Intelligence', '');
                
                Ext.getCmp('eastpanel').expand(true);
            },
            scope: this
        }]);
        
        return actions;
    }
        
});

Ext.preg(lapig.tools.LapigSpatialIntelligenceBtn.prototype.ptype, lapig.tools.LapigSpatialIntelligenceBtn);
