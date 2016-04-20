/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires widgets/NewSourceWindow.js
 * @require tools/LapigWMSCSource.js
 *
 * @require TreeGrid.js
 * @require TreeGridColumnResizer.js
 * @require TreeGridColumns.js
 * @require TreeGridLoader.js
 * @require TreeGridNodeUI.js
 * @require TreeGridSorter.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = LapigAddLayer
 */

/** api: (extends)
 *  plugins/Tool.js
 */

Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: LapigAddLayer(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.LapigAddLayer = Ext.extend(gxp.plugins.Tool, {
		
		ptype: "gxp_lapigaddlayer",
		
		addActionMenuText: "Add layers",

		findActionMenuText: "Find layers",

		addActionTip: "Add layers",
			 
		addServerText: "Add a New Server",

		addButtonText: "Add layers",
		
		untitledText: "Untitled",

		addLayerSourceErrorText: "Error getting WMS capabilities ({msg}).\nPlease check the url and try again.",

		availableLayersText: "Available Layers",

		expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>",
		
		panelTitleText: "Title",

		layerSelectionText: "View available data from:",

		doneText: "Done",

		relativeUploadOnly: true,

		startSourceId: null,
		
		selectedSource: null,

		constructor: function(config) {
				this.addEvents(
						/** api: event[sourceselected]
						 *  Fired when a new source is selected.
						 *
						 *  Listener arguments:
						 *
						 *  * tool - :class:`gxp.plugins.LapigAddLayer` This tool.
						 *  * source - :class:`gxp.plugins.LayerSource` The selected source.
						 */
						"sourceselected"
				);


				this.projectsParam = config.project.join(',');
				this.layersTreeURL = 'layers/tree?projects=' + this.projectsParam + '&lang='+i18n.lang;
				this.layersSearchURL = 'layers/search';
				this.layerWindow = this.getWindow();

				gxp.plugins.LapigAddLayer.superclass.constructor.apply(this, arguments);        
		},
		
		getWindow: function() {

				var instance = this;
				var ds = new Ext.data.Store({
				    url:this.layersSearchURL,
				    baseParams: {
					    	'projects': this.projectsParam,
					    	'lang': i18n.lang
				    },
				    reader: new Ext.data.JsonReader({
					      root: 'layers',
					      totalProperty: 'totalCount',
					      id: 'post_id'
				    }, [
					      {name:'_id', mapping:'_id'},
					    	{name: 'name', mapping: 'name'},
					      {name: 'year', mapping: 'year'},
					      {name: 'scale', mapping: 'scale'},
					      {name: 'source', mapping: 'source'},
					      {name: 'search', mapping: 'search'},
					      {name: 'searchEnglish', mapping: 'searchEnglish'},
					      {name: 'subject', mapping: 'subject'},
					      {name: 'description', mapping: 'description'}
				    	])
				});


			var resultTpl = new Ext.XTemplate(
			    '<tpl for="."><div class="search-item" style="height: 80px;">',
			        '<div style="padding-left: 6px; padding-right: 6px;">',
			        	'<h4 style="padding-top: 3px; padding-bottom: 6px;">{name}',
				        	'<span style="float: right; text-align: right;"><img style="width: 50%;" src="theme/app/img/sources/{source}.png"/></span>',
				        	'<br>',
				        	'<small style="font-weight: normal;">{year}</small>',
			        	'</h4>',
			        	'<p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" >{description}</p>',
			        '</div>',
			    '</div></tpl>'
			);

			var search = {
				xtype: 'form',
				id: 'combo-box',
				region: 'north',
				padding: "8px 40px 8px 40px",
				height: 40,
				items: [
				   {
			   		fieldLabel: i18n.LAPIGADDLAYER_FIELDLBL_SEARCH,
			   		xtype: 'combo',
			   		id: 'form-layer-name',
			        store: ds,
			        displayField:'name',
			        typeAhead: false,
			        loadingText: 'Searching...',
			        anchor:'100%',
			        minChars: 3,
			        pageSize:5,
			        tpl: resultTpl,
			        queryParam: 'search',
			        itemSelector: 'div.search-item',
			        autoSelect : false,
			        listeners: {
			        	'select': function(combo, record){
			        	
			          		var id = record.data._id;
			          		var subject = record.data.subject;

			          		var treeLayer = Ext.getCmp('tree-layer');

			          		var subjectNode = treeLayer.getRootNode().findChild('text', subject);
			          		subjectNode.expand();

			          		var layerNode = subjectNode.findChild('id', id);
			          		layerNode.select();
			          		layerNode.fireEvent('click', layerNode);
			            }
			        }
				}
			]};
			
			var layers = {
				xtype: 'treepanel',
				id: 'tree-layer',
        useArrows: true,
        autoScroll: true,
        animate: true,
        enableDD: false,
        containerScroll: true,
        rootVisible: false,
				height: 300,
				width: 250,
				region: 'west',
				title: i18n.LAPIGADDLAYER_TTLTREEPNL,
        root: new Ext.tree.AsyncTreeNode({
          text: 'Extensions', 
          draggable:false, 
          id:'ux'
        }),
        dataUrl: this.layersTreeURL,
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
            	var url = 'layers/'+ id + '?lang='+i18n.lang;

            	var formLayer = Ext.getCmp('form-layer');

            	formLayer.load({
            		url:url, 
            		method:'GET', 
            		waitMsg:'Loading',
            		success: function() {
            			node.ui.focus();
            		}
            	});				                		
          	}

          }
        }
		  };
				
			var info = {
				xtype: 'form',
				id: 'form-layer',
				labelWidth: 75,
				url:'',
				frame:true,
				region: 'center',
				title: i18n.LAPIGADDLAYER_TTLFORMDETAILS,
				bodyStyle:'padding:5px 5px 0',
				width: 350,
				defaultType: 'textfield',
				waitMsgTarget: 'form-layer',
				buttonAlign: 'right',
				reader:  new Ext.data.JsonReader({
				    idProperty: '_id',
				    root: '',
				    fields: [
				    		{ name:'_id', mapping: '_id'},
								{ name:'name', mapping:'name' },
								{ name:'description', mapping:'description' },
								{ name:'source', mapping:'source' },
								{ name:'year', mapping:'year' },
								{ name:'region', mapping:'region' },
								{ name:'scale', mapping:'scale' },
								{ name:'subject', mapping:'subject' },
								{ name:'extent', mapping: 'extent'},
			      		{ name:'epsgCode', mapping: 'epsgCode'},
			      		{ name:'basepath', mapping: 'basepath'},
			      		{ name:'last_name', mapping: 'last_name'},
			      		{ name:'type', mapping: 'type'}
				    ]
				}),
				items: [
						{
							fieldLabel: i18n.LAPIGADDLAYER_FIELDLBL_NAME,
							name: 'name',
							width: '95%',
							readOnly: true,
							layout:'form',
							padding: "0px 0px 50px 0px"
						},
						{
							layout:'column',
							xtype: 'panel',
							width: '100%',
							hideLabel: true,
							items:[
									{
										columnWidth:.5,
										layout: 'form',
										padding: "0px 10px 0px 0px",
										labelAlign: 'top',
										readOnly: true,
										items: [
											{
												xtype:'panel',
												id:'field-layer-preview',
												html: "",
												height: 204,
												width: '95%',
												border: true,
												fieldLabel: i18n.LAPIGADDLAYER_FIELDLBL_PREVIEW,
												cls: 'form-preview-field',
												style:{
													marginBottom: '3px',
													margingTop: '2px'
												}
											},
											{
													xtype:'panel',
													id: 'field-layer-source',
													html: "",
													height: 69,
													fieldLabel: i18n.LAPIGADDLAYER_FIELDLBL_SOURCE,
													readOnly: true,
													border: true,
													cls: 'form-logo-field'
											}
										]
									},
									{
										columnWidth:.5,
										layout: 'form',
										labelAlign: 'top',
										padding: "0px 10px 0px 0px",
										items: [
											{
												xtype:'textarea',
												height: 150,
												padding: "0px 0px 0px 0px",
												width: '95%',
												readOnly: true,
												fieldLabel: i18n.LAPIGADDLAYER_FIELDLBL_DESCRIPTION,
												name: 'description',
												anchor:'100%'

											},
											{
													xtype:'textfield',
													fieldLabel: i18n.LAPIGADDLAYER_FIELDLBL_REGION,
													readOnly: true,
													name: 'region',
													anchor:'100%'
											},
											{
												xtype:'textfield',
												fieldLabel: i18n.LAPIGADDLAYER_FIELDLBL_YEAR,
												name: 'year',
												readOnly: true,
												anchor:'100%'
											},
											{
												xtype:'textfield',
												fieldLabel: i18n.LAPIGADDLAYER_FIELDLBL_SCALE,
												name: 'scale',
												readOnly: true,
												anchor:'100%'
											}
									]
								} 
							]
						}
				],
				buttons: [{
						text: i18n.LAPIGADDLAYER_BTNTXT_TOVIEW,
						listeners: {
							'click': function() {

    						var formLayer = Ext.getCmp('form-layer');
    						var layerData = formLayer.getForm().reader.jsonData;

    						if(layerData.last_type == 'EE'){
    							var layerConfig = { source: 'wmts' }
    						}else{
    							var layerConfig = { source: 'ows' }
    						}

                if (layerData.type == 'MULTIPLE'){
                	layerConfig.oldName = layerData.name;
                	layerConfig.oldDescription = layerData.description;
                	layerConfig.name = layerData.last_name;
      					}else{
      						layerConfig.oldName = layerData.name;
      						layerConfig.oldDescription = layerData.description;
      						layerConfig.name = layerData._id;
      					}

      					instance.target.createLayerRecord(layerConfig, function(record) {
      						var mapPanel = instance.target.mapPanel;
      						record.json = layerData;

      						console.log(record.getLayer().maxExtent)

      						mapPanel.layers.add([record]);
              		mapPanel.map.zoomToExtent(record.getLayer().maxExtent);
      					});

							}
						}
				}],
				listeners: {
	      	'afterlayout': {
	      		fn: function(p) {
							p.disable();
						},
	        	single: true
	      	},
          'actioncomplete': function(basicFormLayer, actionLayer) {
          	var formLayer = Ext.getCmp('form-layer');
          	formLayer.enable();

	          var layer = actionLayer.result.data;
          	layerName = (layer.type == 'MULTIPLE') ? layer.last_name : layer._id
          	var urlPreview = 'ows?LAYERS=' + layerName
				          	+ '&FORMAT=image/png'
				          	+ '&TRANSPARENT=TRUE'
				          	+ '&VERSION=1.1.1'
				          	+ '&SERVICE=WMS'
				          	+ '&REQUEST=GetMap'
				          	+ '&STYLES='
				          	+ '&SRS=EPSG:' + layer.epsgCode
				          	+ '&BBOX=' + layer.extent.join(',')
				          	+ '&WIDTH=196'
				          	+ '&HEIGHT=202';
          	
          	if (layer.type == 'MULTIPLE'){

	          	var fileObj = basicFormLayer.reader.jsonData.fileObj;

	          	fileObj.forEach(function(fileObj) {
	          		var idFileObj = fileObj['name'];
	          		var typeFileObj = fileObj['type'];

	          		if (typeFileObj == "EE"){
	          			urlPreview = 'map/' + idFileObj + '/1/0/1';
	          		}
	          	});
	          	
          	}

				    var fieldPreview = Ext.getCmp('field-layer-preview');
          	fieldPreview.update('<img src = '+urlPreview+'>');

          	var urlSource = 'theme/app/img/sources/' + actionLayer.result.data.source + '.png';
          	var fieldSource = Ext.getCmp('field-layer-source');
          	fieldSource.update('<img src = '+urlSource+'>');

          }
				}
			};

			return new Ext.Window({
					title: i18n.LAPIGADDLAYER_TTLAREA,
					closable:true,
					width:700,
					height:500,
					border:false,
					plain:true,
					modal: true,
					layout: 'border',
					listeners: {
						'beforeclose': function() {
		      		this.hide();
		      		return false;
		      	},
					},
					items: [search, layers, info]
			});

		},

		addActions: function() {

			var instance = this;

			var options = {
							tooltip : this.tooltip,
							text: this.text,
							menuText: this.text,
							disabled: true,
							iconCls: "gxp-icon-addlayers",
							handler: function() {
								instance.layerWindow.show(instance);
							},
							scope: this
			};

			var actions = gxp.plugins.LapigAddLayer.superclass.addActions.apply(this, [options]);
				
			this.target.on("ready", function() {actions[0].enable();});

			return actions;
		}

});

Ext.preg(gxp.plugins.LapigAddLayer.prototype.ptype, gxp.plugins.LapigAddLayer);
