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
        this.getOptionsCmp(),
        this.getGridCmp(),
      ]
    };
  },

  handleLayer: function(layerName, layerTitle, filter, bbox, setupOthers, type, visibility) {
    var tool = this;
    var layerManager = tool._layers;
    var app = tool.target;
    var mapPanel = tool.target.mapPanel;

    //instance._layers.remove(type)

    if(layerManager.exists(layerName, type)) {
      var bounds = layerManager.zoomToExtent(bbox);

      layerManager.update(layerName, layerTitle, filter, type, visibility, bounds)
      
    } else {
          
      if(setupOthers == true)
        layerManager.setupOthers()

      var bounds = layerManager.zoomToExtent(bbox);

      layerManager.add(layerName, layerTitle, filter, type, visibility, bounds)
    }

    
  },
  _layers: {

    layerCollection: {},

    exists: function(name, type) {
      return (this.layerCollection[type] != undefined && this.layerCollection[type][name] != undefined);
    },
    zoomToExtent: function(bbox) {
      var coord = bbox.split(',')

      var bounds = new OpenLayers.Bounds();
      bounds.extend(new OpenLayers.LonLat(coord[0],coord[1]).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913')));
      bounds.extend(new OpenLayers.LonLat(coord[2],coord[3]).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913')));
      
      mapPanel.map.zoomToExtent(bounds);

      return bounds;
    },
    removeAll: function(type) {
      for(var name in this.layerCollection[type]) {
        this.remove(name, type);
      }
    },
    remove: function(name, type) {
      if(this.layerCollection[type][name]) {
        mapPanel.layers.remove(this.layerCollection[type][name]);
        this.layerCollection[type][name] = null;
      }
    },
    update: function(name, title, filter, type, visibility, bounds) {
      this.layerCollection[type][name].beginEdit();
      this.layerCollection[type][name].data.layer.name = title;
      this.layerCollection[type][name].data.layer.params['cql_filter'] = filter;

      this.layerCollection[type][name].data.layer.maxExtent = bounds;
      this.layerCollection[type][name].data.layer.restrictedExtent = bounds;
      
      this.layerCollection[type][name].data.layer.setVisibility(visibility);

      this.layerCollection[type][name].data.layer.redraw(true);

      this.layerCollection[type][name].endEdit();
      this.layerCollection[type][name].commit();
    },
    add: function(name, title, filter, type, visibility, bounds) {

      if( this.layerCollection[type] == undefined )
        this.layerCollection[type] = {}

      var layerConfig = { 
        source: 'ows', 
        cql_filter: filter, 
        name: name, 
        title: title,
        visibility: visibility
      }

      app.createLayerRecord(layerConfig, function(record) {
        record.json = {};

        this.layerCollection[type][name] = record;
        this.layerCollection[type][name].beginEdit();
        
        this.layerCollection[type][name].data.layer.maxExtent = bounds;
        this.layerCollection[type][name].data.layer.restrictedExtent = bounds;

        this.layerCollection[type][name].data.layer.name = layerConfig.title;
        this.layerCollection[type][name].endEdit();
        this.layerCollection[type][name].commit();

        mapPanel.layers.add(this.layerCollection[type][name]);
      }.bind(this) );
    
    },
    setupOthers: function() {
      mapPanel.layers.each(function(layerRec) {
        var layer = layerRec.data.layer;
        
        if(layer instanceof OpenLayers.Layer.WMS) {
          layer.setVisibility(false);
        } else if(layerRec.data.title == "Bing Roads") {
          layer.setVisibility(true);
        }
      });
    }
  },

  getOptionsCmp: function(){

    var instance = this;

    var requestMetadata = function(callback) {
      var metadataUrl = 'spatial/livestock/metadata';

      Ext.Ajax.request({
      url: metadataUrl,
      method: 'GET',
      timeout: 360000,
      success: function(request) {
        instance.queryMetadata = JSON.parse(request.responseText);
        instance.queryMetadata.layers = instance.queryMetadata.layers.reverse();
        callback()
      },                                    
    });

    }

    var checkSubmitBtn = function(obj, record) {
      
      if(obj.id == 'lapig_spatialintelligence::cmb-state') {
        instance.selectedState = record
      }

      var gridInfo = Ext.getCmp('lapig_spatialintelligence::grid-info');
      var selectedSubject = Ext.getCmp('lapig_spatialintelligence::cmb-subject').getValue();
      var selectedState = Ext.getCmp('lapig_spatialintelligence::cmb-state').getValue();
      var selectedSort = Ext.getCmp('lapig_spatialintelligence::cmb-sort').getValue();
      var btnSubmit = Ext.getCmp('lapig_spatialintelligence::btn-submit');

      instance._layers.removeAll('city');
      instance._layers.removeAll('state');

      gridInfo.getRootNode().removeAll();

      btnSubmit.setDisabled( !(selectedSubject && selectedState && selectedSort) );
      gridInfo.setDisabled(true);
    }

    var submit = function(evt) {
      var gridInfoId = 'lapig_spatialintelligence::grid-info';
      var gridInfo = Ext.getCmp(gridInfoId);
      var selectedSubject = Ext.getCmp('lapig_spatialintelligence::cmb-subject').getValue();
      var selectedState = Ext.getCmp('lapig_spatialintelligence::cmb-state').getValue();
      var selectedSort = Ext.getCmp('lapig_spatialintelligence::cmb-sort').getValue();

      var loadMask = createLoadDataMask(gridInfoId)
      loadMask.show()

      requestMetadata(function() {

        var params = 'state=' + selectedState + '&sort=' + selectedSort
        gridInfo.loader.dataUrl = 'spatial/' + selectedSubject + '/query?' + params;
        instance.csvUrl = 'spatial/' + selectedSubject + '/csv?' + params;

        var newNode = new Ext.tree.AsyncTreeNode({text: 'Root'});
        gridInfo.loader.load(newNode, function(newNode) {
          gridInfo.setRootNode(newNode);
          loadMask.hide();
          gridInfo.setDisabled(false);
          
          var layerName = instance.queryMetadata.region.layer;
          var layerTitle = instance.selectedState.data.label + " - " + instance.queryMetadata.region.title;
          var filter = "'[" + instance.queryMetadata.region.columns.stateAb + "]' = '" + instance.selectedState.data.id + "'";
          var bbox = instance.selectedState.data.bbox

          instance.handleLayer(layerName, layerTitle, filter, bbox, true, 'state', true);

        });
        
      })


    }

    var createLoadDataMask = function(elementId) {
      var gridPanel = Ext.getDom(elementId);
      var msgText = "Consultando...";
      
      return new Ext.LoadMask(gridPanel, { msg: msgText });
    }

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
          listeners: {
            select: checkSubmitBtn
          },
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
          listeners: {
            select: checkSubmitBtn
          },
          store:  new Ext.data.ArrayStore({
            fields: [
              {name: 'id'}, 
              {name: 'label'},
              {name: 'bbox'}
            ],
            data: [
              ['AC', 'Acre',  '-73.990943646787,-11.14483312889739,-66.61936007121035,-7.111457313901811'],
              ['AL', 'Alagoas', '-38.23723765847232,-10.49991242751231,-35.15226052810746,-8.812707713946306'],
              ['AM', 'Amazonas',  '-73.80098229366574,-9.817660810954109,-56.09707466533389,2.24657473081615'],
              ['AP', 'Amapá', '-54.87577460655976,-1.235630097206611,-49.87577596849272,4.437060299108815'],
              ['BA', 'Bahia', '-46.61667238804129,-18.34893845945487,-37.34080010786623,-8.533077608153793'],
              ['CE', 'Ceará', '-41.42314276802073,-7.857773760556362,-37.25264223538931,-2.784032263859355'],
              ['DF', 'Distrito Federal',  '-48.28665562853161,-16.05131120480394,-47.30776135069044,-15.49971572791068'],
              ['ES', 'Espírito Santo',  '-41.87939124095406,-21.301288430759,9.66563575186419,-17.89146972697392'],
              ['GO', 'Goiás', '-53.25072227861539,-19.49869140776348,-45.90654432747818,-12.39550507262561'],
              ['MA', 'Maranhão',  '-48.7547164838366,-10.26124031754762,-41.79623316434894,-1.044135365616286'],
              ['MG', 'Minas Gerais',  '-51.04546754380609,-22.92226694061974,-39.85645274188406,-14.23273478616196'],
              ['MS', 'Mato Grosso Do Sul',  '-58.16704468477753,-24.06790392043327,-50.92265438320943,-17.16619496179095'],
              ['MT', 'Mato Grosso', '-61.63282458549314,-18.04113392716333,-50.22435669088633,-7.348647867021772'],
              ['PA', 'Pará',  '-58.89713089740838,-9.840743617778214,-46.0605348905208,2.591355735126576'],
              ['PB', 'Paraíba', '-38.76499490088651,-8.302540221840562,-34.79333472998506,-6.025516029553926'],
              ['PE', 'Pernambuco',  '-41.35795780124156,-9.482478264310442,-32.39219016381675,-3.830062812902576'],
              ['PI', 'Piauí', '-45.99387843152558,-10.92833248807644,-40.37014141599888,-2.738941203025053'],
              ['PR', 'Paraná',  '-54.61863413982433,-26.71680856248925,-48.02306675959305,-22.51582628641998'],
              ['RJ', 'Rio De Janeiro',  '-44.88849349002591,-23.36769836480608,-40.9563947928047,-20.76353799938587'],
              ['RN', 'Rio Grande Do Norte', '-38.58118965671923,-6.982330999424829,-34.96821735468426,-4.831325868341867'],
              ['RO', 'Rondônia',  '-66.80573435974838,-13.6932892296135,-59.77383540127021,-7.968911558440769'],
              ['RR', 'Roraima', '-64.82471613282798,-1.580279010122118,-58.8863839458957,5.272155629716081'],
              ['RS', 'Rio Grande Do Sul', '-57.6432174962109,-33.75158274659308,-49.69114252468573,-27.08011349617855'],
              ['SC', 'Santa Catarina',  '-53.83584077230005,-29.35093805532915,-48.35831004252309,-25.9555923981206'],
              ['SE', 'Sergipe', '-38.24469318793231,-11.56820208985067,-36.39353085815849,-9.514607787467376'],
              ['SP', 'São Paulo', '-53.10935612642795,-25.31182903176157,-44.16051713806287,-19.77919383235752'],
              ['TO', 'Tocantins', '-50.74160818574438,-13.46727761938996,-45.69711366617483,-5.167998438250915']
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
          listeners: {
            select: checkSubmitBtn
          },
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
          id: 'lapig_spatialintelligence::btn-submit',
          disabled: true,
          listeners: {
            click: submit,
          },
        }
      ]
    }
  },

  getGridCmp: function (){
    
    var instance = this;
    
    return {
        xtype: 'treegrid',
        id: 'lapig_spatialintelligence::grid-info',
        tbar: [
          {
            xtype: 'label',
            text: 'Clique duas vezes no município para localizá-lo'
          },
          '->',
          {
            xtype: 'button',
            iconCls: 'lapig-icon-csv',
            listeners: {
              click: function() {
                window.open(instance.csvUrl)
              }
            }
          }
        ],
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
        requestMethod: 'GET',
        listeners: {
          'dblclick': function(node) {
            var attr = node.attributes;
            var parentAttr = node.parentNode.attributes;

            if(attr.bbox) {
              var bbox = attr.bbox;
              var layers = instance.queryMetadata.layers;
              var columnCityCode = instance.queryMetadata.region.columns.cityCode;
              
              instance._layers.removeAll('city');
              
              layers.forEach(function(layer) {

                if(layer.visualization) {
                  var layerName = layer.table;
                  var layerTitle = attr['info'] + " - " + layer.title;
                  var filter = "'[" + columnCityCode + "]' = '" + attr['COD_MUN'] + "'";
                  var bbox = attr.bbox;

                  var visibility = (parentAttr.table == layerName) ? true : false;

                  instance.handleLayer(layerName, layerTitle, filter, bbox, false, 'city', visibility);
                }

              })
            }

            /*if(attr['layer'] && attr['column'] && attr['title']) {
              
            }*/

          }
        }
    };

  },

});

Ext.preg(lapig.tools.SpatialIntelligence.prototype.ptype, lapig.tools.SpatialIntelligence);