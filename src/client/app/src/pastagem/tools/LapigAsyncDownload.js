/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires tools/LapigDownload.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = LapigAsyncDownload
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: LapigAsyncDownload(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.LapigAsyncDownload = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_lapigdownloadlayer */
    ptype: "gxp_lapigasyncdownload",
    
    /** api: config[menuText]
     *  ``String``
     *  Text for remove menu item (i18n).
     */
    menuText: "Download",
    
    /** api: method[addActions]
     */
    addActions: function() {

        this.LapigDownload = new gxp.plugins.LapigDownload();

        var downloadLayer = new GeoExt.Action({
            iconCls: "gxp-icon-downloadlayer",
            handler: function() {
                this.download = {
                    title: downloadLayer.getText()
                };
                this.removeOutput();
                this.addOutput();
            }.bind(this)
        });

        var downloadMap = new GeoExt.Action({
            iconCls: "gxp-icon-downloadmap",
            text: "Todas as camadas habilitadas do mapa",
            handler: function() {
                
                this.download.title = downloadMap.getText();
                this.removeOutput();
                this.addOutput();
            }.bind(this)
        });

        var ftp = new GeoExt.Action({
            iconCls: "gxp-icon-downloadmany",
            hidden: true,
            handler: function() {

                var layer = this.selectedLayer.json.name;
                var title = "Download - Produto " + this.produtoName() + " (LAPIG-FTP)";

               Ext.Ajax.request({
                    url: '/ogc-server/user',
                    success: function(response, opts) {
                        var user = JSON.parse(response.responseText);
                        
                        Ext.MessageBox.prompt(title, 'O link para download será enviado para o email', function(btn, text){
                            if (btn == 'ok'){
                                Ext.Ajax.request({
                                    url: '/ogc-server/download-ftp',
                                    params: {
                                        layer: layer,
                                        email: text
                                    },
                                    success: function(response, opts) {
                                        Ext.MessageBox.show({
                                           title: title,
                                           msg: 'Foi enviado um email para ' + text + ' com as informações necessárias para realizar o download dos dados.',
                                           buttons: Ext.MessageBox.OK,
                                           animateTarget: 'downloadBtn',
                                           icon: Ext.MessageBox.INFO
                                       });
                                    }
                                });
                            }
                        }, this, false, user.email);
                    }
                });            

            }.bind(this)
        });

        this.activeIndex = 0;
        this.button = new Ext.SplitButton({
            iconCls: "gxp-icon-asyncdownloadlayer",
            text: this.menuText,
            disabled: true,
            scope: this,
            menu: new Ext.menu.Menu({
                items: [ downloadLayer, ftp ]
            })
        });

        this.target.on("layerselectionchange", function(record) {
            this.selectedLayer = record;
            if(this.selectedLayer && this.selectedLayer.json) {
                this.button.setDisabled(false);

                downloadLayer.setText(this.selectedLayer.data.title);

                if(this.isSerieTemporal()) {
                    ftp.hide();
                } else {
                    ftp.show();
                    ftp.setText("Produto " + this.produtoName() + " (LAPIG-FTP)");
                }
            } else {
                this.button.setDisabled(true);
            }

        }, this);

        return gxp.plugins.LapigAsyncDownload.superclass.addActions.apply(this, [this.button]);
    },

    isSerieTemporal: function() {
        var layername = this.selectedLayer.json.name;
        return     layername.indexOf("GRACE") == -1
                && layername.indexOf("TRMM") == -1
                && layername.indexOf("MODIS") == -1;
    },

    produtoName: function(i) {
        var layername = this.selectedLayer.json.name;

        var workspace = layername.split(":")[0];
        return workspace.replace("WS_LAPIG_IMAGENS-ORBITAIS_", "").split('_')[0];
    },

    camadasDoMapa: function() {
        var mapPanel = this.target.mapPanel;

        var resultado = {
            param: []
        };

        mapPanel.layers.data.items.forEach(function(item) {
            if(item.json) {
                var layername = item.json.name.split(":")[1];
                if( item.data.layer.visibility )
                    resultado.param.push(layername);
            }
        })

        resultado.param = resultado.param.join(",");

        return resultado;
    },

    addOutput: function(selectedLayer) {
        
        var title       = 'Download - '+this.download.title;

        var form = new Ext.form.FormPanel({
            baseCls: 'x-plain',
            labelWidth: 55,
            url: 'save-form.php',
            layout: {
                type: 'vbox',
                align: 'stretch'  // Child items are stretched to full width
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

        var w = new Ext.Window({
            title: title,
            collapsible: true,
            maximizable: true,
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
                        
                        if(this.download.param) {
                            window.open('/ogc-server/download-page?layer='+this.download.param);
                        } else {
                            console.log(this.LapigDownload, this.selectedLayer.json.name);
                            this.LapigDownload.download(this.selectedLayer.json.name);
                        }

                        w.hide();

                    }.bind(this)
                }
            }]
        });

        w.show()

        return w;
    }
        
});

Ext.preg(gxp.plugins.LapigAsyncDownload.prototype.ptype, gxp.plugins.LapigAsyncDownload);
