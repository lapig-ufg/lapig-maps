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
 * @require MultiSelect.js
 * @require ItemSelector.js
 *
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = LapigGeoCampo
 */

/** api: (extends)
 *  plugins/Tool.js
 */

Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: LapigGeoCampo(config)
 *
 *    Tool Geocampo
 */
gxp.plugins.LapigGeoCampo = Ext.extend(gxp.plugins.Tool, {
        
    ptype: "gxp_lapiggeocampo",

    constructor: function(config) {
            var instance = this;
                this.addEvents(
                        /** api: event[sourceselected]
                         *  Fired when a new source is selected.
                         *
                         *  Listener arguments:
                         *
                         *  * tool - :class:`gxp.plugins.LapigGeoCampo` This tool.
                         *  * source - :class:`gxp.plugins.LayerSource` The selected source.
                         */
                        "sourceselected"
                );

                this.GeoCampoURL = '/geocampo/pontos';

                gxp.plugins.LapigGeoCampo.superclass.constructor.apply(this, arguments);        
        },
    
    getWindow: function(data) {

    	 	var layerData = {
					id: "pontos",
					name: "Camada de pontos de campo",
					description: "Descriç~ao...",
					type: "VECTOR",
					source: "lapig",
					year: "2016",
					scale: "1:250.000",
					extent: [
					"-73.664555",
					"-33.756979",
					"-34.872555",
					"5.197021"
					],
					epsgCode: "4674",
					params: '"[Bioma]"="Cerrado"'
				};
       
       var info = {
            xtype: 'form',
            id: 'form-geocampo',
            url:'',
            frame:true,
            region: 'center',
            title: i18n.LAPIGGEOCAMPO_TTLFILTER,
            width: 300,
            defaultType: 'textfield',
            buttonAlign: 'right',
            items: [
                {
                    layout:'form',
                    xtype: 'panel',
                    width: '100%',
                    hideLabel: true,
                    items:[
                        {
                            title: 'Cobertura',
                            name: 'cobertura',
                            width: 250,
                            height:70,
                            items:[{
                                xtype: 'combo',
                                name: 'cobertura',
                                id: 'coberturamultiselect',
                                width: 250,
                                height:70,
                                store: data.cobertura,
                                typeAhead: false,
                                emptyText:'Todas'
                            }]
                        },
                        {
                            title: 'Bioma',
                            name: 'bioma',
                            width: 250,
                            height:70,
                            items:[{
                                xtype: 'combo',
                                name: 'bioma',
                                id: 'biomamultiselect',
                                width: 250,
                                height:70,
                                store: data.bioma,
                                ddReorder: false,
                                emptyText:"Todos"
                            }]
                        },
                        {
                            title: 'Fonte',
                            name:'fonte',
                            width: 250,
                            height:70,
                            items:[{
                                xtype: 'combo',
                                name: 'fonte',
                                id: 'fontemultiselect',
                                width: 250,
                                height:70,
                                store: data.fonte,
                                ddReorder: false,
                                emptyText: "Todas"
                            }]
                        },
                        {
                            title: 'Ano',
                            name: 'ano',
                            width: 250,
                            height:70,
                            items:[{
                                xtype: 'combo',
                                name: 'ano',
                                id: 'anomultiselect',
                                width: 250,
                                height:70,
                                store: data.ano,
                                ddReorder: false,
                                emptyText:'Todos'
                            }]
                        },
                        {
                            title: 'Específicos',
                            name: 'especificos',
                            width: 250,
                            height:70,
                            items:[{
                                xtype: 'combo',
                                id: 'especificos',
                                name: 'especificos',
                                width: 250,
                                height:70,
                                store: data.especificos,
                                ddReorder: false,
                                emptyText: 'Todos'
                            }]
                        },
                        {
                            xtype:'multislider',
                            fieldLabel: i18n.LAPIGGEOCAMPO_FIELDLBL_LCI,
                            id: 'lcimultislider',
                            width: 150,
                            minValue: 0.1,
                            keyIncrement: 0.1,
                            maxValue: 1.0,
                            values: [0.1, 1.0],
                            decimalPrecision: 1,
                            plugins: new Ext.slider.Tip()
                        },
                        {
                            xtype:'multislider',
                            fieldLabel: i18n.LAPIGGEOCAMPO_FIELDLBL_PVI,
                            id: 'pvimultislider',
                            width: 150,
                            minValue: 0,
                            keyIncrement: 0.1,
                            maxValue: 1,
                            values: [0, 1.0],
                            decimalPrecision: 1,
                            plugins: new Ext.slider.Tip()
                        }
                    ]
                }
/*                {
                    layout:'form',
                  xtype: 'panel',
                  region: 'bottom',
                  width: '100%',
                  defaultType: 'textfield',
                  hideLabel: true,
                  items:[
	                	{
	                      fieldLabel: "Quantidade",
	                      name: 'quantidade',
	                      width: 50,
	                      readOnly: true,
	                      layout:'form',
	                      padding: "0px 0px 50px 0px"
	                  }
	                ]
                }*/
            ],
            buttons: [{
              text: i18n.LAPIGADDLAYER_BTNTXT_TOVIEW,
              listeners: {
                  'click': function() {
                      var formLayer = Ext.getCmp('form-geocampo');

                      var valueCobertura = Ext.getCmp('coberturamultiselect').getValue();
                      var valueAno = Ext.getCmp('anomultiselect').getValue();
                      var valueBioma = Ext.getCmp('biomamultiselect').getValue();
                      var valueFonte = Ext.getCmp('fontemultiselect').getValue();
                      var valueEspecificos = Ext.getCmp('especificos').getValue();
                      var valueLCI = Ext.getCmp('lcimultislider').getValues();
                      var valuePVI = Ext.getCmp('pvimultislider').getValues();

                      valueLCI = '"[LCI]">="'+valueLCI[0]+'"AND "[LCI]"<="'+valueLCI[1]+'"'
                      valuePVI = '"[PVI]">="'+valuePVI[0]+'"AND "[PVI]"<="'+valuePVI[1]+'"'

                      var layerConfig = { source: 'ows' }

                      var arrayfilters = []

                      if(valueCobertura){
                      	arrayfilters.push('"[Cobertura]"="'+valueCobertura+'"')
                      }if(valueAno){
                      	arrayfilters.push('"[Ano]"='+valueAno)
                      }if(valueBioma){
                      	arrayfilters.push('"[Bioma]"="'+valueBioma+'"')
                      }if(valueFonte){
                      	arrayfilters.push('"[Fonte]"="'+valueFonte+'"')
                      }if(valueEspecificos){
                        arrayfilters.push('"['+valueEspecificos+']"'+'!=""')
                      }

                      arrayfilters.join(' AND ');

                      if(arrayfilters.length == 0){
                        layerData['params'] = '"[Cobertura]"!="0"'+'AND'+valueLCI+'AND'+valuePVI;
                        layerConfig.oldName = 'Todos os Pontos ';
                      }else{
                        arrayfilters.push(valueLCI);
                        arrayfilters.push(valuePVI);
                        layerData['params'] = arrayfilters.join(' AND ');
                        if(valueCobertura){
                            layerConfig.oldName = 'Pontos: '+valueCobertura;
                        }else if (valueBioma){
                            layerConfig.oldName = 'Pontos: '+valueBioma;
                        }else if (valueFonte){
                            layerConfig.oldName = 'Pontos: '+valueFonte;
                        }else if (valueAno){
                            layerConfig.oldName = 'Pontos: '+valueAno;
                        }else if (valueEspecificos){
                            layerConfig.oldName = 'Pontos: '+valueEspecificos;
                        }
                      }

                      layerConfig.oldDescription = layerData.description;
                      layerConfig.name = layerData.id;
                      layerConfig.msfilter = layerData.params;
                      layerConfig.extent = layerData.extent;


                      instance.target.createLayerRecord(layerConfig, function(record) {
                        var mapPanel = instance.target.mapPanel;
                        record.json = layerData;
                        record.data.layer.url = record.data.layer.url+'&MSFILTER='+layerConfig.msfilter
                        mapPanel.layers.add([record]);
                        mapPanel.map.zoomToExtent(record.getLayer().extent);
                      });

                      win.close();
                      Ext.getCmp('form-geocampo').removeAll();
                      Ext.getCmp('form-geocampo').load();
                  }
              }
            }],
            listeners: {
            }
        };

        var win = new Ext.Window({
            title: i18n.LAPIGGEOCAMPO_TTLAREA,
            closable:true,
            width:280,
            height:500,
            border:false,
            plain:true,
            modal: true,
            layout: 'border',
            listeners: {
                'beforeclose': function() {
                    this.hide();
                    return false;
                  }
            },
            items: [info]
        });

        return win.show(this);
    },

    addActions: function() {
        var actions = gxp.plugins.LapigGeoCampo.superclass.addActions.apply(this, [{
            tooltip: this.tooltip,
            text: this.text,
            iconCls: "lapig-icon-geocampo",
            handler: function() {
            	Ext.Ajax.request({
								url : this.GeoCampoURL,
								success:function(result,request){
									var data = JSON.parse(result.responseText)
									this.getWindow(data);
								}.bind(this),
								failure:function(){	
								}
							});
                
            },
            scope: this
        }]);

        return actions;
    }

});

Ext.preg(gxp.plugins.LapigGeoCampo.prototype.ptype, gxp.plugins.LapigGeoCampo);
