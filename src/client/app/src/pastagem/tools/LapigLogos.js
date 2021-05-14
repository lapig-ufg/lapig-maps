/**
 * @requires plugins/Tool.js
 */

Ext.namespace("lapig.tools");

lapig.tools.logos = Ext.extend(gxp.plugins.Tool, {

    ptype: "lapig_logos",

    constructor: function(config) {
        lapig.tools.logos.superclass.constructor.apply(this, arguments);
    },

    addOutput: function(config) {
        config = Ext.apply(this.createOutputConfig(), config || {});
        var output = lapig.tools.logos.superclass.addOutput.call(this, config);

        return output;
    },

    createOutputConfig: function() {
        return  {
            xtype: 'panel',
            border: false,
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'center'
            },
            margin: 20,
            padding: 20,
            items: [
                {
                    xtype: 'box',
                    margins: {top:15, left:0, right: 5, bottom:0},
                    width: 100,
                    height: 35,
                    cls: 'lapig',
                },
                {
                    xtype: 'box',
                    width: 70,
                    height: 70,
                    cls: 'ufg',
                },
            ]
        };
    },
});

Ext.preg(lapig.tools.logos.prototype.ptype, lapig.tools.logos);