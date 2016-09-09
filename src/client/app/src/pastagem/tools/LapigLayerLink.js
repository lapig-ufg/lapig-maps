Ext.namespace("gxp.plugins");

gxp.plugins.LapigLayerLink = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_lapiglayerlink",
    
    menuText: "Link de acesso da camada",

    actionTip: "Utilize esse link para acessar diretamente essa camada.",
    
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.LapigLayerLink.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            iconCls: "gxp-icon-lapiglayerlink",
            disabled: true,
            tooltip: this.actionTip,
            handler: function() {
                lapigAnalytics.clickTool('Tools', 'Layer Link', '');
                var record = selectedLayer;
                if(record) {
                    var url = document.URL.split("?")[0];
                    var layerName = record.json._id;
                    url = url + '?layers=' + layerName;

                    lapigAnalytics.clickTool('Layer Link', 'select-layer', layerName);

                    var msg = i18n.LAPIGLAYERLINK_DESCRIPTION 
                        + "<br><br>" + url;
                    
                    Ext.MessageBox.show({
                       title: this.menuText,
                       msg: msg,
                       buttons: Ext.MessageBox.OK,
                       animEl: 'mb9',
                       icon: 'ext-mb-info'
                    });
                }
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
    }
        
});

Ext.preg(gxp.plugins.LapigLayerLink.prototype.ptype, gxp.plugins.LapigLayerLink);
