 /**
 *
 * @requires OpenLayers/Control/MousePosition.js
 *
 * @requires plugins/RemoveLayer.js
 * @requires widgets/Viewer.js
 *
 * @requires plugins/Measure.js 
 * @requires plugins/Zoom.js 
 * @requires plugins/Navigation.js 
 * @requires plugins/NavigationHistory.js 
 * @requires plugins/Print.js
 * @requires plugins/GoogleGeocoder.js
 * @requires plugins/ZoomToLayerExtent.js
 * @requires plugins/WMSGetFeatureInfo.js
 *
 * @requires plugins/LayerSource.js
 * @requires plugins/TMSSource.js
 * @requires plugins/MapBoxSource.js
 * @requires plugins/MapQuestSource.js
 * @requires plugins/BingSource.js
 * @requires plugins/GoogleSource.js
 * @requires plugins/WMSCSource.js
 * @requires plugins/WMTSSource.js
 *
 * @requires tools/LapigAddLayer.js
 * @requires tools/LapigAnalytics.js
 * @requires tools/LapigPrint.js
 * @requires tools/LapigLayerLink.js
 * @requires tools/LapigDownload.js
 * @requires tools/LapigMetadata.js
 * @requires tools/LapigGeoCampo.js
 * @requires tools/LapigGoogleSatellite.js
 * @requires tools/LapigCoordinates.js
 * @requires tools/LapigLayerManager.js
 * @requires tools/LapigWMSCSource.js
 * @requires tools/LapigZoomToLayerExtent.js
 * @requires tools/LapigTMSSource.js
 * @requires tools/LapigZoom.js
 * @requires tools/LapigRasterSeries.js
 * @requires tools/LapigSpatialIntelligence.js
 * @requires tools/LapigSpatialIntelligenceBtn.js
 * @requires tools/LapigRasterSeriesBtn.js
 * @requires tools/LapigWMSGetFeatureInfo.js
 * @requires tools/LapigDownloadAll.js
 * @requires tools/LapigLogin.js
 * @requires tools/LapigUtils.js
 * @requires tools/LapigLogos.js
 */

globalInstance = this;

Ext.namespace("gxp");

Ext.layout.BorderLayout.Region.prototype.getCollapsedEl = Ext.layout.BorderLayout.Region.prototype.getCollapsedEl.createSequence(function() {
    if ((this.position == 'north' || this.position == 'south') && !this.collapsedEl.titleEl) {
        this.collapsedEl.titleEl = this.collapsedEl.createChild({style: 'text-align:right;color:#15428b;font:11px/15px tahoma,arial,verdana,sans-serif;padding:2px 5px;', cn: this.panel.title});
    }
});

