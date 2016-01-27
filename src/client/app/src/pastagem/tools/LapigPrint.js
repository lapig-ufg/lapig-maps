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

    addActions: function() {
        var actions = gxp.plugins.LapigPrint.superclass.addActions.apply(this, [{
            tooltip: 'Imprimir mapa',
            iconCls: "gxp-icon-lapigprint",
            handler: function() {
                this.addSelectedPrint();
            },
            scope: this
        }]);

        return actions;
    },

    getBbox: function() {

        var instance = this;
        var map = instance.internalMap.map;

        var box = map.getExtent();
        var strBbox = box.left + ',' + box.bottom + ',' + box.right + ',' + box.top;

        return strBbox;

    },

    getSize: function() {
        var instance = this;
        var map = instance.internalMap.map;

        var sizeWidth = map.size.w;
        var sizeHeight = map.size.h;
        var size = "&WIDTH="+sizeWidth+"&HEIGHT="+sizeHeight;

        return size;

    },

    printMap: function() {

        var instance = this;
        var map = instance.internalMap.map;

        var strLayers = [];
        var strLabels = [];
        instance.layers.forEach(function(l) {
            if(l.enable){
                strLayers.push(l.id);
                strLabels.push(l.label)
            }
        })
 
        var strLayers = strLayers.join(';;');
        var labels = strLabels.join(';;');

        var proj = map.projection;
        var size = map.size.h + ',' + map.size.w;

        var box = map.getExtent();
        var strBbox = box.left + ',' + box.bottom + ',' + box.right + ',' + box.top;

        var description = Ext.getCmp('description_map').text;
        var title = Ext.getCmp('title_map').text;
        
        var url = '/print/pdf?layers=' + strLayers + '&bbox=' + strBbox + "&labels=" + labels + "&size=" + size + "&title=" + title + "&description=" + description;
        window.open(url);
    },

    getLayersFromAppMap: function() {
        
        var instance = this;
        var appMap = this.target.mapPanel.map;

        var olLayers = [];
        instance.layers = [];
        
        olLayers.push(new OpenLayers.Layer.Bing({
            name: "Road",
            key: "AgGtGpUH9SjzBV5Cf6ZSRIDws0e2nSaLxZwPvx3uWSxV5wz43AxMzBHMSa9eiWdx",
            type: "Road"
        }));

        appMap.layers.forEach(function(appLayer) {
            if(appLayer instanceof OpenLayers.Layer.WMS) {
                var url = appLayer.url;
                var name = appLayer.name;
                var visibility = appLayer.visibility;
                var srsParams = appLayer.params['SRS'];
                var layersParams = appLayer.params['LAYERS'];
                
                var olLayer = new OpenLayers.Layer.WMS( name, url, 
                    { layers: layersParams, format: 'image/png', transparent: 'true'  }, 
                    { maxExtent: appLayer.maxExtent, projection: new OpenLayers.Projection('EPSG:900913'), visibility: appLayer.visibility } 

                );
                var printToolLayer = {
                    id: layersParams,
                    label: name,
                    enable: visibility
                }

                olLayers.push(olLayer)
                instance.layers.push(printToolLayer)
            }
        });

        return olLayers;
    },

    getContentItem1: function() {
       
        var instance = this;
        var appMap = this.target.mapPanel.map;

        instance.internalMap = new GeoExt.MapPanel({
            title: "Personalizaçao do Mapa",
            map: {
                projection: "EPSG:900913"
            },
            center: [appMap.center.lon, appMap.center.lat],
            zoom: appMap.zoom,
            border:false,
            width: 700,
            height: 595,
            region: "center",
            layers: instance.getLayersFromAppMap(),
        })

        var nav = new Ext.Panel({
            title: 'Manipule o Mapa',
            border:false,
            region: 'east',
            split: true,
            width: 220,
            height: 595,
            padding:10,
            items:[
                {
                    xtype:'label',
                    style:{
                    fontSize:'12px',
                    paddingTop:'45px',
                    },
                    html: [
                        '<h1>Seja bem vindo á Ferramenta de Impressão de Mapas!</h1>',
                            '<br>',
                        '<p>Serão 3 passos simples e rápidos, veja:</p>',
                            '<br>',
                        '<ul>',
                            '<li><b>Passo 1</b> - Ajuste a região do mapa a ser impressa;</li>',
                            '<li><b>Passo 2</b> - Escolha as legendas que serão descritas no mapa;</li>',
                            '<li><b>Passo 3</b> - Finalize, personalizando o título e descrição de seu mapa!</li>',
                        '</ul>',
                            '<br>',
                        '<p>Vamos começar com o primeiro passo:</p>',
                        '<p>Para escolher a área do mapa a ser impressa, basta utilizar o Mouse ou Touchpad de seu computador, para reduzir, ampliar e arrastar a área do mapa! </p>',
                            '<br>',
                        '<p><b>O mapa Bing estará visível apenas para localização, não sendo permitida a sua impressão de acordo com os termos de uso da Microsoft Corporation.</b><br> Saiba mais em, <a href="http://www.microsoft.com/maps/product/terms.html" target="_blank">termos de uso</a>.</p>',
                    ],
                },
            ],
            buttons: [
                {
                    text: 'Proximo Passo',
                    style: {
                        paddingLeft: '10px',
                        paddingRight:'10px',
                    },
                    handler: function(){
                        instance.createProximoPasso2(true);  
                    }
                }
            ]
        });

        return {
            layout: 'border',
            border:false,
            height: 595,
            items: [ instance.internalMap, nav ]
        }
    },

    createProximoPasso2 : function(updateLegendPnlFlag){
        var instance = this;

        var tabPrint = Ext.getCmp('gxp_lapigprint::tab-print');
        var tabSection1 = Ext.getCmp('gxp_lapigprint::tab-section1');
        var tabSection2 = Ext.getCmp('gxp_lapigprint::tab-section2');
        var tabSection3 = Ext.getCmp('gxp_lapigprint::tab-section3');
        var pnlMap = Ext.getCmp('gxp_lapigprint::pnl-map-section2');
        var pnlLegendImg = Ext.getCmp('gxp_lapigprint::pnl-legend-section2');
        var pnlLegend = Ext.getCmp('gxp_lapigprint::ckeck-legend');

        /* Atualizacao do mapa ******************************/
        var layerIds = [];
        instance.layers.forEach(function(layer){
            if(layer.enable) {
                layerIds.push(layer.id)
            }
        });
        layerIds = layerIds.join(',');

        var bBox = instance.getBbox();
        var size = instance.getSize();

        var mapUrl = "/ows?SERVICE=WMS&LAYERS=" + layerIds + "&FORMAT=image%2Fpng&TRANSPARENT=TRUE&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:900913&BBOX="+ bBox + size;
        var html = '<CENTER><img style="padding:5px" src="' + mapUrl + '" width="100%"/></CENTER>';

        if (pnlMap.html == '') {
            pnlMap.html = html;
        }
        else{
            pnlMap.update(html);
            pnlMap.doLayout();   
        }
        /*******************************/

        /* Atualizacao da figura leg|enda ******************************/
        pnlLegendImg.removeAll();
            var titleLegends = new Ext.form.Label({
                xtype:'label',
                style:{
                fontSize:'14px',
                paddingTop:'10px',
                },
                html: [
                    '<h2>Legendas:</h2>',
                ],
            });
            pnlLegendImg.add(titleLegends);
        instance.layers.forEach(function(layer){
            if (layer.enable){


                var imgLeg = "/ows?EXCEPTIONS=application/vnd.ogc.se_xml&TRANSPARENT=TRUE&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&LAYER="+layer.id+"&format=image/png&SCALE=34942571.6116478"
                var htmlLeg = '<img src=' + imgLeg + '" style="max-width: 180px;"/>';

                var legendMap = new Ext.Panel({
                    title: layer.label,
                    headerCfg: {
                        tag: 'span',
                        cls: 'x-header-legends',
                        html: 'Message'
                    },
                    border: false,
                    html:htmlLeg,
                    style:{
                        paddingBottom:'6px',
                        paddingTop:'4px',
                    }
                });
                pnlLegendImg.add(legendMap);
            }
        });
        pnlLegendImg.doLayout();

        /*******************************/

        /* Atualizacao da legenda checkbox ******************************/
        if(updateLegendPnlFlag) {

            pnlLegend.removeAll();
            var pnlLabel = new Ext.form.Label({
                xtype:'label',
                style:{
                fontSize:'12px',
                paddingTop:'10px',
                },
                html: [
                    '<h3>Escolha as legendas que aparecerão na impressão do mapa, para movê-las, utilize o botão verde com uma seta indicada:</h3>',
                ],
            });
            pnlLegend.add(pnlLabel);

            instance.layers.forEach(function(layer){
                var composite = new Ext.form.CompositeField({
                    style:{
                        paddingTop:'10px',
                        paddingBottom:'10px',
                    },
                    items: [
                    {
                        xtype: 'button',
                        id:'lapig-icon-seta-verde',
                        style:{
                            paddingTop:"4px",
                            width:'15px',
                        },
                        html:'<img src="/theme/app/img/seta.png"/>',
                        listeners:{
                            click : function(n){

                                var posicao = instance.layers.indexOf(layer);
                                var aux = instance.layers[posicao-1];

                                instance.layers[posicao-1] = instance.layers[posicao];
                                instance.layers[posicao] = aux;

                                instance.createProximoPasso2(true);
                            },
                        }
                    }, 
                    {
                        xtype: 'checkbox',
                        checked: layer.enable,
                        boxLabel: layer.label,
                        name: layer.id,
                        listeners: {
                            check : function(cb, value) {
                                instance.layers.forEach(function(layer){
                                    if (cb.getName() == layer.id){
                                        layer.enable = value;
                                    }
                                })
                                instance.createProximoPasso2(false);
                            }
                        }
                    },
                    ]
                });

                if (instance.layers.indexOf(layer) == 0){
                    Ext.getCmp('lapig-icon-seta-verde').setDisabled(true);
                    Ext.getCmp('lapig-icon-seta-verde').html ='<img src="/theme/app/img/seta-invisivel.png"/>';
                }

                pnlLegend.add(composite);
            });
        pnlLegend.doLayout(); 
        }
        /*******************************/
        
        tabSection2.enable();
        tabPrint.activate(tabSection2);
        pnlLegend.doLayout();
    },

    getContentItem2 : function(){

        var instance = this;

        var title = new Ext.Panel({
            layout: "border",
            border:false,
            region: "north",
            height:50,
            split: false,
            items:[{
                xtype:'label',
                region: "center",
                border:false,
                readOnly: true,
                height:40,
                style:{
                    borderColor: 'white transparent',
                    backgroundColor: 'white',
                }
            }],
        });

        var map = new Ext.Panel({
            id: 'gxp_lapigprint::pnl-map-section2',
            border: false,
            region: "center",
            split: true,
            html:'',
            style:{
                backgroundColor: 'white',
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '0px',
                paddingRight: '0px',
                border: '1px solid gray',
            },
        });

        var legend = new Ext.Panel({
            id: 'gxp_lapigprint::pnl-legend-section2',
            border: false, 
            region: "east",
            split: false,
            width: 200,
            autoScroll: false,
            style:{
                backgroundColor: 'white',
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '5px',
                paddingRight: '5px',
                border: '1px solid gray',
            },
            html:'',
        });

        var descricao = new Ext.Panel({
            layout: "border",
            border:false,
            region: "south",
            height:47,
            split: false,
            padding: 5,
            items:[{
                xtype:'label',
                region: "center",
                border:false,
                readOnly: true,
                height:40,
                style:{
                    borderColor: 'white transparent',
                    backgroundColor: 'white',
                }
            }],
        });

        var mapLegend = new Ext.Panel({
            title:'Preview',
            layout: "border",
            border:false,
            region: "center",
            split: true,
            style:{
                backgroundColor: 'white',
            },
            items:[title, map, legend, descricao]
            
        });

        var checkLegend = new Ext.Panel({
            id: 'gxp_lapigprint::ckeck-legend',
            border:false,
            padding:10,
            items: {
                border: false,
                defaultType: 'checkbox',
                style:{
                    paddingTop: '15px',
                    paddingLeft:'10px',
                },
            }
        });

        var selctionLegend = new Ext.Panel({
            title: 'Selecione as Legendas',
            border:false,
            region: "east",
            split: true,
            width: 220,
            items:[checkLegend],

            buttons: [{
                text: 'Proximo Passo',
                style: {
                    paddingLeft: '10px',
                    paddingRight:'10px',
                },
                handler: function(){
                    instance.createProximoPasso3(true);
                }
            }]
        });

        return {
            layout: "border",
            border:false,
            height: 595,
            items: [mapLegend, selctionLegend]
        }

    },

    createProximoPasso3 : function(updateLegendPnlFlag){
        var instance = this;

        var tabPrint = Ext.getCmp('gxp_lapigprint::tab-print');
        var tabSection3 = Ext.getCmp('gxp_lapigprint::tab-section3');
        var pnlMap = Ext.getCmp('gxp_lapigprint::pnl-map-section3');
        var pnlLegendImg = Ext.getCmp('gxp_lapigprint::pnl-legend-section3');

        /* Atualizacao do mapa ******************************/
        var layerIds = [];
        instance.layers.forEach(function(layer){
            if(layer.enable) {
                layerIds.push(layer.id)
            }
        });
        layerIds = layerIds.join(',');

        var bBox = instance.getBbox();
        var size = instance.getSize();

        var mapUrl = "/ows?SERVICE=WMS&LAYERS=" + layerIds + "&FORMAT=image%2Fpng&TRANSPARENT=TRUE&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:900913&BBOX="+ bBox + size;
        var html = '<CENTER><img style="padding:5px" src="' + mapUrl + '" width="100%"/></CENTER>';

        if (pnlMap.html == '') {
            pnlMap.html = html;
        }
        else{
            pnlMap.update(html);
            pnlMap.doLayout();   
        }
        /*******************************/

        /* Atualizacao da figura leg|enda ******************************/
        pnlLegendImg.removeAll();
            var titleLegends = new Ext.form.Label({
                xtype:'label',
                style:{
                fontSize:'14px',
                paddingTop:'10px',
                },
                html: [
                    '<h2>Legendas:</h2>',
                ],
            });
            pnlLegendImg.add(titleLegends);

        instance.layers.forEach(function(layer){
            if (layer.enable){

                var imgLeg = "/ows?EXCEPTIONS=application/vnd.ogc.se_xml&TRANSPARENT=TRUE&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&LAYER="+layer.id+"&format=image/png&SCALE=34942571.6116478"
                var htmlLeg = '<img src=' + imgLeg + '" style="max-width: 180px;"/>';

                var legendMap = new Ext.Panel({

                    title: layer.label,
                    headerCfg: {
                        tag: 'span',
                        cls: 'x-header-legends',
                        html: 'Message'
                    },
                    border: false,
                    html:[htmlLeg],
                    style:{
                        width: '100%',
                        paddingBottom:'6px',
                        paddingTop:'4px',
                    }
                });
                pnlLegendImg.add(legendMap);
            }
        });
        pnlLegendImg.doLayout();
        
        tabSection3.enable();
        tabPrint.activate(tabSection3);
    },

    getContentItem3: function(){

        var instance = this;

        var title = new Ext.Panel({
            layout: "border",
            border:false,
            region: "north",
            height:50,
            split: false,
            items:[{
                xtype:'label',
                fieldLabel: 'Título',
                id: 'title_map',
                autoScroll: false,
                name: 'titulo',
                region: 'center',
                border: false,
                readOnly: true,
                height:40,
                anchor:'98%',
                padding: 3,
                style:{
                    borderColor: 'white transparent',
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    paddingTop:'35px',
                    textAlign: 'center'
                }
            },
            {
                xtype:'panel',
                name: 'logo-pastagem',
                region: 'west',
                html: '<img src="/theme/app/img/logo-pastagem.png"/>',
                border: false,
                height:40,
                width:120,
                anchor:'98%',
                padding: 3,
            },
            {
                xtype:'panel',
                region: "east",
                border: false,
                height:40,
                width:190,
                anchor:'98%',
                padding: 1,
                style: {
                    backgroundColor: 'white',
                }
            }],
        });

        var descricao = new Ext.Panel({
            layout: "border",
            border:false,
            region: "south",
            split: false,
            padding: 5,
            height: 47,
            items:[{
                xtype:'label',
                id: 'description_map',
                autoScroll: false,
                region: "center",
                border:false,
                readOnly: true,
                name: 'descricao',
                anchor:'98%',
                style:{

                    borderColor: 'white transparent',
                    backgroundColor: 'white',
                    paddingRight: '5px',
                    paddingTop: '22px',
                    fontSize: '11px', 
                    fontStyle: 'italic',
                }
            },{
                xtype:'panel',
                name: 'logo-pastagem',
                region: "east",
                html: '<img src="/theme/app/img/logo-parceiros.png"/>',
                border: false,
                height:40,
                width:310,
                anchor:'98%',
                padding: 1,
                style: {
                    height:'40px'
                }
            }],
        });

        var map = new Ext.Panel({
            id: 'gxp_lapigprint::pnl-map-section3',
            border: false,
            region: "center",
            split: false,
            html:'',
            style:{
                backgroundColor: 'white',
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '0px',
                paddingRight: '0px',
                border: '1px solid gray',
            },
        });

        var legend = new Ext.Panel({
            id: 'gxp_lapigprint::pnl-legend-section3',
            border: false, 
            region: "east",
            split: false,
            width: 200,
            autoScroll: false,
            style:{
                backgroundColor: 'white',
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '5px',
                paddingRight: '5px',
                border: '1px solid gray',
            },
            html:'',
        });

        var mapLegend = new Ext.Panel({
            title:'Preview',
            layout: "border",
            border:false,
            region: "center",
            split: true,
            style:{
                backgroundColor: 'white',
            },
            items:[title, map, legend, descricao]
            
        });

        var pnlTituloeDescricao = new Ext.Panel({
            title: 'Personalização do Título e Descrição',
            layout: "border",
            border:false,
            region: "east",
            split: true,
            width: 220,
            items:[{
                border:false,
                width: 2250,
                height:550,
                items: [{
                    layout: 'form',
                    border: false,
                    labelAlign:'top',
                    style: {
                        paddingTop: '20px',
                        paddingLeft: '5px'
                    },
                    items: [{
                        xtype:'textarea',
                        fieldLabel: 'Digite o Título',
                        name: 'titulo',
                        autoScroll: false,
                        height:100,
                        width:210,
                        enableKeyEvents: true,
                        labelStyle: 'font-weight:bold;',
                        listeners: {
                            keyup : function (key, e){
                                var titleArea = Ext.getCmp('title_map');

                                var keys = key.getValue();
                                titleArea.setText(keys);
                            },
                        },
                    }, {
                        xtype:'textarea',
                        fieldLabel: 'Digite a Descrição',
                        name: 'descricao',
                        autoScroll: false,
                        height:220,
                        width: 210,
                        labelStyle: 'font-weight:bold;',
                        enableKeyEvents: true,
                        listeners: {
                            keyup : function (key, e){
                                var descriptionArea = Ext.getCmp('description_map');

                                var keys = key.getValue();
                                descriptionArea.setText(keys);
                            },
                        },
                    }]
                }],
            }],
            buttons: [{
                text: 'Gerar PDF',
                style: {
                    paddingLeft: '10px',
                    paddingRight:'10px',
                },
                handler: function(){
                    
                    instance.printMap()
                }
            }]
            });

            return {
            layout: "border",
            border:false,
            height: 595,
            items: [mapLegend, pnlTituloeDescricao]
        }
    },

    addSelectedPrint: function(){

        var instance = this

        var tabs = new Ext.TabPanel({
            id: 'gxp_lapigprint::tab-print',
            region: 'center',
            border:false,
            margins:'3 3 3 0', 
            activeTab: 0,
            height: 400,
            defaults:{},
            listeners: {
                tabchange: function(tabpanel, tab){
                    var instance = this;
                    var tabsId = ['gxp_lapigprint::tab-section1', 'gxp_lapigprint::tab-section2', 'gxp_lapigprint::tab-section3']; 

                    if (tab.id==tabsId[0]){
                        Ext.getCmp('gxp_lapigprint::tab-section2').setDisabled(true);
                        Ext.getCmp('gxp_lapigprint::tab-section3').setDisabled(true);
                    }
                    if (tab.id==tabsId[1]){
                        Ext.getCmp('gxp_lapigprint::tab-section3').setDisabled(true);
                    }
                }
            },
            items:[{
                title: '1) Regiao',
                id: 'gxp_lapigprint::tab-section1',
                disabled:false,
                items: [ instance.getContentItem1() ],
            },{
                title: '2) Legenda',
                id: 'gxp_lapigprint::tab-section2',
                disabled:true,
                items: [ instance.getContentItem2() ]
            },{
                title: '3) Titulo e Descriçao',
                id: 'gxp_lapigprint::tab-section3',
                disabled:true,
                items: [ instance.getContentItem3() ]
            }
            ]
        });

        

        var win = new Ext.Window({
            title: 'Siga o passo a passo para impressao do mapa',
            closable:true,
            width:1030,
            height:650,
            border:false,
            layout: 'fit',
            items: [tabs]
        });

       return win.show(this);
    },

});

Ext.preg(gxp.plugins.LapigPrint.prototype.ptype, gxp.plugins.LapigPrint);