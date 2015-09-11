/**
 * Add all your dependencies here.
 *
 * @require OpenLayers/Control/MousePosition.js
 *
 * @require plugins/RemoveLayer.js
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
 * @require tools/LapigViewer.js
 * @require tools/LapigAddLayer.js
 * @require tools/LapigPrint.js
 * @require tools/LapigDownload.js
 * @require tools/LapigDownload.js
 * @require tools/LapigMetadata.js
 * @require tools/LapigGoogleSatellite.js
 * @require tools/LapigCoordenadas.js
 * @require tools/LapigPublicacoes.js
 * @require tools/LapigLayerManager.js
 * @require tools/LapigWMSCSource.js
 * @require tools/LapigZoom.js
 * @require tools/LapigRasterSeries.js
 * @require tools/LapigRasterSeriesBtn.js
 * @require tools/LapigWMSGetFeatureInfo.js
 *
 */

Ext.layout.BorderLayout.Region.prototype.getCollapsedEl = Ext.layout.BorderLayout.Region.prototype.getCollapsedEl.createSequence(function() {
	if ((this.position == 'north' || this.position == 'south') && !this.collapsedEl.titleEl) {
		this.collapsedEl.titleEl = this.collapsedEl.createChild({style: 'text-align:right;color:#15428b;font:11px/15px tahoma,arial,verdana,sans-serif;padding:2px 5px;', cn: this.panel.title});
	}
});

var center = new OpenLayers.LonLat(-45, -15).transform(
												new OpenLayers.Projection("EPSG:4326"), 
												new OpenLayers.Projection("EPSG:900913")
);

var app = new gxp.LapigViewer({
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
					}
				, {
						id: "westpanel",
						border: false,
						region: "west",
						width: 300,
						split: true,
						collapsible: true,
						collapseMode: "mini",
						header: false,
						autoScroll: true
					}
				,	{
						id: "southpanel",
						border: false,
						region: "south",
            height: 240,
            collapsed: false,
            collapsible: true,
            header: true,
            title: 'Análise de Séries Temporais',
            autoScroll: true
					}
				],
				bbar: {id: "mybbar"}
		},
		tools: [
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
			}
			,	{ 
				ptype: "gxp_lapigrasterseries",
				outputTarget: "southpanel"
			}
			, {
					ptype: "gxp_lapigaddlayer",
					actionTarget: "tree.tbar",
					addActionText: "Camadas",
			}
			, {
					ptype: "gxp_lapigdownload",
					menuText: "Download da camada",
					actionTarget: ["tree.contextMenu"]
			}
			, {
					ptype: "gxp_lapigdownload",
					menuText: "Download",
					actionTarget: ["tree.tbar"]
			}
			, {
					ptype: "gxp_zoomtolayerextent",
					menuText: "Zoom na camada",
					actionTarget: {target: "tree.contextMenu", index: 15}
			}
			, {
					ptype: "gxp_removelayer",
					removeMenuText: "Remover camada",
					actionTarget: ["tree.contextMenu"]
			}
			, {
					ptype: "gxp_navigation", toggleGroup: this.toggleGroup,
					actionTarget: {target: "map.tbar", index: 6}
			}
			, {
					ptype: "gxp_lapigwmsgetfeatureinfo", format: 'grid', toggleGroup: this.toggleGroup,
					popupTitle: "Informações", infoActionTip: "Informações das Feições",
					actionTarget: {target: "map.tbar", index: 7}
			}
			/*, {
					ptype: "gxp_measure", toggleGroup: this.toggleGroup,
					controlOptions: {immediate: true},
					actionTarget: {target: "map.tbar", index: 10}
			}*/
			, {
					ptype: "gxp_lapigzoom",
					showZoomBoxAction: true,
					actionTarget: {target: "map.tbar", index: 11}
			}
			, {
					ptype: "gxp_navigationhistory",
					actionTarget: {target: "map.tbar", index: 13}
			}
			, {
					ptype: "gxp_lapigrasterseriesbtn",
					actionTarget: {target: "map.tbar", index: 19}
			}
			, {
					ptype: "gxp_lapigcoordenadas",
					actionTarget: {target: "map.tbar", index: 19}
			}
			, {
					ptype: "gxp_lapigprint",
					actionTarget: {target: "map.tbar", index: 19}
			}
		],
		defaultSourceType: "gxp_lapigwmscsource",
		sources: {
				ows: {
						url: '/ows/', // /ows?SERVICE=WMS&VERSION=1.1.0&request=GetCapabilities
						title: "LAPIG-OWS"
				}
				, mapquest: {
						ptype: "gxp_mapquestsource",
						title: "Mapas de fundo (MapQuest)"
				}
				, google: {
						ptype: "gxp_googlesource",
						title: "Mapas de fundo (Google)"
				}
				, bing: {
						ptype: "gxp_bingsource"
				}
				, mapbox: {
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
				zoom: 4,
				layers: [
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
								,{
										source: "ows",
										name: "pa_br_pastagem_ni_2006_ibge",
										type: "VECTOR"
								}
								,{
										source: "ows",
										name: "pa_br_estados_1000_2014_ibge",
										type: "VECTOR"
								}
								,{
										source: "ows",
										name: "pa_br_matadouros_e_frigorificos_na_2014_lapig",
										type: "VECTOR"
								}
								,{
										source: "ows",
										name: "pa_br_base_fundiaria_ni_2015_incra",
										type: "VECTOR",
										visibility: false
								}
								,{
										source: "ows",
										name: "pa_br_pastagens_sintese_fontes_250_2010_lapig",
										type: "VECTOR",
										visibility: false
								}
				],
				items: [{
						xtype: "gx_zoomslider",
						vertical: true,
						height: 100
				}]
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

});