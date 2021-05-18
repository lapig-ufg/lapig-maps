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
 * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Control/Graticule.js
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
			tooltip: this.tooltip,
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

		/* Url e configuracoes do mapa em PDF ******************************/
		var strLayers = [];
		var strLabels = [];
		var strFilters = [];

		for(var i=0; i<instance.layers.length; i++) {
			var layer = instance.layers[i]
			if(layer.enable) {
				strLayers.push(layer.id);
				strFilters.push(layer.filter);

				if(instance.customLayer[layer.id]) {
					strLabels.push(instance.customLayer[layer.id])
				} else {
					strLabels.push(layer.label)
				}
			}
		}

		var strLayers = strLayers.join(';;');
		var labels = strLabels.join(';;');
		var filters = strFilters.join(';;');
		var title = Ext.getCmp('title_map').text;
		var description =  Ext.getCmp('description');

		var url = '/print/pdf?layers=' + strLayers + "&labels=" + labels + "&filters=" + filters + "&lon=" + map.center.lon + "&lat=" + map.center.lat + "&zoom="+ map.zoom + "&title=" + title + "&description=" + description;
		window.open(url);
		/*******************************/
	},

	addLegends: function(pnlLegendImg) {
		instance = this;
		pnlLegendImg.removeAll();
		var titleLegends = new Ext.form.Label({
			xtype:'label',
			style:{
				fontSize:'14px',
				paddingTop:'10px'
			},
			html: [
				i18n.LAPIGPRINT_TTLAREAMAP_LEGENDAS
			]
		});
		pnlLegendImg.add(titleLegends);
		
		for(var i= (instance.layers.length - 1); i >= 0; i--) {
			var layer = instance.layers[i];
			
			if(layer.enable) {
				var imgLeg = "/ows?EXCEPTIONS=application/vnd.ogc.se_xml&TRANSPARENT=TRUE&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&LAYER="+layer.id+"&format=image/png&SCALE=34942571.6116478"
				var htmlLeg = '<img src=' + imgLeg + '" style="max-width: 180px;"/>';

				var legendMap = new Ext.Panel({
					title: layer.label,
					id: layer.label,
					headerCfg: {
						tag: 'span',
						cls: 'x-header-legends',
						html: 'Message'
					},
					border: false,
					html:htmlLeg,
					style:{
						paddingBottom:'6px',
						paddingTop:'4px'
					}
				});
				pnlLegendImg.add(legendMap);
			}
		}
		pnlLegendImg.doLayout();
	},

	addLayers: function(internalMap) {
		var instance = this;

		instance.layers.forEach(function(layer) {
			if(layer.enable == false) {
				//Nao adicionar o layer nenhum 
			} else {
				internalMap.map.addLayer(new OpenLayers.Layer.WMS(
					layer.label, 
					layer.url, 
					{ 
						layers: layer.id, 
						format: layer.format,
						transparent: layer.transparent,
						msfilter: layer.filter
					}, 
					{ 
						maxExtent: layer.maxExtent,
						projection: layer.projection,
						visibility: layer.enable,
						tileSize: layer.tileSize
					}
				));
			}
		});
	},

	clearMap: function(internalMap) {
		var i=0
		while (internalMap.map.layers.length > 1) {
			var layer = internalMap.map.layers[i];
			if(layer.name != 'Road') {
				internalMap.map.removeLayer(layer);
			} else {
				i++;
			}
		}
	},

	getLayersFromAppMap: function() {
		var instance = this;
		var appMap = this.target.mapPanel.map;

		var bing = new OpenLayers.Layer.Bing({
			name: "Road",
			key: "VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY",
			type: "Road"
		});

		var olLayers = [bing];
		instance.layers = [];
		appMap.layers.forEach(function(appLayer) {
				var url = appLayer.url;
				var name = appLayer.name;
				var visibility = appLayer.visibility;
				var layersParams = appLayer.hasOwnProperty('params') ? appLayer.params['LAYERS'] : '';

				var olLayer = new OpenLayers.Layer.WMS( name, url, 
					{ 
						layers: layersParams, 
						format: 'image/png', 
						transparent: 'true',
						msfilter: appLayer.hasOwnProperty('params') ? appLayer.params['MSFILTER'] : ''
					}, 
					{ 
						maxExtent: appLayer.maxExtent, 
						projection: new OpenLayers.Projection('EPSG:900913'), 
						visibility: appLayer.visibility, 
						tileSize: new OpenLayers.Size(512,512)
					}
				)

				var printToolLayer = {
					id: layersParams,
					url: url,
					label: name,
					enable: visibility,
					maxExtent: appLayer.maxExtent, 
					projection: new OpenLayers.Projection('EPSG:900913'), 
					tileSize: new OpenLayers.Size(512,512),
					format: 'image/png', 
					transparent: 'true',
					filter: appLayer.hasOwnProperty('params') ? appLayer.params['MSFILTER'] : ''
				}

				olLayers.push(olLayer)
				instance.layers.push(printToolLayer)
		});

		return olLayers;
	},

	getContentItem1: function() {
		var instance = this;
		var appMap = this.target.mapPanel.map;

		instance.internalMap = new GeoExt.MapPanel({
			title: i18n.LAPIGPRINT_TTLAREA_MAPS,
			map: {
				projection: "EPSG:900913"
			},
			center: [appMap.center.lon, appMap.center.lat],
			zoom: appMap.zoom,
			border:false,
			width: 700,
			height: 500,
			region: "center",
			layers: instance.getLayersFromAppMap()
		});

		var nav = new Ext.Panel({
			title: i18n.LAPIGPRINT_TTLAREA_MNPMAP,
			border:false,
			region: 'east',
			split: false,
			width: 418,
			height: 595,
			padding:10,
			items:[
				{
					xtype:'label',
					style:{
						fontSize:'12px',
						paddingTop:'45px'
					},
					html: i18n.LAPIGPRINT_TXTHTML_WELCOME
				}
			],
			buttons: [
				{
					text: i18n.LAPIGPRINT_BTN_NEXT,
					style: {
						paddingLeft: '10px',
						paddingRight:'10px'
					},
					handler: function(){
						instance.createProximoPasso2(true);
					}
				}
			]
		})

		return {
			layout: 'border',
			id: 'update_internalMap1_display',
			border: false,
			height: 530,
			items: [instance.internalMap, nav]
		}
	},

	createProximoPasso2 : function(updateLegendPnlFlag) {
		var instance = this;
		
		var tabPrint = Ext.getCmp('gxp_lapigprint::tab-print');
		var tabSection1 = Ext.getCmp('gxp_lapigprint::tab-section1');
		var tabSection2 = Ext.getCmp('gxp_lapigprint::tab-section2');
		var tabSection3 = Ext.getCmp('gxp_lapigprint::tab-section3');
		var pnlLegendImg = Ext.getCmp('gxp_lapigprint::pnl-legend-section2');
		var pnlLegend = Ext.getCmp('gxp_lapigprint::ckeck-legend');

		/* Atualizacao da legenda checkbox ******************************/
		if(updateLegendPnlFlag) {
			pnlLegend.removeAll();

			for(var i= (instance.layers.length - 1); i >= 0; i--) {
				var layer = instance.layers[i];
				var composite = new Ext.form.CompositeField({
					style: {
						paddingTop:'10px',
						paddingBottom:'10px'
					},
					items: [
					{
						xtype: 'button',
						id:'lapig-icon-seta-verde',
						style:{
							paddingTop:"4px",
							width:'15px'
						},
						layer: layer,
						html:'<img src="/theme/app/img/seta.png"/>',
						listeners: {
							click: function(n){
								var posicao = instance.layers.indexOf(n.layer);
								var aux = instance.layers[posicao + 1];

								instance.layers[posicao + 1] = instance.layers[posicao];
								instance.layers[posicao] = aux;

								instance.createProximoPasso2(true);
							}
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
					}
					]
				});

				if (instance.layers.indexOf(layer) == (instance.layers.length - 1)){
					Ext.getCmp('lapig-icon-seta-verde').setDisabled(true);
					Ext.getCmp('lapig-icon-seta-verde').html ='<img src="/theme/app/img/seta-invisivel.png"/>';
				}

				pnlLegend.add(composite);
			}

			pnlLegend.doLayout();
		};

		instance.addLegends(pnlLegendImg);
		tabSection2.enable();
		tabPrint.activate(tabSection2);
		tabPrint.doLayout();
		/*******************************/

		/* Configuracoes do mapa ******************************/
		instance.clearMap(instance.internalMap2)
		instance.addLayers(instance.internalMap2);
		instance.internalMap2.map.addControl(new OpenLayers.Control.Graticule({
			lineSymbolizer: {
				'strokeDashstyle': 'dot',
				'strokeColor': '#000000',
				'strokeWidth': 1,
				'strokeOpacity': 0.5
			},
			labelSymbolizer: {
				'fontSize': '10px'
			},
			numPoints: 2,
			labelled: true
		}));
		instance.internalMap2.map.setCenter(new OpenLayers.LonLat(instance.internalMap.map.getCenter().lon,instance.internalMap.map.getCenter().lat),instance.internalMap.map.zoom);	
		/*******************************/
	},

	getContentItem2 : function() {
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
					backgroundColor: 'white'
				}
			}]
		});

		instance.internalMap2 = new GeoExt.MapPanel({
			map: {
				projection: "EPSG:900913",
				controls: [],
				maxResolution: 75000,
		        units: "m",
		        allOverlays: true
			},
			border: false,
			width: 700,
			height: 595,
			region: "center",
			layers: [
				new OpenLayers.Layer.Bing({
					name: "Road",
					key: "VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY",
					type: "Road"
				})
			],
			style:{
				border: '1px solid gray'
			}
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
				fontWeight: 'bold'
			},
			html:''
		});

		var mapLegend = new Ext.Panel({
			title:i18n.LAPIGPRINT_TTLAREA_PREVIEW,
			layout: "border",
			border:false,
			region: "center",
			split: false,
			style:{
				backgroundColor: 'white'
			},
			items:[title, instance.internalMap2, legend]					
		});

		var titleLegendsLayers = new Ext.Panel({
			id: 'title_legend_description',
			border: false,
			style:{
				fontSize:'12px',
				paddingTop:'10px'
			},
			html: i18n.LAPIGPRINT_TXTHTML_SELECTLEG
		});

		var checkLegend = new Ext.Panel({
			id: 'gxp_lapigprint::ckeck-legend',
			border: false,
			padding: 10,
			items: {
				border: false,
				defaultType: 'checkbox',
				style:{
					paddingTop: '15px',
					paddingLeft:'10px'
				}
			}
		});

		var selctionLegend = new Ext.Panel({
			title: i18n.LAPIGPRINT_TTLAREA_SELECTLEG,
			border:false,
			region: "east",
			width: 220,
			autoScroll: true,
			items:[titleLegendsLayers, checkLegend],
			buttons: [{
				text: i18n.LAPIGPRINT_BTN_NEXT,
				style: {
					paddingLeft: '10px',
					paddingRight:'10px'
				},
				handler: function() {
					instance.createProximoPasso3(true);		
				}
			}]
		});

		return {
			layout: "border",
			border: false,
			height: 595,
			items: [mapLegend, selctionLegend]
		}
	},

	createProximoPasso3 : function(updateLegendPnlFlag) {
		var instance = this;

		var tabPrint = Ext.getCmp('gxp_lapigprint::tab-print');
		var tabSection3 = Ext.getCmp('gxp_lapigprint::tab-section3');
		var pnlLegend = Ext.getCmp('gxp_lapigprint::pnl-legend-section3');

		/* Atualizacao da figura legenda ******************************/	
		instance.fontArrayId = [];
		
		instance.layers.forEach(function(layer) {
			if (layer.enable) {
				instance.fontArrayId.push(layer.id);
			}
		});
		/********************************/

		/* Atualizacao da fonte ******************************/
		instance.addLegends(pnlLegend);
		tabSection3.enable();
		tabPrint.activate(tabSection3);

		var fontArray = [];
		var fontes = instance.fontArrayId.toString().split(',');
		
		for(var i=0; i<fontes.length; i++) {
			fonte = fontes[i].split('_')
			if(fonte.length >= 5) {
				fonte = fonte.reverse();
				fonte = fonte[0]
				fontArray.push(fonte);
			} else {
				fontArray.push('LAPIG');
			}
		}

		var strFont = [];
		for(var i=0; i<fontArray.length; i++) {
			if(strFont.indexOf(fontArray[i]) != -1) {
				console.log("Fonte equals");
			} else {
				strFont.push(fontArray[i])
			}
		}

		strFont = strFont.toString()
		var font = strFont.toUpperCase();
		font = font.replace(/,/g, "/ ");
		Ext.getCmp('projection_map_internalMap3').setText('Projeção: DATUM WGS84<br>Fontes: '+font, false);
		/********************************/

		/* Atualizacao dos layers e controls ******************************/
		instance.clearMap(instance.internalMap3)
		instance.addLayers(instance.internalMap3);

		instance.internalMap3.map.addControl(new OpenLayers.Control.ScaleLine({ 
			div: document.getElementById('scale_map_internalMap3'),
			geodesic: true
		}));

		instance.internalMap3.map.addControl(new OpenLayers.Control.Graticule({
			lineSymbolizer: {
				'strokeDashstyle': 'dot',
				'strokeColor': '#000000',
				'strokeWidth': 1,
				'strokeOpacity': 0.5
			},
			labelSymbolizer: {
				'fontSize': '10px'
			},
			numPoints: 2,
			labelled: true
		}));
		instance.internalMap3.map.setCenter(new OpenLayers.LonLat(instance.internalMap.map.getCenter().lon,instance.internalMap.map.getCenter().lat), instance.internalMap.map.zoom);

		var labelLegends = Ext.getCmp('gxp_lapigprint::label-legends');
		labelLegends.removeAll();

		for(var i=(instance.layers.length - 1); i >= 0; i--) {
			var layer = instance.layers[i];
			instance.customLayer = [];

			if(layer.enable) {
				var textfield = new Ext.form.TextField({
					xtype: 'textfield',
					value: layer.label,
					layer: layer,
					enableKeyEvents: true,
					listeners: {
						keyup : function (obj, evnt) {
							var titleLayer = Ext.getCmp(obj.layer.label)
							titleLayer.setTitle(evnt.target.value)

							var newTitle = evnt.target.value;
							var myKey = obj.layer.id;

							instance.customLayer[myKey] = newTitle
						}
					}
				});
				labelLegends.add(textfield);
			}
		}
		labelLegends.doLayout();
		/********************************/
	},

	getContentItem3: function() {
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
				style:{
					borderColor: 'white transparent',
					backgroundColor: 'white',
					fontWeight: 'bold',
					fontSize: '14px',
					paddingTop:'20px',
					textAlign: 'center'
				}
			},{
				xtype:'panel',
				name: 'logo-pastagem',
				region: 'west',
				html: '<img src="/theme/app/img/logo-pastagem.png"/>',
				border: false,
				height: 40,
				width: 120
			},{
				xtype:'panel',
				name: 'logo-parceiros',
				region: "east",
				html: '<img src="/theme/app/img/logo-parceiros2.png"/>',
				border: false,
				height: 40,
				width: 110
			}]
		});

		var descricao = new Ext.Panel({
			layout: "border",
			id: 'description_map',
			border: '1px solid gray',
			split: false,
			height: 111,
			items: [{
				name: 'rosa-dos-ventos',
				id: 'rosa-dos-ventos_map_internalMap3',
				html: '<img src="/theme/app/img/rosa-dos-ventos.png"/>',
				border: false
			},{
				xtype:'label',
				id: 'scale_map_internalMap3',
				region: 'center'
			},{
				border: false,
				name: 'escala-Map3',
				xtype:'label',
				id: 'projection_map_internalMap3',
				html: ''
			}]
		});

		instance.internalMap3 = new GeoExt.MapPanel({
			map: {
				projection: "EPSG:900913",
				controls: [],
				maxResolution: 75000,
	            units: "m",
	            allOverlays: true
			},
			border: false,
			width: 700,
			height: 595,
			region: "center",
			layers: [
				new OpenLayers.Layer.Bing({
					name: "Road",
					key: "VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY",
					type: "Road"
				})
			],
			style:{
				border: '1px solid gray'
			}
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
				fontWeight: 'bold'
			},
			html:''
		});

		var mapLegend = new Ext.Panel({
			title: i18n.LAPIGPRINT_TTLAREA_PREVIEW,
			layout: "border",
			border: false,
			region: "center",
			style:{
				backgroundColor: 'white'
			},
			items:[title, instance.internalMap3, legend, descricao]
		});

		var pnlTituloeDescricao = new Ext.Panel({
			title: i18n.LAPIGPRINT_TTLAREA_TTLDESC,
			layout: "border",
			border:false,
			region: "east",
			split: false,
			width: 220,
			items:[{
				border:false,
				width: 2250,
				height:550,
				region: 'center',
				items: [{
					layout: 'form',
					border: false,
					labelAlign:'top',
					style: {
						paddingTop: '20px',
						paddingLeft: '5px'
					},
					items: [
					{
						xtype:'textarea',
						fieldLabel: i18n.LAPIGPRINT_FIELDLBL_TTL,
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
							}
						}
					},{
						id: 'gxp_lapigprint::label-legends',
						fieldLabel: i18n.LAPIGPRINT_TTLAREA_TTLAYERS,
						labelStyle: 'font-weight:bold;',
						border: false,
						items: {
							border: false,
							height: 10,
							width: 210,
							marginBottom: 10,
							defaultType: 'textfield',
							style:{
								paddingTop: '15px',
								paddingLeft:'10px'
							}
						}
					}]
				}]
			}],
			buttons: [{
				text: i18n.LAPIGPRINT_BTN_PDF,
				style: {
					paddingLeft: '10px',
					paddingRight:'10px'
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

	addSelectedPrint: function() {
		var instance = this

		tabs = new Ext.TabPanel({
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
					tabsId = ['gxp_lapigprint::tab-section1', 'gxp_lapigprint::tab-section2', 'gxp_lapigprint::tab-section3'];

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
				title: i18n.LAPIGPRINT_TTLABA_REGION,
				id: 'gxp_lapigprint::tab-section1',
				disabled:false,
				items: [ 
					instance.getContentItem1() 
				]
			},{
				title: i18n.LAPIGPRINT_TTLABA_LEGEND,
				id: 'gxp_lapigprint::tab-section2',
				disabled:true,
				items: [ 
					instance.getContentItem2() 
				]
			},{
				title: i18n.LAPIGPRINT_TTLABA_TTLDESC,
				id: 'gxp_lapigprint::tab-section3',
				disabled:true,
				items: [ 
					instance.getContentItem3() 
				]
			}]
		});

		var win = new Ext.Window({
			title: i18n.LAPIGPRINT_TTL_WINDOW,
			id: 'idWindow',
			layout: 'fit',
			closable: 'close',
			resizable: false,
			width:1030,
			height:650,
			border:false,
			items: [tabs],
			listeners: {	
				beforeclose: function() {
					//Limpar os controles do mapa para evitar erro no 'Graticule'
					instance.internalMap2.map.controls = []
					instance.internalMap3.map.controls = []
          		}
			}
		});
		return win.show(this);
	}
});

Ext.preg(gxp.plugins.LapigPrint.prototype.ptype, gxp.plugins.LapigPrint);