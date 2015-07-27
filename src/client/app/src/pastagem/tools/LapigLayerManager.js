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
				if (attr.layer instanceof OpenLayers.Layer.WMS) {

					attr.expanded = true;
					attr.allowDrop = false;

					layerRecord = this.target.mapPanel.layers.getByLayer(attr.layer);
					
					layerId = layerRecord.json._id;
					layerLastDate = layerRecord.json.last_date;
					var url = '/layers/years/'+layerId;

					var dateStore = new Ext.data.Store({
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

					var boxDate = {
							xtype:'combo',
							store: dateStore,
							anchor:'100%',
							itemSelector: 'div.year-item',
							width: 120,
							displayField:'year',
							tpl: resultYear,
							typeAhead: true,
							triggerAction: 'all',
							queryParam: 'years',
							fieldLabel: 'Data',
							labelStyle: "font-size: 11px; color: #777777",
							value: layerLastDate,
							listeners: {
								select: function(combo, record, index) {
										
										var layerConfig = {
											source: 'ows',
										  name: record.data.name
										}

										instance.target.createLayerRecord(layerConfig, function(newRecord) {
											layerRecord.beginEdit();
											layerRecord.data.name = newRecord.data.name;
											layerRecord.data.prefix = newRecord.data.prefix;
											layerRecord.data.title = newRecord.data.title;
											layerRecord.data.layer.name = newRecord.data.layer.name
											layerRecord.data.layer.params = newRecord.data.layer.params

											layerRecord.data.layer.redraw(true);

											layerRecord.endEdit();
											layerRecord.commit();
										});
								}
							}
					};

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
										fieldLabel: 'Transparência',
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
					        title: 'Legenda',
					        collapsible: false,
					        autoHeight:true,
					        style: {
					        	'padding': '0px'
					        },
					        items: [
										{
												xtype: "gx_wmslegend",
												baseParams: {
														format: "image/png",
												},
												layerRecord: this.target.mapPanel.layers.getByLayer(attr.layer),
												showTitle: false,
										}
					        ]
								}
								
						]
					};

					if (layerRecord.json.type == "MULTIPLE"){
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
