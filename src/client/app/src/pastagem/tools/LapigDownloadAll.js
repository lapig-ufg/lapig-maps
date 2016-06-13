/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = LapigDownload
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

gxp.plugins.LapigDownloadAll = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_lapigdownloadall",
    
    menuText: "Download",

    actionTip: "Download de toda série temporal",
    
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.LapigDownloadAll.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            text: this.menuText,
            iconCls: "gxp-icon-downloadmany",
            disabled: true,
            tooltip: this.actionTip,
            handler: function() {
                lapigAnalytics.clickTool('Tools', 'Download Multiple Layers', '')
                this.removeOutput();
                this.addOutput(selectedLayer);
            },
            scope: this
        }]);
        var action = actions[0];

        this.target.on("layerselectionchange", function(record) {
            selectedLayer = record;
            if(selectedLayer) {
                action.setDisabled( !(selectedLayer.json.type == "MULTIPLE") );
            }
        }, this);
        var enforceOne = function(store) {
            action.setDisabled(!selectedLayer || store.getCount() <= 1);
        };
        this.target.mapPanel.layers.on({
            "add": enforceOne,
            "remove": enforceOne
        });
        
        return actions;
    },

    sendEmailRequest: function(layerJson, email) {
        var id = layerJson._id;
        var url = '/download/time-series';

        Ext.MessageBox.show({
           title: 'Requisição de download',
           msg: 'Enviando email para ' + email + '...',
           width:300,
           progress:false,
           closable:false,
           animEl: 'mb6'
       });

        Ext.Ajax.request({
           url: url,
           success: function(response) {
            var responseJson = JSON.parse(response.responseText);
            
            lapigAnalytics.clickTool('Download Multiple Layer','request-download', id);

            if(responseJson.result) {
                var msg = 'Enviamos um email para ' + email + ' contendo<br> instruções para download.';
                var icon = 'ext-mb-info';
            } else {
                var msg = 'Nos desculpe, estamos com problemas para enviar email.<br>Por favor tente mais tarde.';
                var icon = 'ext-mb-warning';
            }

            Ext.MessageBox.show({
               title: 'Requisição de download',
               msg: msg,
               buttons: Ext.MessageBox.OK,
               animEl: 'mb9',
               icon: icon
            });

           },
           jsonData: {
            "id": id,
            "email": email
           }
        });
    },

    addOutput: function(selectedLayer) {
        
        var instance = this;

        if(selectedLayer.json && selectedLayer.data.name && selectedLayer.json.type) {

            var layerName   = selectedLayer.data.name;
            var metadata   = selectedLayer.json.metadata;
            var layerType   = (selectedLayer.json.type == 'MULTIPLE' ) ? selectedLayer.json.last_type : selectedLayer.json.type;
            var title       = 'Download - '+selectedLayer.data.title;

            var form = new Ext.form.FormPanel({
                baseCls: 'x-plain',
                labelWidth: 55,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                defaults: {
                    xtype: 'textfield',
                    margins: '5 5 5 5'
                },
                items: [
                        {
                            xtype: 'textarea',
                            name: 'msg',
                            width: 600,
                            height: 360,
                            value: "Termo de Disponibilização dos Dados do LAPIG\n\n1. Ao realizar o download de arquivos gerados e/ou administrados pelo portal de dados do Laboratório de Processamento de Imagens e Geoprocessamento (LAPIG), da Universidade Federal de Goiás (UFG), você concorda em submeter-se aos nossos Termos de Uso, bem como à qualquer condição específica e adicional relacionada aos nossos arquivos."+
                                    "\n\n2. Mapas temáticos, imagens de satélite, textos acadêmicos e apresentações em geral (material didático, tutoriais, palestras, etc.), produzidos e/ou disponibilizados pelo LAPIG, estão disponíveis para uso pessoal, sem finscomerciais, respeitando-se o direito de uso expresso em cada arquivo, bem como a(s) respectiva(s) autoria(s)."+
                                    "\n\n3. Mapas temáticos, imagens de satélite, textos acadêmicos e apresentações em geral (material didático, tutoriais, palestras, etc.), produzidos por outras instituições públicas ou privadas, e disponibilizados para download através do portal de dados do LAPIG, devem ter o seu direito de uso respeitado de acordo com as políticas de uso e serviços da respectiva instituição, sob responsabilidade do usuário."+
                                    "\n\n4. O LAPIG não se responsabiliza pelo uso ou redistribuição das informações obtidas em seu portal de dados, cabendo ao usuário discernir sobre as formas de uso (lícitas), confiabilidade (inclusive cartográfica) e aplicabilidade das mesmas, sem ônus para o LAPIG e a UFG."+
                                    "\n\n5. Toda informação obtida através do portal de dados do LAPIG, caso venha a ser utilizada pelo usuário em pesquisas, textos de divulgação acadêmica e/ou jornalística, em apresentações em geral ou outras formas de divulgação, deverá ter sua fonte divulgada, respeitando-se todos os direitos autorais.",
                            readOnly: true
                        }, 
                        {
                                xtype: "checkbox",
                                checked: false,
                                boxLabel: 'Aceito as condições acima',
                                listeners : {
                                    check: function( evt ) {
                                        
                                        if(evt.checked)
                                            Ext.getCmp('downloadBtn').enable();
                                        else
                                            Ext.getCmp('downloadBtn').disable();
                                    }
                                }
                        }
                ]
            });

            var w2 = new Ext.Window({
                layout: 'fit',
                height: 250,
                height: 250,
                items:[
                    {
                        xtype:'form',
                        defaultType: 'textfield',
                        items: [
                            {
                                fieldLabel: 'Email',
                                name: 'email',
                                vtype:'email'
                            }
                        ]
                    }
                ],
                buttons: [{
                    text: 'Continuar'
                }]
            });

            var w1 = new Ext.Window({
                title: title,
                collapsible: false,
                maximizable: false,
                width: 750,
                height: 480,
                minWidth: 300,
                minHeight: 200,
                layout: 'fit',
                plain: true,
                bodyStyle: 'padding:5px;',
                buttonAlign: 'center',
                items: form,
                buttonAlign: 'center',
                buttons: [{
                    text: 'Download',
                    id: "downloadBtn",
                    disabled: true,
                    listeners: {
                        click: function(evt) {
                            w1.hide();

                            var title = 'Requisição de download'
                            var msg = 'Digite seu email:';
                            var checkEmail = function(btn, text) {
                                
                                if(btn == 'ok') {
                                    var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                    if (emailRegex.test(text)) {
                                        instance.sendEmailRequest(selectedLayer.json, text);
                                    } else {
                                        msg = 'Email inválido. Por favor digite um email válido:'
                                        Ext.MessageBox.prompt(title, msg, checkEmail);
                                    }
                                }
                            }

                            Ext.MessageBox.prompt(title, msg, checkEmail);
                        }
                    }
                }]
            });
            w1.show()

            return w1;
        }

        return null;
    }
        
});

Ext.preg(gxp.plugins.LapigDownloadAll.prototype.ptype, gxp.plugins.LapigDownloadAll);
