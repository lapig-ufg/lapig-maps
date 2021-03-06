/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * js
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @require plugins/LayerTree.js
 * @require GeoExt/plugins/TreeNodeComponent.js
 * @require GeoExt/widgets/WMSLegend.js
 *
 * @requires tools/LapigWMSLegend.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = LapigLayerManager
 */

/** api: (extends)
 *  plugins/LayerTree.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: LapigLayerManager(config)
 *
 *    Plugin for adding a tree of layers with their legend to a
 *    :class:`gxp.Viewer`. Also provides a context menu on layer nodes.
 */   
gxp.plugins.LapigLayerManager = Ext.extend(gxp.plugins.LayerTree, {
		
		ptype: "gxp_lapiglayermanager",

		baseNodeText: "Base Maps",

		createOutputConfig: function() {
				var tree = gxp.plugins.LapigLayerManager.superclass.createOutputConfig.apply(this, arguments);
				Ext.applyIf(tree, Ext.apply({
						cls: "gxp-layermanager-tree",
						lines: false,
						useArrows: true,
						plugins: [{
								ptype: "gx_treenodecomponent"
						}]
				}, this.treeConfig));

				return tree;        
		},
		
		configureLayerNode: function(loader, attr) {
			 
				var instance = this;

				gxp.plugins.LapigLayerManager.superclass.configureLayerNode.apply(this, arguments);

				
				if (attr.layer.options && attr.layer.options.isLapigLayer) {

					attr.expanded = true;
					attr.allowDrop = false;

					layerRecord = this.target.mapPanel.layers.getByLayer(attr.layer);
					layerId = layerRecord.json._id;
					layerLastDate = layerRecord.json.last_date;
					layerExtent = layerRecord.json.extent;

					var url = '/layers/years/'+layerId;

					layerOptions = {
						layout: 'form',
						xtype:'panel',
						bodyBorder: false,
						padding: "0px 0px 0px 48px",
						items:[
								{
										xtype: "slider",
										name: "opacity",
										plugins: new GeoExt.SliderTip({
												getText: function(thumb){
														return String.format("<b>{0}</b>", thumb.value / 100);
												}
										}),
										value: 50,
										minValue: 0,
										maxValue: 100,
										increment: 1,
										fieldLabel: i18n.LAPIGADDLAYER_SLIDER_TRANSPARENCY,
										labelStyle: "font-size: 11px; color: #777777",
										width: 130,
										listeners: {
												change: function(slider, value) {
														attr.layer.setOpacity(value / 100);
												},
												beforerender: function(slider) {
														window.setTimeout(function(){
																slider.setValue(100);
														}, 500);
												},
												scope: this
										}
								},
								{
									xtype:'fieldset',
					        title: i18n.LAPIGADDLAYER_SLIDER_LEGEND,
					        collapsible: false,
					        autoHeight:true,
					        style: {
					        	'padding': '0px'
					        },
					        items: [
										{
												xtype: "gx_lapigwmslegend",
												baseParams: {
														format: "image/png"
												},
												layerRecord: this.target.mapPanel.layers.getByLayer(attr.layer),
												useScaleParameter: false,
												showTitle: false
										}
					        ]
								}
								
						]
					};
					
					if (layerRecord.json.type == "MULTIPLE") {
						var dateStore = new Ext.data.Store({
							autoLoad: true,
							proxy: new Ext.data.HttpProxy({ url:url, method: 'GET'}),
					    reader: new Ext.data.JsonReader({ root: 'years', totalProperty: 'totalCount' }, [
								{name: 'name', mapping: 'name'},
								{name: 'year', mapping: 'year'},
								{name: 'last_date', mapping: 'last_date'}  
							])
						});

						var resultYear = new Ext.XTemplate(
								'<tpl for="."><div class="year-item">',
										'<h4>{year}</h4>',
								'</div></tpl>'
						);

						var btnAnimation = function() {
							var btnNextDate = Ext.getCmp("lapig_layermanager::btn_nextdate");
							var prevNextDate = Ext.getCmp("lapig_layermanager::btn_prevdate");

							var instance = this;
							var evtFn = function() {
								if(!btnNextDate.disabled) {
									setTimeout(function(){
					        	btnNextPrevDate(btnNextDate);
									}, 1000);
					      } else {
					      	layerRecord.data.layer.events.unregister('loadend', instance, evtFn);
					      }
							}

							layerRecord.data.layer.events.register('loadend', instance, evtFn);
							evtFn();
						}

						var btnNextPrevDate = function(btn) {
							var comboDate = btn.ownerCt.items.itemAt(1);

	        		var lastIndex = (comboDate.store.getTotalCount() - 1);
	        		var index = (comboDate.selectedIndex >= 0) ? comboDate.selectedIndex : lastIndex;
	        		if(btn.id == 'lapig_layermanager::btn_prevdate')
	        			var newIndex = index - 1
	        		else
	        			var newIndex = index + 1
	        		
	        		var record = comboDate.store.getAt(newIndex);
							comboDate.setValue(record.data.year);
							comboDate.select(newIndex);
							comboDate.fireEvent('select', comboDate, record);
						}

						var checkDate = function(ownerCt) {
							var prevBtn = ownerCt.items.itemAt(0);
							var comboDate = ownerCt.items.itemAt(1);
							var nextBtn = ownerCt.items.itemAt(2);
							var playBtn = Ext.getCmp("lapig_layermanager::btn_play");

							var lastIndex = (comboDate.store.getTotalCount() - 1);
	        		var index = comboDate.selectedIndex;
	        		
	        		if(index == 0)
	        			prevBtn.disable();
	        		else
	        			prevBtn.enable();

	        		if(index == lastIndex) {
	        			nextBtn.disable();
	        			playBtn.disable();
	        		} else {
	        			nextBtn.enable();
								playBtn.enable();
	        		}
	        			
						}

						var boxDate = {
						    xtype: 'compositefield',
						    labelWidth: 120,
						    height: 22,
						    labelStyle: "font-size: 11px; color: #777777",
						    items: [
						        {
						            xtype: 'button',
						            id: "lapig_layermanager::btn_prevdate",
						            width: 20,
						            icon   : 'theme/app/img/arrow-left.png',
						            listeners: {
						            	click: btnNextPrevDate
						            }
						        },
						        {
											wmsLayer: attr.layer,
											xtype:'combo',
											store: dateStore,
											itemSelector: 'div.year-item',
											width: 100,
											displayField:'year',
											tpl: resultYear,
											typeAhead: true,
											editable: false,
											triggerAction: 'all',
											queryParam: 'years',
											fieldLabel: i18n.LAPIGADDLAYER_SLIDER_DATE,
											value: layerLastDate,
											lazyInit: false,
											listeners: {
												select: function(combo, record, index) {
													var layerConfig;
														if(record.data.type == 'EE'){
															layerConfig = {
																source: 'wmts',
															  name: record.data.name
															}
														}else{
															layerConfig = {
																source: 'ows',
														  	name: record.data.name,
														  	extent: layerExtent
															}
														}

														instance.target.createLayerRecord(layerConfig, function(newRecord) {

															layerRecord = instance.target.mapPanel.layers.getByLayer(combo.initialConfig.wmsLayer);

															layerRecord.beginEdit();
															layerRecord.data.name = newRecord.data.name;
															layerRecord.data.layer.url = newRecord.data.layer.url

															layerRecord.data.layer.redraw(true);

															layerRecord.endEdit();
															layerRecord.commit();

															checkDate(combo.ownerCt);
														});
												}
											}
										},
										{
						            xtype: 'button',
						            id: "lapig_layermanager::btn_nextdate",
						            width: 20,
						            icon   : 'theme/app/img/arrow-right.png',
						            disabled: true,
						            listeners: {
						            	'click': btnNextPrevDate
						            }
						        },
						        {
						            xtype: 'button',
						            id: "lapig_layermanager::btn_play",
						            disabled: true,
						            width: 20,
						            icon   : 'theme/app/img/play.png',
						            listeners: {
						            	'click': btnAnimation
						            }
						        }
						    ]
						};

						layerOptions.items.unshift(boxDate);
					}

					var layerStatusChange = function(target, status) {
						
						if(status)
							target.component.show();
						else
							target.component.hide();
					}

					if(attr.layer.visibility == false)
						layerOptions.hidden = true;

					Ext.apply(attr, { component: layerOptions, listeners: { 'checkchange': layerStatusChange } });
				}
		}
		
});

Ext.preg(gxp.plugins.LapigLayerManager.prototype.ptype, gxp.plugins.LapigLayerManager);
