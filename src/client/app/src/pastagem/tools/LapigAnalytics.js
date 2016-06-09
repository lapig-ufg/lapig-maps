Ext.namespace("gxp.plugins");

gxp.plugins.LapigAnalytics = {
    clickTool: function(categoryEvent, actionEvent, labelEvent) {
        ga('send', 'event', categoryEvent, actionEvent, labelEvent, 1);        
    }
}