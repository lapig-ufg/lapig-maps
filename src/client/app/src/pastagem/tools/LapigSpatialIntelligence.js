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
      layout: 'vbox',
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
    var getMapCoordBtn = function() {
      return {
        columnWidth: .10,
        rowspan: 2,
        xtype: 'button',
        icon: 'theme/app/img/add-latlon-map.png',
        height: 10,
        tooltip: 'Clique em uma região do mapa para preencher a Latitude e Longitude.',
        style: {
          'margin-right': '10px'
        },
        handler: function() {
          var fn = function(e) {
            var lonLat = map.getLonLatFromPixel(e.xy)
                .transform(instance.GOOGLE_PROJ, instance.WGS84_PROJ);

            instance.setDd(lonLat.lon, lonLat.lat);
            instance.setDms(instance.dd2dms(lonLat.lon, lonLat.lat));

            lonLat = map.getLonLatFromPixel(e.xy);

            var size = new OpenLayers.Size(35, 35);
            var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
            var icon = new OpenLayers.Icon(instance.iconPathSelect, size, offset);

            var marker = new OpenLayers.Marker(lonLat, icon);
            instance.vectors.clearMarkers();
            instance.vectors.addMarker(marker);

            OpenLayers.Element.removeClass(map.viewPortDiv, "olControlLapigCoordenadas");
            map.events.unregister("click", map, fn);
          };

          OpenLayers.Element.addClass(map.viewPortDiv, "olControlLapigCoordenadas");
          map.events.register("click", map, fn);
        }
      }
    };

    var longLat = {
      layout: 'column',
      border: false,
      xtype: 'panel',
      autoScroll:false,
      items: [
        {
          xtype: 'compositefield',
          width:320,
          style:{
            'padding':'5px',
          },
          items: [
            getMapCoordBtn(),
           {
              //columnWidth: .40,
              xtype: 'numberfield',
              emptyText: 'Longitude',
              decimalPrecision: 4,
              width:137,
              name: 'lon',
              flex:1,
              style: {
                  'text-align': 'right'
              }
            }, 
            {
              //columnWidth: .40,
              xtype: 'numberfield',
              emptyText: 'Latitude',
              decimalPrecision: 4,
              width:137,
              name: 'lat',
              flex:1,
              style: {
                  'text-align': 'right'
              }
            },
          ]
        },
        {
          layout: 'form',
          border:false,
          padding:5,
          width:320,
          border:false,
          style:{
            'padding-top':'5px',
            'border-bottom':'2px solid #f0f0f0',
            'border-right':'2px solid #f0f0f0',
          },
          labelWidth:100,
          items: [
            {
              xtype:'combo',
              fieldLabel: 'Raio de Análise',
              border: false,
              displayField:'year',
              valueField: 'year',
              mode: 'local',
              typeAhead: true,
              editable: false,
              triggerAction: 'all',
              //flex:1,
            },
          ],
        },
      ],
    }

  return longLat;
  },

  getTreeCmp: function (){

    var tree = new Ext.ux.tree.TreeGrid({
      width: 320,
      flex:1,
      border:false,
      enableDD: true,
      columns:[
        {
          header: 'Variável',
          dataIndex: 'task',
          width: 150
        },
        {
          header: 'Valor',
          width: 85,
          dataIndex: 'duration',
          align: 'center',
          sortType: 'asFloat',
          tpl: new Ext.XTemplate('{duration:this.formatHours}', {
            formatHours: function(v) {
              if(v < 1) {
                  return Math.round(v * 60) + ' kbfs';
              } else {
                  return v + ' kbf' + (v === 1 ? '' : 's');
              }
            }
          })
        },
        {
          header: 'Opções',
          width: 85,
          dataIndex: 'user',
        }
      ],
      autoScroll:true,
      stripeRows: true,
      title: 'Resultados',
      dataUrl: 'grid/teste'
    });

  return tree;
  },

});

Ext.preg(lapig.tools.SpatialIntelligence.prototype.ptype, lapig.tools.SpatialIntelligence);