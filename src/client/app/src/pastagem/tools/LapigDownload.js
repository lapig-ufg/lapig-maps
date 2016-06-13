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

gxp.plugins.LapigDownload = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_lapigdownload",
    
    menuText: "Download",
    
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.LapigDownload.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            text: this.menuText,
            iconCls: "gxp-icon-asyncdownloadlayer",
            disabled: true,
            tooltip: this.tooltip,
            handler: function() {
                lapigAnalytics.clickTool('Tools', 'Download Layer', '');
                this.removeOutput();
                this.addOutput(selectedLayer);
            },
            scope: this
        }]);
        var removeLayerAction = actions[0];

        this.target.on("layerselectionchange", function(record) {
            selectedLayer = record;
            removeLayerAction.setDisabled(
                this.target.mapPanel.layers.getCount() <= 1 || !(record && record.json && record.json.name)
            );
        }, this);
        var enforceOne = function(store) {
            removeLayerAction.setDisabled(
                !selectedLayer || store.getCount() <= 1
            );
        };
        this.target.mapPanel.layers.on({
            "add": enforceOne,
            "remove": enforceOne
        });
        
        return actions;
    },

    download: function(layerName, layerType, metadata) {
        var params = [];

        if (layerType == 'VECTOR') {
            params = [
                    'REQUEST=GetFeature'
                ,   'SERVICE=wfs'
                ,   'VERSION=1.0.0'
                ,   'TYPENAME=' + layerName
                ,   'OUTPUTFORMAT=shape-zip'
            ];

        } else if (layerType == 'RASTER') {
            params = [
                    'REQUEST=GetCoverage'
                ,   'SERVICE=WCS'
                ,   'VERSION=2.0.0'
                ,   'COVERAGEID=' + layerName
                ,   'FORMAT=tiff-zip'
            ];

        }

        lapigAnalytics.clickTool('Download Layer','request-download',layerName);

        if(params.length > 0) {
            if(metadata){
                params.push('METADATA=' + metadata)
            }

            var iframe = Ext.DomHelper.append(Ext.getBody(),{
                    tag : 'iframe'
                    ,src: '/ows?' + params.join('&')
                    ,cls: 'x-hidden'
            });
            
        } else {
            alert("Dados inválidos para download. Entre em contato com a equipe de administração do sistema.")
        }

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

            var w = new Ext.Window({
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
                            instance.download(layerName, layerType, metadata);
                            w.hide();
                        }
                    }
                }]
            });
            w.show()

            return w;
        }

        return null;
    }
        
});

Ext.preg(gxp.plugins.LapigDownload.prototype.ptype, gxp.plugins.LapigDownload);
