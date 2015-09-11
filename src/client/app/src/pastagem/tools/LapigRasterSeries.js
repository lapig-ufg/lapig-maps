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
gxp.plugins.LapigRasterSeries = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = gxp_lapigzoom */
    ptype: "gxp_lapigrasterseries",

    GOOGLE_PROJ: new OpenLayers.Projection("EPSG:900913"),

    WGS84_PROJ: new OpenLayers.Projection("EPSG:4326"),

    pubLayer: 'WS_LAPIG_INDICES:or_publicacoes_lapig',

    data: null,

    vectors: null,

    constructor: function(config) {
        gxp.plugins.LapigRasterSeries.superclass.constructor.apply(this, arguments);
    },

    addOutput: function(config) {
        return gxp.plugins.LapigRasterSeries.superclass.addOutput.call(this, Ext.apply(
            this.createOutputConfig(), config
        ));
    },

    createPersistenceObj: function() {
        var instance = this;
        var map = this.target.mapPanel.map;

        instance.contador = 0;

        instance.vectors = new OpenLayers.Layer.Markers("Série Temporais (Coordenadas)", {
            displayInLayerSwitcher: false
        });
        map.addLayer(instance.vectors);

        instance.store = new Ext.data.ArrayStore({
            fields: [{
                name: 'nome'
            }, {
                name: 'latitude',
                type: 'float'
            }, {
                name: 'longitude',
                type: 'float'
            }]
        });

        instance.iconPathSelect = 'theme/app/img/markers/map-pin-pink.png';
        instance.iconPathDeselect = 'theme/app/img/markers/marker-deselected.png';

        map.events.register('addlayer', map, function() {
            instance.setLayerIndex();
        });
    },

    getMapMarker: function(longitude, latitude) {
        var instance = this;
        var markers = instance.vectors.markers;

        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];

            if (marker.controle == (String(longitude) + String(latitude)))
                return marker;
        }

        return undefined;
    },

    setLayerIndex: function() {
        var instance = this;
        var map = this.target.mapPanel.map;

        var lastIndex = 0;
        map.layers.forEach(function(l) {
            var layerIndex = map.getLayerIndex(l);
            if (layerIndex > lastIndex)
                lastIndex = layerIndex
        });

        map.setLayerIndex(instance.vectors, (lastIndex + 1));
    },

    dms2dd: function(cd, cm, cs) {
        try {
            //YAHOO.log("dms2dd", "i3geo");
            //converte dms em dd
            var sinal = 'positivo';
            if (cd < 0) {
                cd = cd * -1;
                sinal = 'negativo';
            }
            spm = cs / 3600;
            mpg = cm / 60;
            var dd = (cd * 1) + (mpg * 1) + (spm * 1);
            if (sinal == 'negativo') {
                dd = dd * -1;
            }
            //YAHOO.log("Fim dms2dd", "i3geo");
            return (dd);
        } catch (e) {
            return (0);
        }
    },

    dd2dms: function(x, y) {
        var m = 0;
        var s = 0;
        var dx = parseInt(x);
        if (dx > 0) {
            var restod = x - dx;
        }
        if (dx < 0) {
            restod = (x * -1) - (dx * -1);
        }
        dx = dx;
        if (restod != 0) {
            var mm = restod * 60;
            var m = parseInt(restod * 60);
            var restos = mm - m;
            var mx = m;
            if (restos != 0) {
                var s = restos * 60;
                var s = (s + "_").substring(0, 5);
                var sx = s;
            } else {
                s = "00.00"
            }
        } else {
            var mx = "00";
            var sx = "00.00";
        }
        if (m.length == 2) {
            m = "0" + m + "";
        }
        if (s * 1 < 10) {
            s = "0" + s;
        }
        var xv = dx + " " + mx + " " + sx;
        var m = 0;
        var s = 0;
        var dy = parseInt(y);
        if (dy > 0) {
            var restod = y - dy;
        }
        if (dy < 0) {
            var restod = (y * -1) - (dy * -1);
        }
        dy = dy;
        if (restod != 0) {
            var mm = restod * 60;
            var m = parseInt(restod * 60);
            var restos = mm - m;
            var my = m;
            if (restos != 0) {
                var s = restos * 60;
                s = (s + "_").substring(0, 5);
                var sy = s;
            } else {
                var s = "00.00";
            }
        } else {
            var my = "00";
            var sy = "00.00";
        }
        if (m.length == 2) {
            m = "0" + m;
        }
        if (s * 1 < 10) {
            s = "0" + s;
        }
        var yv = dy + " " + my + " " + sy;
        var res = new Array();
        res[0] = xv;
        res[1] = yv;
        return res;
    },

    setDd: function(lon, lat) {
        Ext.getCmp('form-text-lon').setValue(lon);
        Ext.getCmp('form-text-lat').setValue(lat);
    },

    setDms: function(coord) {

        var dmsLon = coord[0].split(' ');
        var dmsLat = coord[1].split(' ');

        Ext.getCmp('dms-lon-d').setValue(dmsLon[0]);
        Ext.getCmp('dms-lon-m').setValue(dmsLon[1]);
        Ext.getCmp('dms-lon-s').setValue(dmsLon[2]);

        Ext.getCmp('dms-lat-d').setValue(dmsLat[0]);
        Ext.getCmp('dms-lat-m').setValue(dmsLat[1]);
        Ext.getCmp('dms-lat-s').setValue(dmsLat[2]);

    },

    getWestCmp: function() {
        var fm = Ext.form;
        var instance = this;
        var map = this.target.mapPanel.map;
        var selectedValueLine = '';
        var selectedValueBar = '';
        var button = Ext.get('show-btn');

        var layers = {
          xtype: 'treepanel',
          id: 'tree-layer',
          border: false,
          useArrows: true,
          autoScroll: true,
          animate: true,
          enableDD: false,
          containerScroll: true,
          rootVisible: false,
          height: 300,
          width: 250,
          region: 'west',
          root: new Ext.tree.AsyncTreeNode({
            text: 'Extensions', 
            draggable:false, 
            id:'ux'
          }),
          dataUrl: 'layers/tree',
          requestMethod: 'GET',
          columns:[{
              header: 'Assuntos',
              dataIndex: 'task',
              width: 200
          }],
          listeners: {
            click: function(node, e ) {

              if(node.leaf) {
                var id = node.attributes.id;
                var url = 'layers/'+ id;

                var formLayer = Ext.getCmp('form-layer');

                formLayer.load({
                  url:url, 
                  method:'GET', 
                  waitMsg:'Loading',
                });                           
              }
            }
          }
        };


        var win = new Ext.Window({
          layout:'fit',
          border:false,
          width:600,
          height:410,
          closeAction:'hide',
          plain: true,
          title: 'Dados Temporais',

          items:[
          {
            //title: 'Layout Window',
            region: 'center',
            closable:true,
            width:600,
            height:350,
            plain:true,
            layout: 'border',
            border:false,
            items: [
              {
                title: 'Categorias',
                border:false,
                region: 'west',
                split: true,
                width: 200,
                height: 410,
                collapsible: true,
                items:[layers],
              },
              {
                title: 'Detalhes',
                border:false,
                region: 'center',
                layout:'form',
                xtype:'form',
                split: true,
                width: 200,
                labelAlign:'top',
                padding: "10px 10px 0px 10px",
                items:[
                  {
                    xtype: 'textfield',
                    hideLabel: false,
                    anchor:'100%',
                    fieldLabel:'Nome',
                    emptyText: 'Nome da série temporal',
                    width:350,
                    height:20,
                    readOnly:true,
                    value:'Radiação Fotossinteticamente Ativa (MODIS15A2 / FPAR)',
                  },
                  {
                    xtype: 'textarea',
                    hideLabel: false,
                    anchor:'100%',
                    fieldLabel:'Descrição',
                    padding: "0px 0px 0px 0px",
                    //emptyText: 'Descrição da série temporal',
                    width:350,
                    height:80,
                    readOnly:true,
                    autoScroll:true,
                    value:'Dados de desmatamentos ocorridos no Bioma Cerrado, disponibilizados anualmente, a partir do período 2002-2003, até o ano de 2014, produzidos a partir de imagens MODIS (MOD13Q1), sendo utilizadas imagens LANDSAT e CBERS para validação.',
                  },
                  {
                    layout:'column',
                    xtype: 'panel',
                    hideLabel: true,
                    border:false,
                    readOnly:true,
                    items:[
                      {
                        columnWidth:.5,
                        layout: 'form',
                        labelAlign: 'top',
                        border:false,
                        items: [
                          {
                            xtype:'textarea',
                            fieldLabel: 'Satélite',
                            height: 20,
                            width: 165,
                            readOnly: true,
                            name: 'satelite',
                            value:'LANDSAT2'
                            //anchor:'100%'
                          },
                          {
                            xtype:'textarea',
                            fieldLabel: 'Fonte',
                            height: 66,
                            width: 165,
                            readOnly: true,
                            name: 'fonte',
                            //anchor:'100%'
                          }
                        ]
                      },
                      {
                        columnWidth:.5,
                        layout: 'form',
                        labelAlign: 'top',
                        border:false,
                        padding: "0px 0px 0px 10px",
                        readOnly:true,
                        items: [
                          {
                            xtype:'textarea',
                            fieldLabel: 'Período',
                            height: 20,
                            width: 165,
                            readOnly: true,
                            name: 'periodo',
                            value:'2010 - 2014'
                            //anchor:'100%'

                          },
                          {
                              xtype:'textfield',
                              fieldLabel: 'Escala',
                              height: 20,
                              width: 165,
                              readOnly: true,
                              name: 'escala',
                              value:'-49.2658, -16.6058'
                              //anchor:'100%'
                          },
                          {
                            xtype:'textfield',
                            fieldLabel: 'Unidade de Medida',
                            height: 20,
                            width: 165,
                            readOnly: true,
                            name: 'unidademedida',
                            //anchor:'100%'
                          },
                        ]
                      }
                    ],
                    buttons: [{
                      text: 'Visualizar',
                      listeners: {
                        click: function(evt) {
                          win.hide(this);

                          Ext.getCmp('panel-latlot-fieldset').enable();
                          Ext.getCmp('button-consultar').enable();
                          
                        },
                      },
                    }],
                  },
                ],
              },
            ],
          }]

        });

        var getMapCoordBtn = function() {
            return {
               // columnWidth: .10,
                rowspan: 2,
                xtype: 'button',
                icon: 'theme/app/img/add-latlon-map.png',
                height: 10,
                tooltip: 'Clique em uma região do mapa para preencher a Latitude e Longitude.',
                style: {
                    'width':'20px',
                    'height':'20px',
                    'margin-right': '10px'
                },
                handler: function() {
                    var fn = function(e) {
                        var lonLat = map.getLonLatFromPixel(e.xy)
                            .transform(instance.GOOGLE_PROJ, instance.WGS84_PROJ);

                        instance.setDd(lonLat.lon, lonLat.lat);
                        instance.setDms(instance.dd2dms(lonLat.lon, lonLat.lat));

                        lonLat = map.getLonLatFromPixel(e.xy);

                        var size = new OpenLayers.Size(35, 35);
                        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
                        var icon = new OpenLayers.Icon(instance.iconPathSelect, size, offset);

                        var marker = new OpenLayers.Marker(lonLat, icon);
                        instance.vectors.clearMarkers();
                        instance.vectors.addMarker(marker);

                        OpenLayers.Element.removeClass(map.viewPortDiv, "olControlLapigCoordenadas");
                        map.events.unregister("click", map, fn);
                    };

                    OpenLayers.Element.addClass(map.viewPortDiv, "olControlLapigCoordenadas");
                    map.events.register("click", map, fn);

                }
            };
        };

        if (!instance.store && !instance.vectors) {
            instance.createPersistenceObj();
        } else {
            instance.vectors.setVisibility(true);
        }

        var rasterSeriesForm = {
            split:true,
            border: false,
            region: 'west',
            collapsible: false,
            width: 225, // give east and west regions a width
            height:215,
            //minSize: 175,
            //maxSize: 400,
            items: {
                border: false,
                xtype: 'form',
                layout: 'form',
                padding: '0px 5px 0px 5px',
                items: [{
                  buttonAlign: 'center',
                  border:false,
                  buttons: [{
                      height:30,
                      width:110,
                      text: 'Selecionar Dados',
                      listeners: {
                        click: function(evt) {
                          win.show(this)
                        }
                      }
                  }],
                },
                {
                  xtype: 'panel',
                  id: 'panel-latlot-fieldset',
                  border: false,
                  //height: '90%',
                  hideLabel: true,
                  anchor:'-1',
                  layout: 'fit',
                  height: 110,
                  padding: 0,
                  disabled: true,
                  html:'teste',
                  items: {
                    xtype: 'fieldset',
                    title: 'Coordenadas Geográficas',
                    items: [
                      {
                        xtype: 'radiogroup',
                        hideLabel: true,
                        items: [{
                          id:'graus-decimais',
                          name: 'graus',
                          boxLabel: 'Graus Decimais',
                          inputValue: 'Graus Decimais',
                          checked: true,
                          listeners: {
                            check: function(evt, checked) {
                              if (checked) {

                                var ddLon = instance.dms2dd(
                                    Ext.getCmp('dms-lon-d').getValue(),
                                    Ext.getCmp('dms-lon-m').getValue(),
                                    Ext.getCmp('dms-lon-s').getValue()
                                );

                                var ddLat = instance.dms2dd(
                                    Ext.getCmp('dms-lat-d').getValue(),
                                    Ext.getCmp('dms-lat-m').getValue(),
                                    Ext.getCmp('dms-lat-s').getValue()
                                );

                                instance.setDd(ddLon, ddLat);

                                Ext.getCmp('dd-panel').show();
                                Ext.getCmp('dms-panel').hide();

                                Ext.getCmp('panel-latlot-fieldset').setHeight(90);
                              }
                            }
                          }
                        }]
                      },

                      {
                        xtype: 'radiogroup',
                        //fieldLabel: 'Tipo',
                        hideLabel: true,
                        items: [{
                          id:'graus-minutos-segundos',
                          name: 'graus',
                          boxLabel: 'Graus Minutos Segundos',
                          inputValue: 'Graus Minutos Segundos',
                          listeners: {
                            check: function(evt, checked) {
                              if (checked) {
                                var ddLon = Ext.getCmp('form-text-lon').value;
                                var ddLat = Ext.getCmp('form-text-lat').value;

                                if (ddLon && ddLat)
                                  instance.setDms(instance.dd2dms(ddLon, ddLat));

                                //Ext.getCmp('dd-panel').hide();
                                Ext.getCmp('dms-panel').doLayout();
                                Ext.getCmp('dms-panel').show();

                                Ext.getCmp('panel-latlot-fieldset').setHeight(110);
                              }
                            }
                          }
                        }]
                      },

                      {
                        layout: 'column',
                        border: false,
                        xtype: 'panel',
                        id: 'dd-panel',
                        items: [
                          getMapCoordBtn(), 
                          {
                            xtype: 'numberfield',
                            id: 'form-text-lon',
                            emptyText: 'Longitude',
                            decimalPrecision: 4,
                            name: 'lon',
                            style: {
                                'width': '75px',
                                'height':'20px',
                                'margin-right': '5px',
                                'text-align': 'right'
                            }
                          },
                          {
                            xtype: 'numberfield',
                            id: 'form-text-lat',
                            emptyText: 'Latitude',
                            decimalPrecision: 4,
                            name: 'lat',
                            style: {
                                'width': '75px',
                                'height':'20px',
                                'text-align': 'right'
                            }
                          }
                        ]
                      },
                    ],
                  }
                }],

                  buttonAlign: 'center',
                  buttons: [{
                    disabled:true,
                    id:'button-consultar',
                    height:30,
                    width:110,
                    text: 'Consultar',
                    handler: function() {
                      var center = new OpenLayers.LonLat(-45, -15).transform(
                        new OpenLayers.Projection("EPSG:4326"),
                        new OpenLayers.Projection("EPSG:900913")
                      );

                      //map.setCenter(center, 4);

                      var iframe = Ext.getDom('raster-series-iframe');
                      if (iframe.contentDocument.getElementById('raster-series-chart')) {
                        iframe.contentDocument.getElementById('raster-series-chart').id = '';
                      }

                      var lat = Ext.getCmp('form-text-lat').getValue();
                      var lon = Ext.getCmp('form-text-lon').getValue();

                      if(!lat && !lon) return;

                      var params = 'lineLayer=' + selectedValueLine + '&barLayer=' + selectedValueBar + '&lat=' + lat + '&lon=' + lon;

                      var lonLat = new OpenLayers.LonLat(lon, lat)
                          .transform(instance.WGS84_PROJ, instance.GOOGLE_PROJ);

                      var size = new OpenLayers.Size(35, 35);
                      var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
                      var icon = new OpenLayers.Icon(instance.iconPathSelect, size, offset);

                      var marker = new OpenLayers.Marker(lonLat, icon);
                      instance.vectors.clearMarkers();
                      instance.vectors.addMarker(marker);

                      iframe.src = '/raster-series?' + params;

                      var msgText = "Isto pode levar alguns minutinhos, relaxe e tome um café... ";

                      var loadMask = new Ext.LoadMask(Ext.getDom('raster-series-panel'), {
                          msg: msgText
                      });
                      loadMask.show();

                      window.iframe2 = iframe;

                      var count = 1;
                      var runner = new Ext.util.TaskRunner();
                      runner.start({
                        run: function() {
                            if (iframe.contentDocument.getElementById('raster-series-chart')) {
                                runner.stopAll();
                                loadMask.hide();
                                Ext.getCmp('southpanel').expand(true);
                            } else {
                                var msg = msgText + count+++" seg.";
                                loadMask.el.mask(msg, loadMask.msgCls);
                            }
                        },
                        interval: 1000
                      });
                    }
                  }]
            },
        }
        return rasterSeriesForm;
    },

    getCenterCmp: function (){
        var centerCmp = {
            border: false,
            region: 'center',
            collapsible: false,
            split: true,
            layout: 'border',
            items: [{
              layout: 'column',
              border: false,
              height:50,
              region:'north',
              items: [{
                columnWidth:.4,
                layout: 'form',
                padding:8,
                border:false,
                style:{
                  'border-bottom':'3px solid #f0f0f0',
                  'border-right':'3px solid #f0f0f0',
                },
                labelWidth:50,
                items: [
                  {
                    xtype: 'compositefield',
                    items: [
                      {
                      xtype:'combo',
                      fieldLabel: 'Período',
                      border: false,
                      value:'Selecione o ano...',
                      flex:1
                      },{
                      xtype:'label',
                      border: false,
                      html:'a',
                      width:10,
                      margins:{top:3, right:0, bottom:0, left:0},
                      flex:1
                      },{
                      xtype:'combo',
                      maxLength:150,
                      border: false,
                      value:'Selecione o ano...',
                      flex:1
                    }],
                  }
                ]
              },
              {
                columnWidth:.4,
                layout: 'form',
                border:false,
                labelWidth:75,
                padding:8,
                style:{
                  'border-bottom':'3px solid #f0f0f0',
                },
                items: [
                  {
                    xtype: 'compositefield',
                    items: [
                      {
                      xtype:'combo',
                      fieldLabel: 'Interpolação',
                      value:'Selecione...',
                      flex: 1
                    }],
                  }
                ]
              },
              {
                columnWidth:.2,
                layout: 'column',
                height:45,
                border:false,
                style:{
                  'border-bottom':'3px solid #f0f0f0',
                  'border-left':'3px solid #f0f0f0',
                },
                padding:8,
                items: [
                      {
                        columnWidth:.5,
                        xtype:'button',
                        text: 'CSV',
                        style:{
                          'margin-right':'10px',
                          //'padding-left':'1px',
                        },
                        flex:1,
                        listeners: {
                        }
                      },{
                        columnWidth:.5,
                        xtype:'button',
                        text: 'PNG',
                        style:{
                        'margin-left':'10px',
                        },
                        flex:1,
                        listeners: {
                        }
                      }
                ],
              }],
            },
            {
              region: 'center',
              border: false,
              xtype: 'form',
              //padding: '0px 5px 0px 5px',
              items: [{
                buttonAlign: 'center',
                readOnly: true,
                border:false,
                buttons: [{
                  text: 'Area do Grafico',
                  listeners: {
                      click: function(evt) {
                        win.show(this)
                      }
                  }
                }],
              }],
            }],
        }
        return centerCmp;
    },

    getEastCmp: function (){
      var eastCmp = {
            border: false,
            region: 'east',
            collapsible: true,
            title:'Estatisticas',
            split: true,
            width:225,
            height:215,
            minSize: 175,
            maxSize: 400,
                items: [{
                  xtype:'label',
                html:'Teste'}],
        }
        return eastCmp;
    },

    createOutputConfig: function() {
        return {
            xtype: "panel",
            layout: 'border',
            id: 'raster-series-panel',
            border: false,
            height: 215,
            items: [
                this.getWestCmp(), 
                this.getCenterCmp(),
                this.getEastCmp(),
            ]
        };
    }
});

Ext.preg(gxp.plugins.LapigRasterSeries.prototype.ptype, gxp.plugins.LapigRasterSeries);