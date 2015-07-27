Ext.namespace("gxp.plugins"); 

gxp.plugins.LapigPublicacoes = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_lapigpublicacoes",
    
    pubLayer: 'WS_LAPIG_INDICES:or_publicacoes_lapig',

    data: null,

    addActions: function() {
        var actions = gxp.plugins.LapigPublicacoes.superclass.addActions.apply(this, [{
            tooltip: 'Busca Geolocalizada de Publicações',
            iconCls: "gxp-icon-lapigpublicacoes",
            handler: function() {
                this.removeOutput();
                this.addOutput(true);

                var instance = this;
                var map = this.target.mapPanel.map;

                map.events.register("moveend", map, function() {
                    instance.addOutput(false);
                });
            },
            scope: this
        }]);
        
        return actions;
    },

    gerenerateWindow: function() {

        var instance = this;

        var reader = new Ext.data.JsonReader({
            root: 'data',
            idProperty: 'nome_pub',
            fields: ['nome_pub', 'regiao', 'categoria', 'url'] 
        });

        instance.gridStore = new Ext.data.GroupingStore({
            reader: reader,
            data: instance.gridData,
            sortInfo:{field: 'nome_pub', direction: "ASC"},
            groupField:'categoria'
        });

        var grid = new Ext.grid.GridPanel({
            store: instance.gridStore,
            autoExpandColumn: 'nome_pub',
            columns: [
                {id:'nome_pub',header: "Publicação", sortable: true, dataIndex: 'nome_pub'},
                {header: "Região Geográfica", width: 60, sortable: true, dataIndex: 'regiao'},
                {header: "Categoria", width: 40, sortable: true, dataIndex: 'categoria', hidden: true}
            ],

            view: new Ext.grid.GroupingView({
                forceFit:true,
                startCollapsed: true,
                groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
            }),
            height: 400,
            frame:false,
            listeners: {
                rowClick: function(grid, rowIndex, columnIndex, e) {

                    var record = grid.getStore().getAt(rowIndex);
                    window.open(record.data.url);
                }
            }
        });

        this.comboStore = new Ext.data.ArrayStore({
            id: 0,
            fields: [
                'text'
            ],
            data: instance.regioes
        });

        var form = new Ext.form.FormPanel({
            labelAlign: 'left',
            labelWidth: 145,
            frame:true,
            border: false,
            autoHeight: true,
            defaults: {padding: '10px 0px 0px 0px'},
            items: [
                {
                    xtype: 'label',
                    text: 'Essa ferramenta utiliza a vista do mapa para buscar por publicações no LAPIG-Database.'
                },
                {
                    layout:'column',
                    items: [
                        {
                            columnWidth:.99,
                            layout: 'form',
                            items: [
                                {
                                    xtype: 'combo',
                                    mode: 'local',
                                    triggerAction: 'all',
                                    forceSelection: true,
                                    fieldLabel: 'Filtrar por Região Geográfica',
                                    store: instance.comboStore,
                                    labelStyle:'font-size:11px;',
                                    valueField: 'text',
                                    displayField: 'text',
                                    anchor:'100%',
                                    listeners: {
                                        select: function( combo, record, index ) {
                                            grid.getStore().filterBy(
                                                function (row) {
                                                    
                                                    if(record.id == 'TODAS AS REGIÕES')
                                                        return true;

                                                    return (row.data.regiao == record.id);
                                                }
                                            );
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    layout:'fit',
                    items: grid
                }
            ]
        });


       var w = new Ext.Window({
            title: 'Busca Geolocalizada de Publicações',
            width: 750,
            height: 500,
            layout: 'fit',
            plain: true,
            items: form,
            bodyStyle: 'padding:0px;'
        });

        w.show();

    },

    addOutput: function(showWindow) {

        var instance = this;

        var extent = this.target.mapPanel.map.getExtent().transform( new OpenLayers.Projection('EPSG:900913'), new OpenLayers.Projection('EPSG:4326'));

        var cqlFilter = 'INTERSECTS(the_geom,' +
        ' POLYGON(( ' +
            extent.left  + ' ' + extent.bottom  + ', ' +
            extent.left  + ' ' + extent.top     + ', ' +
            extent.right + ' ' + extent.top     + ', ' +
            extent.right + ' ' + extent.bottom  + ', ' +
            extent.left  + ' ' + extent.bottom  +
        ' ))) ';

        var url = '/ogc-server/WS_LAPIG_INDICES/ows' +
                    '?service=WFS' + 
                    '&version=1.0.0' +
                    '&request=GetFeature' +
                    '&typeName=' + this.pubLayer +
                    '&outputFormat=json' +
                    '&propertyName=categoria,id_databas,regiao,url,nome_pub' + 
                    '&cql_filter=' + cqlFilter;
        
        Ext.Ajax.request({
             url: url,
             success: function(response, opts) {
                
                var geoJson = JSON.parse(response.responseText);

                var regioes = [];
                var categorias = [];

                var gridData = [];
                var regioesTmp = {};
                var categoriasTmp = {};

                geoJson.features.forEach(function(f) {
                    gridData.push(f.properties);
                    regioesTmp[f.properties.regiao] = true;
                    categoriasTmp[f.properties.categoria] = true;
                });
                
                regioes.push(['TODAS AS REGIÕES']);
                for(var key in regioesTmp)
                    regioes.push([key]);

                for(var key in categoriasTmp)
                    categorias.push([key]);

                instance.gridData = { data: gridData };
                instance.regioes = regioes;
                
                if(showWindow) {
                    instance.gerenerateWindow();    
                } else {
                    if(instance.comboStore) {
                        instance.comboStore.loadData(instance.regioes);    
                    }
                    if(instance.gridStore) {
                        instance.gridStore.loadData(instance.gridData);
                    }
                    
                    
                }

             },
            failure: function(response, opts){
                Ext.getBody().unmask();
            }
        });

    }
        
});

Ext.preg(gxp.plugins.LapigPublicacoes.prototype.ptype, gxp.plugins.LapigPublicacoes);
