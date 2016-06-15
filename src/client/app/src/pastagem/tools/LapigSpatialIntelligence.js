/**
 * @requires plugins/Tool.js
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
    this.timeSeriesTreeUrl = 'time-series/tree?projects=' + this.projectsParam + '&lang='+i18n.lang;

    Ext.chart.Chart.CHART_URL = 'src/ext/resources/charts.swf';
    Ext.Ajax.timeout = 120000;
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

  getParams: function() {
  	var instance = this;

    return 'region=' + instance.selectedRegion.data.id 
         + '&regionType=' + instance.selectedRegion.data.regionType
         + '&city=' + Ext.getCmp('lapig_spatialintelligence::cmb-cities').getValue()
         + '&lang=' + i18n.lang;
  },

  updateGrid: function() {
  	var instance = this;

  	var gridInfoId = 'lapig_spatialintelligence::grid-info';
    var cmbCities = Ext.getCmp('lapig_spatialintelligence::cmb-cities');
    var btnClearFilter = Ext.getCmp('lapig_spatialintelligence::btn-clear-filter');

    if(cmbCities.getValue() != '') {
      btnClearFilter.show();
    } else {
      btnClearFilter.hide();
    }

    var createLoadDataMask = function(elementId) {
      var gridPanel = Ext.getDom(elementId);
      var msgText = i18n.LAPIG_WAITING_MSG;
      
      return new Ext.LoadMask(gridPanel, { msg: msgText });
    }

    var gridInfo = Ext.getCmp(gridInfoId);

    instance.loadMask = createLoadDataMask(gridInfoId)
    instance.loadMask.show()
    
    gridInfo.loader.dataUrl = 'spatial/query?' + instance.getParams();
    instance.csvUrl = 'spatial/csv?' +  instance.getParams();

    var newNode = new Ext.tree.AsyncTreeNode({text: 'Root'});
    gridInfo.setRootNode(newNode);
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

      layerManager.add(app, layerName, layerTitle, filter, type, visibility, bounds)
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
    add: function(app, name, title, filter, type, visibility, bounds) {

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
        } else if(layerRec.data.title == "Google Terrain") {
          layer.setVisibility(true);
        }
      });
    }
  },

  getOptionsCmp: function(){

    var instance = this;

    var requestMetadata = function(callback) {
      
      var metadataUrl = 'spatial/metadata?' + instance.getParams();

      Ext.Ajax.request({
      url: metadataUrl,
      method: 'GET',
      timeout: 360000,
	      success: function(request) {
	        instance.queryMetadata = JSON.parse(request.responseText);

	        instance.queryMetadata.cities.unshift({
	        	'COD_MUNICI': '',
	        	'info': i18n.LAPIGSPATIALINTELLIGENCE_ALL_CITIE
	        })
					
          var cities = Ext.getCmp('lapig_spatialintelligence::cmb-cities');
          
          cities.store.removeAll();
          cities.store.loadData(instance.queryMetadata.cities);
					cities.setValue('');

	        callback()
	      }
    	});

    }

    var checkSubmitBtn = function(obj, record) {
      
      if(obj.id == 'lapig_spatialintelligence::cmb-regions') {
        instance.selectedRegion = record  
      
        recValue = record.json[0].substring(0,(record.json[0].length - 1));
        if(recValue == 'undefined') {
          Ext.getCmp('lapig_spatialintelligence::cmb-regions').setValue('')
        }
      }

      var gridInfo = Ext.getCmp('lapig_spatialintelligence::grid-info');
      var selectedRegion = Ext.getCmp('lapig_spatialintelligence::cmb-regions').getValue();
      var btnSubmit = Ext.getCmp('lapig_spatialintelligence::btn-submit');

      instance._layers.removeAll('city');
      instance._layers.removeAll('state');

      gridInfo.getRootNode().removeAll();

      btnSubmit.setDisabled( !(selectedRegion) );
      gridInfo.setDisabled(true);
    }

    var submit = function(evt) {
      requestMetadata(function() {
        instance.updateGrid();
      });
    }

    return {
      layout: 'form',
      border: false,
      xtype: 'panel',
      flex: 1, 
      autoScroll:false,
      labelWidth:130,
      height: 70,
      items: [
        {
          xtype:'combo',
          displayField:'label',
          fieldLabel: i18n.LAPIGSPATIALINTELLIGENCE_FIELDLBL_ROI,
          id: 'lapig_spatialintelligence::cmb-regions',
          valueField: 'id',
          mode: 'local',
          typeAhead: true,
          editable: false,
          triggerAction: 'all',
          flex: 1,
          listeners: {
            select: checkSubmitBtn
          },
          store:  {
            xtype: "arraystore",
            fields: [
              {name: 'id'}, 
              {name: 'label'},
              {name: 'bbox'},
              {name: 'regionType'}
            ],
            data: [
              ['undefined1', '---- <b>Regiões de interesse</b> ----'],
              ['ARC_DEFORESTATION', 'Arco do desmatamento',  '-70.6208697166754,-13.8706697433894,-44.8983096783213,-1.04397682863616', 'ROI'],
              ['MATOPIBA', 'Matopiba',  '-50.742063982783,-15.2647043201696,-41.7958843801099,-2.2193566757778', 'ROI'],
              ['undefined2', '---- <b>Biomas</b> ----'],
              ['AMAZÔNIA', 'Amazônia',  '-73.9904499596311,-16.2905190391443,-43.0177679425571,5.27184107515087', 'biome'],
              ['CAATINGA', 'Caatinga',  '-44.5084182970686,-16.0884759016231,-35.0985861479423,-2.78423064952074', 'biome'],
              ['CERRADO', 'Cerrado',  '-60.1094168432324,-24.6846259981298,-41.5221150102917,-2.32633300152119', 'biome'],
              ['MATA-ATLÂNTICA', 'Mata Atlântica',  '-55.7812928486603,-29.9727657537398,-28.835907628963,-3.83006497691515', 'biome'],
              ['PAMPA', 'Pampa',  '-57.6433158444357,-33.751583006014,-49.6776313399901,-28.0951804998136', 'biome'],
              ['PANTANAL', 'Pantanal',  '-59.186801362403,-22.1504419255242,-54.9218143293872,-15.1329088319936', 'biome'],
              ['undefined3','---- <b>Estados</b> ----'],
              ['AC', 'Acre',  '-73.990943646787,-11.14483312889739,-66.61936007121035,-7.111457313901811', 'state'],
              ['AL', 'Alagoas', '-38.23723765847232,-10.49991242751231,-35.15226052810746,-8.812707713946306', 'state'],
              ['AM', 'Amazonas',  '-73.80098229366574,-9.817660810954109,-56.09707466533389,2.24657473081615', 'state'],
              ['AP', 'Amapá', '-54.87577460655976,-1.235630097206611,-49.87577596849272,4.437060299108815', 'state'],
              ['BA', 'Bahia', '-46.61667238804129,-18.34893845945487,-37.34080010786623,-8.533077608153793', 'state'],
              ['CE', 'Ceará', '-41.42314276802073,-7.857773760556362,-37.25264223538931,-2.784032263859355', 'state'],
              ['DF', 'Distrito Federal',  '-48.28665562853161,-16.05131120480394,-47.30776135069044,-15.49971572791068', 'state'],
              ['ES', 'Espírito Santo',  '-41.87939124095406,-21.301288430759,9.66563575186419,-17.89146972697392', 'state'],
              ['GO', 'Goiás', '-53.25072227861539,-19.49869140776348,-45.90654432747818,-12.39550507262561', 'state'],
              ['MA', 'Maranhão',  '-48.7547164838366,-10.26124031754762,-41.79623316434894,-1.044135365616286', 'state'],
              ['MG', 'Minas Gerais',  '-51.04546754380609,-22.92226694061974,-39.85645274188406,-14.23273478616196', 'state'],
              ['MS', 'Mato Grosso Do Sul',  '-58.16704468477753,-24.06790392043327,-50.92265438320943,-17.16619496179095', 'state'],
              ['MT', 'Mato Grosso', '-61.63282458549314,-18.04113392716333,-50.22435669088633,-7.348647867021772', 'state'],
              ['PA', 'Pará',  '-58.89713089740838,-9.840743617778214,-46.0605348905208,2.591355735126576', 'state'],
              ['PB', 'Paraíba', '-38.76499490088651,-8.302540221840562,-34.79333472998506,-6.025516029553926', 'state'],
              ['PE', 'Pernambuco',  '-41.35795780124156,-9.482478264310442,-32.39219016381675,-3.830062812902576', 'state'],
              ['PI', 'Piauí', '-45.99387843152558,-10.92833248807644,-40.37014141599888,-2.738941203025053', 'state'],
              ['PR', 'Paraná',  '-54.61863413982433,-26.71680856248925,-48.02306675959305,-22.51582628641998', 'state'],
              ['RJ', 'Rio De Janeiro',  '-44.88849349002591,-23.36769836480608,-40.9563947928047,-20.76353799938587', 'state'],
              ['RN', 'Rio Grande Do Norte', '-38.58118965671923,-6.982330999424829,-34.96821735468426,-4.831325868341867', 'state'],
              ['RO', 'Rondônia',  '-66.80573435974838,-13.6932892296135,-59.77383540127021,-7.968911558440769', 'state'],
              ['RR', 'Roraima', '-64.82471613282798,-1.580279010122118,-58.8863839458957,5.272155629716081', 'state'],
              ['RS', 'Rio Grande Do Sul', '-57.6432174962109,-33.75158274659308,-49.69114252468573,-27.08011349617855', 'state'],
              ['SC', 'Santa Catarina',  '-53.83584077230005,-29.35093805532915,-48.35831004252309,-25.9555923981206', 'state'],
              ['SE', 'Sergipe', '-38.24469318793231,-11.56820208985067,-36.39353085815849,-9.514607787467376', 'state'],
              ['SP', 'São Paulo', '-53.10935612642795,-25.31182903176157,-44.16051713806287,-19.77919383235752', 'state'],
              ['TO', 'Tocantins', '-50.74160818574438,-13.46727761938996,-45.69711366617483,-5.167998438250915', 'state']
            ]
          }
        }
      ],
      buttons: [
        {
          text: i18n.LAPIGSPATIALINTELLIGENCE_BTNTXT_CONSULT,
          id: 'lapig_spatialintelligence::btn-submit',
          disabled: true,
          listeners: {
            click: function() {
              submit();
              var clickSelectedState = Ext.getCmp('lapig_spatialintelligence::cmb-regions').getValue();
              lapigAnalytics.clickTool('Spatial Intelligence','click-Consult',clickSelectedState);
            }
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
					  xtype:'combo',
					  displayField:'info',
					  fieldLabel: '',
					  id: 'lapig_spatialintelligence::cmb-cities',
					  valueField: 'COD_MUNICI',
					  mode: 'local',
					  typeAhead: true,
					  editable: true,
					  triggerAction: 'all',
					  listeners: {
	            select: function(evt, record) {
                instance._layers.removeAll('city');
                instance.selectCity = record.data;
                lapigAnalytics.clickTool('Spatial Intelligence', 'click-cityFilter', instance.selectCity.info);
                instance.updateGrid();
              }.bind(instance)
	          },
            store: {
              xtype: 'jsonstore',
              fields: [ 
                  {type: 'string', name: 'COD_MUNICI'},
                  {type: 'string', name: 'info'},
                  {type: 'string', name: 'bbox'}
              ]
            }
					},
          {
            xtype: 'button',
            id: 'lapig_spatialintelligence::btn-clear-filter',
            iconCls: "spatial-intelligence-clear-filter",
            hidden: true,
            listeners: {
              click: function() {
                lapigAnalytics.clickTool('Spatial Intelligence', 'click-clearFilter', '')
                var cities = Ext.getCmp('lapig_spatialintelligence::cmb-cities');
                instance._layers.removeAll('city');
                cities.setValue('');
                instance.updateGrid()
              }.bind(instance)
            }
          },
          '->',
          {
            xtype: 'button',
            iconCls: 'lapig-icon-csv',
            listeners: {
              click: function() {
                var clickSelectedState = Ext.getCmp('lapig_spatialintelligence::cmb-regions').getValue();
                lapigAnalytics.clickTool('Spatial Intelligence', 'click-csvDownloads',clickSelectedState);
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
            header: i18n.LAPIGSPATIALINTELLIGENCE_TTLCOL_INFO,
            dataIndex: 'info',
            width: 220,
          },
          {
            header: i18n.LAPIGSPATIALINTELLIGENCE_TTLCOL_VALUE,
            width: 100,
            dataIndex: 'value',
            align: 'right',
          },
        ],
        autoScroll:true,
        stripeRows: true,
        title: i18n.LAPIGSPATIALINTELLIGENCE_TTLAREA_RESULTS,
        requestMethod: 'GET',
        listeners: {
          'load': function(node) {
            if(node.text == 'Root') {
              var gridInfo = Ext.getCmp('lapig_spatialintelligence::grid-info');
              var cmbCities = Ext.getCmp('lapig_spatialintelligence::cmb-cities');

              instance.loadMask.hide();
              gridInfo.setDisabled(false);
              
              var layerName = instance.queryMetadata.layer;
              var layerTitle = instance.queryMetadata.titlePrefix + instance.selectedRegion.data.label;
              var filter = instance.queryMetadata.filter;
              var bbox = instance.selectedRegion.data.bbox;
              var columnCity = instance.queryMetadata.columnCity;

              var city =cmbCities.getValue();
              
              if( city != '') {
                bbox = instance.selectCity.bbox;
                layerTitle = instance.selectCity.info;
                filter += " AND '[" + columnCity + "]' = '" + city + "'";
                instance.handleLayer(layerName, layerTitle, filter, bbox, true, 'state', true);
              } else {
                instance.handleLayer(layerName, layerTitle, filter, bbox, true, 'state', true);
              }
            }
          },
          'dblclick': function(node) {
            var attr = node.attributes;
            var parentAttr = node.parentNode.attributes;

            var clickSelectedState = Ext.getCmp('lapig_spatialintelligence::cmb-regions').getValue();
            lapigAnalytics.clickTool('Spatial Intelligence', 'dbclick-'+parentAttr.layer, attr.layer+'-'+clickSelectedState)

            if(attr.bbox) {
              var bbox = attr.bbox;
              var fields = instance.queryMetadata.fields;
              var columnCity = instance.queryMetadata.columnCity;
              
               var createLoadDataMask = function(elementId) {
                var gridPanel = Ext.getDom(elementId);
                var msgText = i18n.LAPIG_WAITING_MSG;
                
                return new Ext.LoadMask(gridPanel, { msg: msgText });
              }

              loadMask = createLoadDataMask('westpanel')
              loadMask.show()

              instance._layers.removeAll('city');

              fields.forEach(function(field) {
                
                var filter = instance.queryMetadata.filter;

                if(field.layer) {
                  var layerName = field.layer;
                  var layerTitle = attr['info'] + " - " + field.label;
                  filter += " AND '[" + columnCity + "]' = '" + attr[columnCity] + "'";
                  var bbox = attr.bbox;

                  var visibility = (parentAttr.layer == layerName) ? true : false;

                  instance.handleLayer(layerName, layerTitle, filter, bbox, false, 'city', visibility);
                }

              });
            }

            loadMask.hide();

          }
        }
    };

  },

});

Ext.preg(lapig.tools.SpatialIntelligence.prototype.ptype, lapig.tools.SpatialIntelligence);