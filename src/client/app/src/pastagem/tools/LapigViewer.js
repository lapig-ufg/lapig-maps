 /**
 *
 * @require OpenLayers/Control/MousePosition.js
 *
 * @require plugins/RemoveLayer.js
 * @require widgets/Viewer.js
 *
 * @require plugins/Measure.js 
 * @require plugins/Zoom.js 
 * @require plugins/Navigation.js 
 * @require plugins/NavigationHistory.js 
 * @require plugins/Print.js
 * @require plugins/GoogleGeocoder.js
 * @require plugins/ZoomToLayerExtent.js
 * @require plugins/WMSGetFeatureInfo.js
 *
 * @require plugins/MapBoxSource.js
 * @require plugins/MapQuestSource.js
 * @require plugins/BingSource.js
 * @require plugins/GoogleSource.js
 * @require plugins/WMSCSource.js
 *
 * @require tools/LapigAddLayer.js
 * @require tools/LapigPrint.js
 * @require tools/LapigDownload.js
 * @require tools/LapigDownload.js
 * @require tools/LapigMetadata.js
 * @require tools/LapigGoogleSatellite.js
 * @require tools/LapigCoordinates.js
 * @require tools/LapigLayerManager.js
 * @require tools/LapigWMSCSource.js
 * @require tools/LapigZoom.js
 * @require tools/LapigRasterSeries.js
 * @require tools/LapigSpatialIntelligence.js
 * @require tools/LapigSpatialIntelligenceBtn.js
 * @require tools/LapigRasterSeriesBtn.js
 * @require tools/LapigWMSGetFeatureInfo.js
 * @require tools/LapigDownloadAll.js
 *
 */

Ext.namespace("gxp");

Ext.layout.BorderLayout.Region.prototype.getCollapsedEl = Ext.layout.BorderLayout.Region.prototype.getCollapsedEl.createSequence(function() {
    if ((this.position == 'north' || this.position == 'south') && !this.collapsedEl.titleEl) {
        this.collapsedEl.titleEl = this.collapsedEl.createChild({style: 'text-align:right;color:#15428b;font:11px/15px tahoma,arial,verdana,sans-serif;padding:2px 5px;', cn: this.panel.title});
    }
});

gxp.LapigViewer = Ext.extend(gxp.Viewer, {
    
    constructor: function(userLayers, lon, lat, zoomLevel, project) {
      
      var instance = this;

      Ext.Ajax.request({
        url: '/layers',
        method: 'POST',
        jsonData: { "basepaths": layers },
        success: function(response) {
          var layers = JSON.parse(response.responseText);
          var config = instance.createLapigConfig(layers, lon, lat, zoomLevel, project);
          gxp.LapigViewer.superclass.constructor.apply(instance, [config]);
        }
      });
    },

    createLapigConfig: function(userLayers, lon, lat, zoomLevel, project) {
      var layers = [
            {
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
            ,{
              source: "google",
              title: "Google Terrain",
              name: "TERRAIN",
              group: "background"
            }
            ,{
              source: "google",
              title: "Google Satellite",
              name: "SATELLITE",
              group: "background"
            }
            ,{
              source: "google",
              title: "Google Roadmap",
              name: "ROADMAP",
              group: "background"
            }
            ,{
              source: "bing",
              title: "Bing Roads",
              name: "Road",
              group: "background"
            }
            ,{
              source: "bing",
              title: "Bing Satellite",
              name: "Aerial",
              group: "background"
            }
      ]

      for (i in userLayers) {
        userLayers[i].source = 'ows';
        if(userLayers[i].last_name) {
          userLayers[i].name = userLayers[i].last_name;
        } else {
          userLayers[i].name = userLayers[i].basepath;
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
                  width: 320,
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
                  height: 240,
                  collapsed: true,
                  collapsible: true,
                  collapseMode: "mini",
                  header: true,
                  title: 'Análise de Séries Temporais',
                  autoScroll: true
                },
                {
                  id: "eastpanel",
                  border: false,
                  region: "east",
                  width: 330,
                  split: true,
                  collapsed: true,
                  collapsible: true,
                  collapseMode: "mini",
                  header: true,
                  layout:'fit',
                  title: 'Análise de Informações Territoriais',
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
              overlayNodeText: "Camadas",
              baseNodeText: "Mapa Base", 
              outputConfig: {
                id: "tree",
                title: "Camadas",
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
                height: 215,
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
              menuText: "Download da camada",
              actionTarget: ["tree.contextMenu"]
            },
            {
              ptype: "gxp_lapigdownloadall",
              menuText: "Download de toda série temporal",
              actionTarget: ["tree.contextMenu"]
            },
            {
              ptype: "gxp_zoomtolayerextent",
              menuText: "Zoom na camada",
              actionTarget: {target: "tree.contextMenu"}
            },
            {
              ptype: "gxp_removelayer",
              removeMenuText: "Remover camada",
              actionTarget: ["tree.contextMenu"]
            },
            
            /********** Tree Toolbar */
            {
              ptype: "gxp_lapigaddlayer",
              actionTarget: "tree.tbar",
              addActionText: "Camadas",
              project: project
            },
            {
              ptype: "gxp_lapigdownload",
              menuText: "Download",
              actionTarget: ["tree.tbar"]
            },

            /********** Map ContextMenu */
            {
              ptype: "gxp_lapigprint",
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "gxp_lapigcoordinates",
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "lapig_spatialintelligencebtn",
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "gxp_lapigrasterseriesbtn",
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "gxp_navigationhistory",
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "gxp_lapigzoom",
              showZoomBoxAction: true,
              actionTarget: {target: "map.tbar"}
            }, 
            {
              ptype: "gxp_lapigwmsgetfeatureinfo", format: 'grid', toggleGroup: this.toggleGroup,
              popupTitle: "Informações", infoActionTip: "Informações das Feições",
              actionTarget: {target: "map.tbar"}
            },
            {
              ptype: "gxp_navigation", toggleGroup: this.toggleGroup,
              actionTarget: {target: "map.tbar"}
            },
          ],
          defaultSourceType: "gxp_lapigwmscsource",
          sources: {
            ows: {
              url: '/ows/',
              title: "LAPIG-OWS"
            },
            mapquest: {
              ptype: "gxp_mapquestsource",
              title: "Mapas de fundo (MapQuest)"
            },
            google: {
              ptype: "gxp_googlesource",
              title: "Mapas de fundo (Google)"
            },
            bing: {
              ptype: "gxp_bingsource",
              apiKey: "AgGtGpUH9SjzBV5Cf6ZSRIDws0e2nSaLxZwPvx3uWSxV5wz43AxMzBHMSa9eiWdx"
            },
            mapbox: {
              ptype: "gxp_mapboxsource",
              title: "Mapas de fundo (MapBox)"
            }
          },
          map: {
            id: "mymap",
            title: "Mapa",
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
                  mapPanel.map.addControl(mousePositionCtrl)  
                }

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

                    if(layer instanceof OpenLayers.Layer.WMS)
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