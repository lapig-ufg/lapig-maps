/**
 * Copyright (c) 2008-2011 The Open Planning Project
 *
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires OpenLayers/Layer/Markers.js
 * @requires OpenLayers/Icon.js
 * @requires OpenLayers/Marker.js
 * @requires OpenLayers/Control/DrawFeature.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Zoom
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Zoom(config)
 *
 *    Provides two actions for zooming in and out.
 */
gxp.plugins.LapigPrint = Ext.extend(gxp.plugins.Tool, {

    ptype: "gxp_lapigprint",

    constructor: function(config) {
        gxp.plugins.LapigPrint.superclass.constructor.apply(this, arguments);
    },

    addActions: function() {
        var actions = gxp.plugins.LapigPrint.superclass.addActions.apply(this, [{
            tooltip: 'Imprimir mapa',
            iconCls: "gxp-icon-lapigprint",
            handler: function() {
                this.addOutput();
            },
            scope: this
        }]);

        return actions;
    },

    addOutput: function(config) {
        return gxp.plugins.LapigPrint.superclass.addOutput.call(this, Ext.apply(
            this.createOutputConfig(), config
        ));
    },

    getForm: function() {
        var fm = Ext.form;
        var instance = this;
        var map = this.target.mapPanel.map;
        var selectedValueLine = '';
        var selectedValueBar = '';

        var printForm = {
            border: false,
            xtype: 'form',
            layout: 'fit',
            padding: 10,
            items: [{
                xtype: 'panel',
                border: false,
                width: '100%',
                height: '100%',
                items: [{
                        xtype: 'fieldset',
                        title: 'Coordenadas Geográficas',
                        items: []
                    }
                ]
            }]
        };


        return printForm;
    },

    createOutputConfig: function() {

        var instance = this;
        var map = this.target.mapPanel.map;

        var url = '';
        var layers = [];

        map.layers.forEach(function(l) {
            if(l instanceof OpenLayers.Layer.WMS && l.visibility) {
                layers.push({ id: l.params.LAYERS, index: l.getZIndex(), name: l.name })
                url = l.url[0];
            }
        })

        layers.sort(function(a,b) {
            return a.index - b.index;
        })

        var strLayers = [];
        var strLabels = [];
        layers.forEach(function(l) {
            strLayers.push(l.id);
            strLabels.push(l.name)
        })


        var strLayers = strLayers.join(';;');
        var labels = strLabels.join(';;');
        var proj = map.projection;
        var size = map.size.h + ',' + map.size.w

       Ext.Msg.show({
           title:'Ferramenta de impressão',
           msg: 'Antes de continuar posicione a região geográfica de interesse no canto<br>inferior esquerdo da tela. Feito isso digite o título do seu mapa.',
           buttons: Ext.Msg.OKCANCEL,
           prompt:true,
           fn: function(action, title){
                var box = map.getExtent();
                var strBbox = box.left + ',' + box.bottom + ',' + box.right + ',' + box.top;
                
                var url = '/print/pdf?layers=' + strLayers + '&bbox=' + strBbox + '&title=' + title + "&labels=" + labels + "&size=" + size;
                window.open(url);
           },
           modal:false,
           icon: Ext.MessageBox.INFO
        });

        /*Ext.MessageBox.prompt('Ferramenta de Mapa', 'Antes de continuar posicione sua região de interesse no canto inferior esquerdo do mapa e digite o título do seu mapa.', function(action, title ) {
            if(action == 'ok') {
                var url = '/print/pdf?layers=' + strLayers + '&bbox=' + strBbox + '&title=' + title + "&labels=" + labels + "&size=" + size;
                window.open(url);
            }
        });*/

    }
});

Ext.preg(gxp.plugins.LapigPrint.prototype.ptype, gxp.plugins.LapigPrint);