gxp.LapigViewer = Ext.extend(gxp.Viewer, {
    
    constructor: function(userLayers, lon, lat, zoomLevel, project) {

      var instance = this;

      instance.lon = lon;
      instance.lat = lat;
      instance.project = project;
      instance.zoomLevel = zoomLevel;
      instance.userLayers = userLayers;

      instance.init();
    },

    init: function() {
      var instance = this;

      var language = instance.getLang();
      var basepaths = instance.getLayers();
      
      var project = instance.project;
      
      var lon = instance.getLon();
      var lat = instance.getLat();
      var zoomLevel = instance.getZoom();

      Ext.Ajax.request({
        url: '/layers',
        method: 'POST',
        jsonData: { "basepaths": basepaths, "language": language },
        success: function(response) {
          var result = JSON.parse(response.responseText);
          
          globalInstance.i18n = result.lang;
          globalInstance.isAnyoneHome = false;
          globalInstance.lapigAnalytics = gxp.plugins.LapigAnalytics;
          globalInstance.Utils = lapigUtils;
          i18n.lang = language;

          var config = instance.createLapigConfig(result.layers, lon, lat, zoomLevel, project);
          gxp.LapigViewer.superclass.constructor.apply(instance, [config]);
        }
      });
    },

    getURLParams: function() {
      var getParams = document.URL.split("?");
      return Ext.urlDecode(getParams[getParams.length - 1]);
    },

    getZoom: function() {
      
      var instance = this;
      var params = instance.getURLParams();
      
      if(params.zoom) {
        return params.zoom.split(',');
      } else {
        return instance.zoomLevel
      }
    },

    getLat: function() {
      
      var instance = this;
      var params = instance.getURLParams();
      
      if(params.lat) {
        return params.lat.split(',');
      } else {
        return instance.lat
      }
    },

    getLon: function() {
      
      var instance = this;
      var params = instance.getURLParams();
      
      if(params.lon) {
        return params.lon.split(',');
      } else {
        return instance.lon
      }
    },

    getLayers: function() {
      
      var instance = this;
      var params = instance.getURLParams();
      
      if(params.layers) {
        var layers = params.layers.split(',');
        layers.push('pa_br_estados_250_2013_ibge');
        return layers;
      } else {
        return instance.userLayers
      }
    },

    getLang: function() {
      
      var instance = this;
      var params = instance.getURLParams();

      if (params.lang) {
        return params.lang;
      } else if(navigator.browserLanguage) {
        return navigator.browserLanguage.toLowerCase();    
      }
      else if(navigator.language) {
        return navigator.language.toLowerCase();
      }
    },

    createLapigConfig: function(userLayers, lon, lat, zoomLevel, project) {
      var layers = [
            /*{
              source: "mapquest",
              title: "MapQuest Imagery",
              name: "naip",
              group: "background"
            }
            ,{
              source: "mapbox",
              title: "Natural Earth |",
              name: "natural-earth-1",
              group: "background"
            }
            ,{
              source: "mapbox",
              title: "Natural Earth ||",
              name: "natural-earth-2",
              group: "background"
            }
            ,*/{
              source: "bing",
              title: "Bing Satellite",
              name: "Aerial",
              group: "background"
            },
            {
              source: "bing",
              title: "Bing Roads",
              name: "Road",
              group: "background"
            }
            /*,{
              source: "google",
              title: "Google Terrain",
              name: "TERRAIN",
              group: "background"
            }
            ,{
              source: "google",
              title: "Google Roadmap",
              name: "ROADMAP",
              group: "background"
            }
            ,{
              source: "google",
              title: "Google Satellite",
              name: "SATELLITE",
              group: "background"
            }*/
      ]

      for (i in userLayers) {
        userLayers[i].source = 'ows';
        if(userLayers[i].last_name) {
          userLayers[i].oldName = userLayers[i].name;
          userLayers[i].name = userLayers[i].last_name;
        } else {
          userLayers[i].oldName = userLayers[i].name;
          userLayers[i].name = userLayers[i]._id;
        }
      }

      var layers = layers.concat(userLayers);

      var center = new OpenLayers.LonLat(lon, lat).transform(
          new OpenLayers.Projection("EPSG:4326"), 
          new OpenLayers.Projection("EPSG:900913")
      );

      return {
          portalConfig: {
            layout: "border",
            region: "center",
            items: [
                {
                  id: "centerpanel",
                  xtype: "panel",
                  layout: "fit",
                  region: "center",
                  border: false,
                  items: ["mymap"]
                },
                {
                  id: "westpanel",
                  border: false,
                  region: "west",
                  width: 350,
                  split: true,
                  collapsible: true,
                  collapseMode: "mini",
                  header: false,
                  autoScroll: true
                },
                {
                  id: "southpanel",
                  border: false,
                  region: "south",
                  collapsed: true,
                  collapsible: true,
                  collapseMode: "mini",
                  autoHeight:true,
                  header: true,
                  title: i18n.LAPIGVIEWER_TTL_TOOL_TIME_SERIES,
                  autoScroll: true,
                  listeners: {
                    beforeexpand: function (pnl, animate) {
                      // var flashProperties = lapigUtils.checkFlashVersion();
                      // if (!flashProperties.hasFlash) {
                      //   Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_TXT_ALERTATTENCION, i18n.LAPIGRASTERSERIES_ALERT_ERROR_NOFLASH);
                      //   return false;
                      // }
                    }
                  }
                },
                {
                  id: "eastpanel",
                  border: false,
                  region: "east",
                  width: 350,
                  split: false,
                  collapsed: true,
                  collapsible: true,
                  collapseMode: "mini",
                  header: true,
                  layout:'fit',
                  title: i18n.LAPIGVIEWER_TTL_TOOL_TERRITORIAL_INFORMATIONS
                }
            ],
            bbar: {
              id: "mybbar"
            }
          },
          tools: [
            /********** Border layout regions */
            {
              ptype: "gxp_lapiglayermanager",
              overlayNodeText: i18n.LAPIGVIEWER_LAYERMANAGER_OVERLAYNODETEXT,
              baseNodeText: i18n.LAPIGVIEWER_LAYERMANAGER_BASENODETEXT, 
              outputConfig: {
                id: "tree",
                title: i18n.LAPIGVIEWER_TTL_LAYER,
                border: false,
                tbar: []
              },
              outputTarget: "westpanel",
              id: 'map-layer-manager'
            },
            { 
              ptype: "lapig_rasterseries",
              outputTarget: "southpanel",
              project: project,
              outputConfig: {
                height: 380
              }
            },
            { 
              ptype: "lapig_spatialintelligence",
              outputTarget: "eastpanel",
              project: project,
              outputConfig: {}
            },

            /********** Tree ContextMenu */
            {
              ptype: "gxp_lapigdownload",
              menuText: i18n.LAPIGVIEWER_DOWNLOAD_MENUTXT,
              actionTarget: ["tree.contextMenu"]
            },
            {
              ptype: "gxp_lapigdownloadall",
              menuText: i18n.LAPIGVIEWER_DOWNLOADALL_MENUTXT,
              actionTarget: ["tree.contextMenu"]
            },
            {
              ptype: "gxp_lapigzoomtolayerextent",
              menuText: i18n.LAPIGVIEWER_ZOOMTOLAYEREXTENT_MENUTXT,
              actionTarget: {target: "tree.contextMenu"}
            },
            {
              ptype: "gxp_removelayer",
              removeMenuText: i18n.LAPIGVIEWER_REMOVELAYER_RMVMENUTXT,
              actionTarget: ["tree.contextMenu"]
            },
            {
              ptype: "gxp_lapiglayerlink",
              menuText: i18n.LAPIGLAYERLINK_MENUTEXT,
              actionTip: i18n.LAPIGLAYERLINK_TIPTEXT,
              actionTarget: ["tree.contextMenu"]
            },

            /********** Tree Toolbar */
            {
              ptype: "gxp_lapigaddlayer",
              actionTarget: "tree.tbar",
              text: i18n.LAPIGVIEWER_ADDLAYER_BTNTXT,
              tooltip: i18n.LAPIGVIEWER_ADDLAYER_TLTP,
              project: project
            },
            {
              ptype: "gxp_lapiggeocampo",
              actionTarget: "tree.tbar",
              text: i18n.LAPIGVIEWER_GEOCAMPO_BTNTXT,
              tooltip: i18n.LAPIGVIEWER_GEOCAMPO_TLTP
            },
            {
              ptype: "gxp_lapigdownload",
              menuText: i18n.LAPIGVIEWER_DOWNLOAD_BTNMENUTXT,
              actionTarget: ["tree.tbar"],
              tooltip: i18n.LAPIGVIEWER_DOWNLOAD_TLTP
            },

            /********** Map ContextMenu */
            {
              ptype: "lapig_spatialintelligencebtn",
              menuText: i18n.LAPIGVIEWER_SPATIALINTELLIGENCEBTN_MENUTXT,
              actionTip: i18n.LAPIGVIEWER_SPATIALINTELLIGENCEBTN_ACTTIP,
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "gxp_lapigrasterseriesbtn",
              MenuText: i18n.LAPIGVIEWER_RASTERSERIESBTN_MENUTXT,
              Tooltip: i18n.LAPIGVIEWER_RASTERSERIESBTN_TLTP,
              actionTarget: {target: "map.tbar"}
            },
            { 
              actionTarget: { target: "map.tbar" },
              actions: {
                text: "-"
              }
            },
            {
              ptype: "gxp_lapigprint",
              actionTarget: {target: "map.tbar"},
              tooltip: i18n.LAPIGVIEWER_PRINT_TLTP
            },
            {
              ptype: "gxp_lapigcoordinates",
              tooltip: i18n.LAPIGVIEWER_COORDINATES_TLTP,
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "gxp_lapigwmsgetfeatureinfo", 
              format: 'grid', 
              toggleGroup: this.toggleGroup,
              popupTitle: i18n.LAPIGVIEWER_WMSGETFEATUREINFO_POPUPTTL, 
              infoActionTip: i18n.LAPIGVIEWER_WMSGETFEATUREINFO_INFOACTTIP,
              actionTarget: {target: "map.tbar"},
              layerParams: ['MSFILTER']
            },
            { 
              actionTarget: { target: "map.tbar" },
              actions: {
                text: "-"
              }
            },
            {
              ptype: "gxp_navigationhistory",
              previousMenuText: i18n.LAPIGVIEWER_NAVIGATIONHISTORY_PREVMENUTXT,
              previousTooltip: i18n.LAPIGVIEWER_NAVIGATIONHISTORY_PREVTLTP,
              nextMenuText: i18n.LAPIGVIEWER_NAVIGATIONHISTORY_NEXTMENUTXT,
              nextTooltip: i18n.LAPIGVIEWER_NAVIGATIONHISTORY_NEXTTLTP,
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "gxp_lapigzoom",
              zoomMenuText: i18n.LAPIGVIEWER_ZOOM_ZMMENUTXT,
              zoomOutMenuText: i18n.LAPIGVIEWER_ZOOM_ZMOUTMENUTXT,
              zoomTooltip: i18n.LAPIGVIEWER_ZOOM_ZMTLP,
              zoomInTooltip: i18n.LAPIGVIEWER_ZOOM_ZMINTLP,
              zoomOutTooltip: i18n.LAPIGVIEWER_ZOOM_ZMOUTTLP,
              showZoomBoxAction: true,
              actionTarget: {target: "map.tbar"}
            }, 
            {
              ptype: "gxp_navigation", 
              tooltip: i18n.LAPIGVIEWER_NAVIGATION_TLTP,
              toggleGroup: this.toggleGroup,
              actionTarget: {target: "map.tbar"}
            },
            { 
              actionTarget: { target: "map.tbar", index: 18 },
              actions: {
                text: "->"
              }
            },
            {
              ptype: "gxp_lapiglogin",
              actionTarget: { target: "map.tbar", index: 19 }
            }
          ],
          defaultSourceType: "gxp_lapigtmssource",
          sources: {
            ows: {
              url: '/ows/',
              title: "LAPIG-OWS"
            },
            /*mapquest: {
              ptype: "gxp_mapquestsource",
              title: "Mapas de fundo (MapQuest)"
            },*/
            /*google: {
              ptype: "gxp_googlesource",
              title: "Mapas de fundo (Google)",
              otherParams: "sensor=false&key=AIzaSyBb80nS_pkxIfNOhI8MwDsQBqORW2FZ4as"
            },*/
            bing: {
              ptype: "gxp_bingsource",
              apiKey: "VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY"
            },
            mapbox: {
              ptype: "gxp_mapboxsource",
              title: "Mapas de fundo (MapBox)"
            }
          },
          map: {
            id: "mymap",
            title: i18n.LAPIGVIEWER_TTL_MAP,
            projection: "EPSG:900913",
            units: "m",
            center: [center.lon,center.lat],
            zoom: zoomLevel,
            layers: layers,
            items: [
              {
                xtype: "gx_zoomslider",
                vertical: true,
                height: 100
              }
            ]
          },
          listeners: {
            'ready': function() {
                mapPanel = Ext.getCmp("mymap");

                var addMapControls = function() {
                  var mousePositionCtrl = new OpenLayers.Control.MousePosition({
                      displayProjection: new OpenLayers.Projection("EPSG:4326")
                  });
                  mapPanel.map.addControl(mousePositionCtrl);
                }

                /*mapPanel.map.events.register('addlayer', this, function(evt) {
                  if(evt.layer) {
                    evt.layer.events.register('loadend', this, function() {
                      console.log('loadend', arguments);
                    });
                  }
                });*/

                addMapControls();
            }
          }
      }
    },

    addLayers: function() {
        var mapConfig = this.initialConfig.map;
        if(mapConfig && mapConfig.layers) {
            var conf, source, record, baseRecords = [], overlayRecords = [];
            for (var i=0; i<mapConfig.layers.length; ++i) {
                conf = mapConfig.layers[i];
                source = this.layerSources[conf.source];
                // source may not have loaded properly (failure handled elsewhere)
                if (source) {
                    record = source.createLayerRecord(conf);
                    if (record) {
                        if (record.get("group") === "background") {
                            baseRecords.push(record);
                        } else {
                            overlayRecords.push(record);
                        }
                    }
                } else if (window.console) {
                    console.warn("Non-existing source '" + conf.source + "' referenced in layer config.");
                } 
            }
            
            var panel = this.mapPanel;
            var map = panel.map;
            
            var records = baseRecords.concat(overlayRecords);
            if (records.length) {
                var baseRec = [];
                var markerRec = [];
                var wmsRec = [];

                var orderRec = [];

                records.forEach(function(rec) {
                    var layer = rec.data.layer;
                    
                    if(layer instanceof OpenLayers.Layer.XYZ)
                        wmsRec.push(rec)
                    else if(layer instanceof OpenLayers.Layer.Markers)
                        markerRec.push(rec)
                    else
                        baseRec.push(rec)
                    
                })
                
                baseRec.forEach(function(layer) {
                    orderRec.push(layer);
                })
                
                wmsRec.forEach(function(layer) {
                    orderRec.push(layer);
                })
                
                markerRec.forEach(function(layer) {
                    orderRec.push(layer);
                })

                panel.layers.add(orderRec);
            }
            
        }        
    }
});