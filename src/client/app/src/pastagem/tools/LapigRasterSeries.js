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

    getForm: function() {
        var fm = Ext.form;
        var instance = this;
        var map = this.target.mapPanel.map;
        var selectedValueLine = '';
        var selectedValueBar = '';

        var getMapCoordBtn = function() {
            return {
                columnWidth: .10,
                rowspan: 2,
                xtype: 'button',
                icon: 'theme/app/img/add-latlon-map.png',
                height: 10,
                tooltip: 'Clique em uma região do mapa para preencher a Latitude e Longitude.',
                style: {
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
            columnWidth: .20,
            border: false,
            items: {
                border: false,
                xtype: 'form',
                layout: 'form',
                padding: '0px 5px 0px 5px',
                items: [{
                    id: 'form-combo-line',
                    xtype: 'combo',
                    hideLabel: true,
                    anchor:'-1',
                    store: {
                        xtype: 'arraystore',
                        fields: ['id', 'label'],
                        data: [
                            ['', 'Nenhuma série temporal'],
                            ['EVAPOTRANSPIRATION', 'Evapotranspiração'],
                            ['NORMALIZED_EVAPOTRANSPIRATION', 'Evapotranspiração Normalizada'],
                            ['POTENTIAL_EVAPOTRANSPIRATION', 'Evapotranspiração Potencial'],
                            ['EVI', 'Índice de vegetação (EVI)'],
                            ['EVI2', 'Índice de vegetação (EVI-2)'],
                            ['PRECIPITATION', 'Precipitação'],
                            ['FPAR', 'Radiação Fotossinteticamente Ativa (MODIS15A2 / FPAR)'],
                            ['LST', 'Temperatura de superfície (MODIS11A2 / LST)'],
                            ['EWT', 'Variação Gravimétrica da Água (GRACE / EWT)']
                        ]
                    },
                    displayField: 'label',
                    typeAhead: true,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    emptyText: 'Série temporal (Gráfico de Linha)',
                    selectOnFocus: true,
                    listeners: {
                        select: function(combo, value) {
                            selectedValueLine = value.data.id;
                        }
                    }
                }, {
                    id: 'form-combo-bar',
                    xtype: 'combo',
                    hideLabel: true,
                    anchor:'-1',
                    store: {
                        xtype: 'arraystore',
                        fields: ['id', 'label'],
                        data: [
                            ['', 'Nenhuma série temporal'],
                            ['EVAPOTRANSPIRATION', 'Evapotranspiração'],
                            ['NORMALIZED_EVAPOTRANSPIRATION', 'Evapotranspiração Normalizada'],
                            ['POTENTIAL_EVAPOTRANSPIRATION', 'Evapotranspiração Potencial'],
                            ['EVI', 'Índice de vegetação (EVI)'],
                            ['EVI2', 'Índice de vegetação (EVI-2)'],
                            ['PRECIPITATION', 'Precipitação'],
                            ['FPAR', 'Radiação Fotossinteticamente Ativa (MODIS15A2 / FPAR)'],
                            ['LST', 'Temperatura de superfície (MODIS11A2 / LST)'],
                            ['EWT', 'Variação Gravimétrica da Água (GRACE / EWT)']
                        ]
                    },
                    displayField: 'label',
                    typeAhead: true,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    emptyText: 'Série temporal (Gráfico de barras)',
                    selectOnFocus: true,
                    listeners: {
                        select: function(combo, value) {
                            selectedValueBar = value.data.id;
                        }
                    }
                }, {
                    xtype: 'panel',
                    id: 'panel-latlot-fieldset',
                    border: false,
                    height: '90%',
                    hideLabel: true,
                    anchor:'-1',
                    layout: 'fit',
                    height: 90,
                    padding: 0,
                    items: {
                        xtype: 'fieldset',
                        title: 'Coordenadas Geográficas',
                        items: [{
                            xtype: 'radiogroup',
                            //fieldLabel: 'Tipo',
                            hideLabel: true,
                            items: [{
                                name: 'graus',
                                boxLabel: 'DD',
                                inputValue: 'DD',
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
                            }, {
                                name: 'graus',
                                boxLabel: 'DMS',
                                inputValue: 'DMS',
                                listeners: {
                                    check: function(evt, checked) {
                                        if (checked) {

                                            var ddLon = Ext.getCmp('form-text-lon').value;
                                            var ddLat = Ext.getCmp('form-text-lat').value;

                                            if (ddLon && ddLat)
                                                instance.setDms(instance.dd2dms(ddLon, ddLat));

                                            Ext.getCmp('dd-panel').hide();
                                            Ext.getCmp('dms-panel').doLayout();
                                            Ext.getCmp('dms-panel').show();

                                            
                                            Ext.getCmp('panel-latlot-fieldset').setHeight(110);
                                        }
                                    }
                                }
                            }]
                        }, {
                            layout: 'column',
                            border: false,
                            xtype: 'panel',
                            id: 'dd-panel',
                            items: [
                                getMapCoordBtn(), {
                                    columnWidth: .40,
                                    xtype: 'numberfield',
                                    id: 'form-text-lon',
                                    emptyText: 'Longitude',
                                    decimalPrecision: 4,
                                    name: 'lon',
                                    style: {
                                        'margin-right': '10px',
                                        'text-align': 'right'
                                    }
                                }, {
                                    columnWidth: .40,
                                    xtype: 'numberfield',
                                    id: 'form-text-lat',
                                    emptyText: 'Latitude',
                                    decimalPrecision: 4,
                                    name: 'lat',
                                    style: {
                                        'text-align': 'right'
                                    }

                                }
                            ]
                        }, {
                            xtype: 'panel',
                            baseCls: 'x-plain',
                            layout: 'table',
                            id: 'dms-panel',
                            //hidden: true,
                            layoutConfig: {
                                columns: 7
                            },
                            items: [
                                getMapCoordBtn(), {
                                    xtype: 'numberfield',
                                    decimalPrecision: 0,
                                    width: 30,
                                    id: 'dms-lon-d'
                                }, {
                                    xtype: 'label',
                                    text: '°'
                                }, {
                                    xtype: 'numberfield',
                                    decimalPrecision: 0,
                                    width: 30,
                                    id: 'dms-lon-m'
                                }, {
                                    xtype: 'label',
                                    text: "'"
                                }, {
                                    xtype: 'numberfield',
                                    decimalPrecision: 4,
                                    width: 60,
                                    id: 'dms-lon-s'
                                }, {
                                    xtype: 'label',
                                    text: '"'
                                }, {
                                    xtype: 'numberfield',
                                    decimalPrecision: 0,
                                    width: 30,
                                    id: 'dms-lat-d'
                                }, {
                                    xtype: 'label',
                                    text: '°'
                                }, {
                                    xtype: 'numberfield',
                                    decimalPrecision: 0,
                                    width: 30,
                                    id: 'dms-lat-m'
                                }, {
                                    xtype: 'label',
                                    text: "'"
                                }, {
                                    xtype: 'numberfield',
                                    decimalPrecision: 4,
                                    width: 60,
                                    id: 'dms-lat-s'
                                }, {
                                    xtype: 'label',
                                    text: '"'
                                }
                            ]
                        }]
                    }
                }, {
                    checked: true,
                    boxLabel: 'Mostrar coordenada no mapa',
                    hideLabel: true,
                    xtype: "checkbox",
                    listeners: {
                        check: function(evt, checked) {
                        		instance.vectors.setVisibility(checked);
                        }
                    }
                }],
                buttonAlign: 'center',
                buttons: [{
                    text: 'Gerar gráfico',
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
            }
        }

        return rasterSeriesForm;
    },

    createOutputConfig: function() {
        return {
            xtype: "panel",
            layout: 'column',
            id: 'raster-series-panel',
            border: false,
            items: [
                this.getForm(), {
                    xtype: "panel",
                    columnWidth: .80,
                    border: false,
                    //margin: 10,
                    style: {
                        'height': '200px'
                    },
                    autoEl: {
                        tag: "iframe",
                        id: 'raster-series-iframe'
                    }
                }
            ]
        };
    }
});

Ext.preg(gxp.plugins.LapigRasterSeries.prototype.ptype, gxp.plugins.LapigRasterSeries);