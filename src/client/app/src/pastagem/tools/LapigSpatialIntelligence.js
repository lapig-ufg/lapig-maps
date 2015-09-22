/**
 * @requires plugins/Tool.js
 * @requires OpenLayers/Layer/Markers.js
 * @requires OpenLayers/Icon.js
 * @requires OpenLayers/Marker.js
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Control/DrawFeature.js
 * @require tools/LapigCoordinates.js
 */

Ext.namespace("lapig.tools");

lapig.tools.SpatialIntelligence = Ext.extend(gxp.plugins.Tool, {

  ptype: "lapig_spatialintelligence",

  GOOGLE_PROJ: new OpenLayers.Projection("EPSG:900913"),

  WGS84_PROJ: new OpenLayers.Projection("EPSG:4326"),

  data: null,

  vectors: null,

  constructor: function(config) {
    lapig.tools.SpatialIntelligence.superclass.constructor.apply(this, arguments);

    this.projectsParam = config.project.join(',');
    this.timeSeriesTreeUrl = 'time-series/tree?projects=' + this.projectsParam;

    Ext.chart.Chart.CHART_URL = 'src/ext/resources/charts.swf';
  },

  addOutput: function(config) {
    config = Ext.apply(this.createOutputConfig(), config || {});
    var output = lapig.tools.SpatialIntelligence.superclass.addOutput.call(this, config);

    return output;
  },

  createOutputConfig: function() {
    return {
      xtype: "panel",
      layout: {
        type:'vbox',
        padding:'5',
        align:'stretch'
      },
      id: 'lapig-spatial-intelligence-pnl-main',
      border: false,
      flex:1,
      style:{
        'margin-top':'10px',
      },
      items: [
        this.getLatLongCmp(),
        this.getTreeCmp(),
      ]
    };
  },

  getLatLongCmp: function(){

    return {
      layout: 'form',
      border: false,
      xtype: 'panel',
      flex: 1, 
      autoScroll:false,
      labelWidth:130,
      height: 120,
      items: [
        {
          xtype:'combo',
          id: 'lapig_spatialintelligence::cmb-subject',
          displayField:'label',
          fieldLabel: 'Informações sobre',
          valueField: 'id',
          mode: 'local',
          typeAhead: true,
          editable: false,
          triggerAction: 'all',
          flex: 1,
          store:  new Ext.data.ArrayStore({
            fields: [
              {name: 'label'}, 
              {name: 'id'}
            ],
            data: [
              ['Pecuária', 'livestock']
            ]
          })
        },
        {
          xtype:'combo',
          displayField:'label',
          fieldLabel: 'No estado de(o)',
          id: 'lapig_spatialintelligence::cmb-state',
          valueField: 'id',
          mode: 'local',
          typeAhead: true,
          editable: false,
          triggerAction: 'all',
          flex: 1,
          store:  new Ext.data.ArrayStore({
            fields: [
              {name: 'label'}, 
              {name: 'id'}
            ],
            data: [
              ['Acre', 'AC'], 
              ['Alagoas', 'AL'],
              ['Amapá', 'AP'],
              ['Amazonas', 'AM'], 
              ['Bahia', 'BA'],
              ['Ceará', 'CE'],
              ['Distrito Federal', 'DF'], 
              ['Espírito Santo', 'ES'], 
              ['Goiás', 'GO'],
              ['Maranhão', 'MA'], 
              ['Mato Grosso', 'MT'],
              ['Mato Grosso Do Sul', 'MS'], 
              ['Minas Gerais', 'MG'], 
              ['Paraná', 'PR'], 
              ['Paraíba', 'PB'],
              ['Pará', 'PA'], 
              ['Pernambuco', 'PE'], 
              ['Piauí', 'PI'],
              ['Rio De Janeiro', 'RJ'], 
              ['Rio Grande Do Norte', 'RN'],
              ['Rio Grande Do Sul', 'RS'],
              ['Rondônia', 'RO'], 
              ['Roraima', 'RR'],
              ['Santa Catarina', 'SC'], 
              ['Sergipe', 'SE'],
              ['São Paulo', 'SP'],
              ['Tocantins', 'TO'],
            ]
          })
        },
        {
          xtype:'combo',
          id: 'lapig_spatialintelligence::cmb-sort',
          displayField:'label',
          fieldLabel: 'Ordenar munícipios por',
          valueField: 'id',
          mode: 'local',
          typeAhead: true,
          editable: false,
          triggerAction: 'all',
          flex: 1,
          store:  new Ext.data.ArrayStore({
            fields: [
              {name: 'label'}, 
              {name: 'id'}
            ],
            data: [
              ['Maior relevância', 'value'], 
              ['Ordem alfabética', 'info'],
            ]
          })
        }
      ],
      buttons: [
        {
          text: 'Consultar',
          listeners: {
            click: function(evt) {
              var gridInfo = Ext.getCmp('lapig_spatialintelligence::grid-info');
              var selectedSubject = Ext.getCmp('lapig_spatialintelligence::cmb-subject').getValue();
              var selectedState = Ext.getCmp('lapig_spatialintelligence::cmb-state').getValue();
              var selectedSort = Ext.getCmp('lapig_spatialintelligence::cmb-sort').getValue();

              var params = 'state=' + selectedState + '&sort=' + selectedSort
              gridInfo.loader.dataUrl = 'spatial/' + selectedSubject + '/query?' + params;

              var newNode = new Ext.tree.AsyncTreeNode({text: 'Root'});
              gridInfo.loader.load(newNode, function(newNode) {
                gridInfo.setRootNode(newNode);
                gridInfo.setDisabled(false);
              });
            },
          },
        }
      ]
    }
  },

  getTreeCmp: function (){
    
    var instance = this;

    var tree = new Ext.ux.tree.TreeGrid({
      id: 'lapig_spatialintelligence::grid-info',
      flex:1,
      border:false,
      enableDD: false,
      enableSort: false,
      enableHdMenu: false,
      disabled: true,
      columns:[
        {
          header: 'Informação',
          dataIndex: 'info',
          width: 180,
        },
        {
          header: 'Valor',
          width: 100,
          dataIndex: 'value',
          align: 'right',
        },
      ],
      autoScroll:true,
      stripeRows: true,
      title: 'Resultados',
      //dataUrl: 'spatial/livestock/query',
      requestMethod: 'GET',
      listeners: {
        'dblclick': function(node) {
          if(node.attributes.LON && node.attributes.LAT) {
            var mapPanel = instance.target.mapPanel;
            var point = new OpenLayers.LonLat(node.attributes.LON, node.attributes.LAT);
            point = point.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'))
            console.log(point)
            mapPanel.map.setCenter(point, 8)
            //mapPanel.map.zoomToExtent(record.getLayer().maxExtent);
          }
        }
      }
    });

  return tree;
  },

});

Ext.preg(lapig.tools.SpatialIntelligence.prototype.ptype, lapig.tools.SpatialIntelligence);