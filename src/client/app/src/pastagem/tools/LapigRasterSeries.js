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

lapig.tools.RasterSeries = Ext.extend(gxp.plugins.Tool, {

  ptype: "lapig_rasterseries",

  GOOGLE_PROJ: new OpenLayers.Projection("EPSG:900913"),

  WGS84_PROJ: new OpenLayers.Projection("EPSG:4326"),

  data: null,

  vectors: null,

  constructor: function(config) {
    lapig.tools.RasterSeries.superclass.constructor.apply(this, arguments);

    this.projectsParam = config.project.join(',');
    this.timeSeriesTreeUrl = 'time-series/tree?projects=' + this.projectsParam;

    Ext.chart.Chart.CHART_URL = 'src/ext/resources/charts.swf';
  },

  addOutput: function(config) {
    config = Ext.apply(this.createOutputConfig(), config || {});
    var output = lapig.tools.RasterSeries.superclass.addOutput.call(this, config);

    return output;
  },

  createOutputConfig: function() {
    return {
      xtype: "panel",
      layout: 'border',
      id: 'lapig-raster-series-pnl-main',
      border: false,
      items: [
        this.getCenterCmp(),
        this.getEastCmp(),
      ]
    };
  },

  populateChart: function(starYear, endYear, interpolationPosition) {
    var instance = this;
    var chart = Ext.getCmp('lapig-coordinates-chart');

    var originalPosition = 0;
    for(var i in instance.chartData.series) {
      var serie = instance.chartData.series[i];
      if(serie.id == 'original') {
        originalPosition = serie.position;
        break;
      }
    }

    var data = [];
    instance.chartData.values.forEach(function(values) {

      var dtArray = values[0].split('-');
      var year = dtArray[0];
      var date = new Date(dtArray[0] + "/" + dtArray[1] + "/" + dtArray[2]).getTime();

      if(year >= starYear && year <= endYear) {
        var record = { date: date, original: values[originalPosition], interpolation: null };
        if(interpolationPosition > 0 && interpolationPosition != originalPosition)
          record.interpolation = values[interpolationPosition]

        data.push(record)
      }
    })


    chart.store.loadData(data);
  },

  initWdwInfo: function() {
    var instance = this;

    var wdwInfo = new Ext.Window({
      id: 'lapig_rasterseries::wdw-info',
      layout:'fit',
      border:false,
      width:600,
      height:410,
      closeAction:'hide',
      plain: true,
      title: 'Dados Temporais',
      items:[
        {
          region: 'center',
          closable:true,
          width:600,
          height:350,
          plain:true,
          layout: 'border',
          border:false,
          items: [
            {
              title: 'Categorias',
              border:false,
              region: 'west',
              split: true,
              width: 200,
              height: 410,
              collapsible: false,
              items:[
                {
                  xtype: 'treepanel',
                  border: false,
                  useArrows: true,
                  autoScroll: true,
                  animate: true,
                  enableDD: false,
                  containerScroll: true,
                  rootVisible: false,
                  height: 300,
                  width: 250,
                  region: 'west',
                  root: new Ext.tree.AsyncTreeNode({
                    text: 'Extensions', 
                    draggable:false, 
                    id:'ux'
                  }),
                  dataUrl: this.timeSeriesTreeUrl,
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
                        var url = 'time-series/'+ id;
                        var frmInfo = Ext.getCmp('lapig_rasterseries::frm-info');

                        frmInfo.load({
                          url:url, 
                          method:'GET', 
                          waitMsg:'Loading',
                        });                           
                      }
                    }
                  }
                }
              ],
            },
            {
              title: 'Detalhes',
              border:false,
              region: 'center',
              layout:'form',
              xtype:'form',
              split: true,
              width: 200,
              labelAlign:'top',
              padding: "10px 10px 0px 10px",
              id: 'lapig_rasterseries::frm-info',
              waitMsgTarget: 'lapig_rasterseries::frm-info',
              disabled: true,
              reader:  new Ext.data.JsonReader({
                idProperty: '_id',
                root: '',
                fields: [
                  { name:'name', mapping:'name' },
                  { name:'description', mapping:'description' },
                  { name:'date', mapping:'date' },
                  { name:'pixelMeasure', mapping:'pixelMeasure' },
                  { name:'satelite', mapping:'satelite' },
                  { name:'scale', mapping:'scale' },
                  { name:'source', mapping:'source' },
                ]
              }),
              items:[
                {
                  xtype: 'textfield',
                  hideLabel: false,
                  anchor:'100%',
                  fieldLabel:'Nome',
                  name: "name",
                  width:350,
                  height:20,
                  readOnly:true,
                },
                {
                  xtype: 'textarea',
                  hideLabel: false,
                  anchor:'100%',
                  fieldLabel:'Descrição',
                  name: "description",
                  padding: "0px 0px 0px 0px",
                  width:350,
                  height:80,
                  readOnly:true,
                  autoScroll:true,
                },
                {
                  layout:'column',
                  xtype: 'panel',
                  hideLabel: true,
                  border:false,
                  readOnly:true,
                  items:[
                    {
                      columnWidth:.5,
                      layout: 'form',
                      labelAlign: 'top',
                      border:false,
                      items: [
                        {
                          xtype:'textfield',
                          fieldLabel: 'Satélite',
                          name: "satelite",
                          height: 20,
                          readOnly: true,
                          name: 'satelite',
                          anchor:'100%'
                        },
                        {
                            xtype:'panel',
                            id: 'lapig_rasterseries::frm-info-source',
                            html: "",
                            height: 69,
                            fieldLabel: 'Fonte',
                            readOnly: true,
                            border: false,
                            cls: 'form-logo-field'
                        }
                      ]
                    },
                    {
                      columnWidth:.5,
                      layout: 'form',
                      labelAlign: 'top',
                      border:false,
                      padding: "0px 0px 0px 10px",
                      readOnly:true,
                      items: [
                        {
                          xtype:'textfield',
                          fieldLabel: 'Período',
                          name: 'date',
                          height: 20,
                          width: 165,
                          readOnly: true,
                          anchor:'100%'
                        },
                        {
                            xtype:'textfield',
                            fieldLabel: 'Escala',
                            name: 'scale',
                            height: 20,
                            width: 165,
                            readOnly: true,
                            anchor:'100%'
                        },
                        {
                          xtype:'textfield',
                          fieldLabel: 'Unidade de Medida',
                          name: 'pixelMeasure',
                          height: 20,
                          width: 165,
                          readOnly: true,
                          anchor:'100%'
                        },
                      ]
                    }
                  ],
                  buttons: [{
                    text: 'Selecionar',
                    listeners: {
                      click: function(evt) {
                        var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                        var lapigCoordinatesTool = Ext.getCmp('lapig-coordinates-tool');
                        var wndInfoButtons = instance.getWdwInfoButtons();
                        
                        wdwInfo.hide(this);
                        lapigCoordinatesTool.handler(null, null, wndInfoButtons);
                      },
                    },
                  }],
                },
              ],
              listeners: {
                actioncomplete: function(basicFormLayer, actionLayer) {
                  var formTimeSeries = Ext.getCmp('lapig_rasterseries::frm-info');
                  var fieldSource = Ext.getCmp('lapig_rasterseries::frm-info-source');
                  
                  var urlSource = 'theme/app/img/sources/' + actionLayer.result.data.source + '.png';
                  fieldSource.update('<img src = '+urlSource+'>');
                  formTimeSeries.enable();
                }
              }
            },
          ],
        }
      ]
    });
  },

  getCenterCmp: function (){
    var instance = this;

    instance.initWdwInfo();

    var filterChartData = function() {
      var startYearCmb = Ext.getCmp('lapig-raster-series-cmb-start-year');
      var endYearCmb = Ext.getCmp('lapig-raster-series-cmb-end-year');
      var interpolationCmb = Ext.getCmp('lapig-raster-series-cmb-interpolation');

      instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(), interpolationCmb.getValue())
    }

    return {
      border: false,
      region: 'center',
      collapsible: false,
      split: true,
      layout: 'border',
      id: "lapig-coordinates-center-chart",
      items: [
        {
          layout: 'column',
          border: false,
          height:43,
          region:'north',
          items: [
            {
              columnWidth:.15,
              layout: 'fit',
              height:45,
              border:false,
              style:{
                'border-bottom':'2px solid #f0f0f0',
                'border-right':'2px solid #f0f0f0',
              },
              padding:8,
              items: [
                {
                  text: 'Selecionar Dados',
                  xtype:"button",
                  listeners: {
                    click: function(evt) {
                      var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                      wdwInfo.show(this)
                    }
                  }
                }
              ]
            },
            {
              columnWidth:.25,
              layout: 'form',
              disabled: true,
              id: 'lapig-raster-series-chart-opts1',
              padding:8,
              border:false,
              style:{
                'border-bottom':'2px solid #f0f0f0',
                'border-right':'2px solid #f0f0f0',
              },
              labelWidth:50,
              items: [
                {
                  xtype: 'compositefield',
                  items: [
                    {
                      xtype:'combo',
                      id: "lapig-raster-series-cmb-start-year",
                      fieldLabel: 'Período',
                      border: false,
                      displayField:'year',
                      valueField: 'year',
                      mode: 'local',
                      typeAhead: true,
                      editable: false,
                      triggerAction: 'all',
                      store: {
                        xtype: 'arraystore',
                        fields: [
                           {name: 'year'},
                        ]
                      },
                      flex:1,
                      listeners: {
                        select: filterChartData
                      }
                    }, {
                      xtype:'label',
                      border: false,
                      html:'a',
                      width:10,
                      margins:{top:3, right:0, bottom:0, left:0},
                      flex:1
                    }, {
                      xtype:'combo',
                      id: "lapig-raster-series-cmb-end-year",
                      maxLength:150,
                      border: false,
                      typeAhead: true,
                      editable: false,
                      triggerAction: 'all',
                      displayField:'year',
                      valueField: 'year',
                      mode: 'local',
                      store: {
                        xtype: 'arraystore',
                        fields: [
                           {name: 'year'},
                        ]
                      },
                      flex:1,
                      listeners: {
                        select: filterChartData
                      }
                    }
                  ],
                }
              ]
            },
            {
              columnWidth:.4,
              disabled: true,
              id: 'lapig-raster-series-chart-opts2',
              layout: 'form',
              border:false,
              labelWidth:75,
              padding:8,
              style:{
                'border-bottom':'2px solid #f0f0f0',
              },
              items: [
                {
                  xtype: 'compositefield',
                  items: [
                    {
                      xtype:'combo',
                      id: 'lapig-raster-series-cmb-interpolation',
                      fieldLabel: 'Filtro',
                      displayField:'label',
                      valueField: 'position',
                      mode: 'local',
                      typeAhead: true,
                      editable: false,
                      triggerAction: 'all',
                      store: {
                        xtype: 'jsonstore',
                        fields: [ 'label', 'position' ]
                      },
                      flex: 1,
                      listeners: {
                        select: filterChartData
                      }
                    }
                  ],
                }
              ]
            },
            {
              columnWidth:.2,
              layout: 'column',
              disabled: true,
              id: 'lapig-raster-series-chart-opts3',
              height:45,
              border:false,
              style:{
                'border-bottom':'2px solid #f0f0f0',
                'border-left':'2px solid #f0f0f0',
              },
              padding:8,
              items: [
                {
                  columnWidth:.5,
                  xtype:'button',
                  text: 'CSV',
                  style:{
                    'margin-right':'10px',
                  },
                  flex:1,
                }, {
                  columnWidth:.5,
                  xtype:'button',
                  text: 'PNG',
                  style:{
                    'margin-left':'10px',
                  },
                  flex:1,
                }
              ],
            }
          ],
        }, {
          region: 'center',
          border: false,
          xtype: 'form',
          disabled: true,
          id: 'lapig-raster-series-chart-panel',
          items: [
            {
              xtype: 'linechart',
              id: "lapig-coordinates-chart",
              store: new Ext.data.JsonStore({
                  fields: [ 'date', 'original', 'interpolation' ]
              }),
              xField: 'date',
              yAxis: new Ext.chart.NumericAxis({
                  displayName: 'games',
                  labelRenderer : Ext.util.Format.numberRenderer('0,0')
              }),
              xAxis: new Ext.chart.TimeAxis({
                labelRenderer: function(date) { 
                  return date.format("m.Y"); ; 
                }
              }),
              tipRenderer : function(chart, record, index, series) {
                  
                var numberFormat = '0.000'
                var serie = series.data[index];
                var date = new Date(serie.date).format("d/m/Y") ;
                var originalValue = Ext.util.Format.number(serie.original, numberFormat);


                if(serie.interpolation == null) {
                  return date + ": " + originalValue
                } else {
                  return date + "\n" 
                        + " Original: " + originalValue + "\n"
                        + " Filtrado: " + Ext.util.Format.number(serie.interpolation, numberFormat);
                }

              },
              chartStyle: {
                animationEnabled: true,
                xAxis: {
                    color: 0xaaaaaa,
                    labelSpacing: 5,
                    labelDistance: 5,
                    majorTicks: {color: 0xaaaaaa, length: 10},
                    minorTicks: {color: 0xdddddd, length: 5},
                    majorGridLines: {size: 1, color: 0xaaaaaa},
                    minorGridLines: {size: 0.5, color: 0xdddddd}
                },
                yAxis: {
                    color: 0xaaaaaa,
                    labelDistance: 6,
                    majorTicks: {color: 0xaaaaaa, length: 10},
                    minorTicks: {color: 0xdddddd, length: 5},
                    majorGridLines: {size: 1, color: 0xaaaaaa},
                    minorGridLines: {size: 0.5, color: 0xdddddd}
                }
              },
              // http://yui.github.io/yui2/docs/yui_2.9.0_full/charts/index.html#series
              series: [
                {
                  type:'line',
                  yField: 'original',
                  displayField: 'original',
                  style: {
                    color: 0xfc4239,
                    size: 4,
                    lineSize: 2
                  },
                }, {
                  type:'line',
                  yField: 'interpolation',
                  displayField: 'interpolation',
                  style: {
                    color: 0x5057a6,
                    size: 0,
                    lineSize: 2
                  },
                }
              ],
            }
          ]
        }
      ],
    }
  },

  getEastCmp: function (){

    var myData = [
      ['Normal','10/01/2001', '1.1'],
      ['SAV','11/11/2012', '2.3'],
    ];

    var store = new Ext.data.ArrayStore({
      fields: [
         {name: 'serie'},
         {name: 'data'},
         {name: 'valor'},
      ]
    });

    store.loadData(myData);

    var grid = new Ext.grid.GridPanel({
      store: store,
      columns: [
          {
              id       :'serie',
              header   : 'Série', 
              width    : 70, 
              sortable : true, 
              dataIndex: 'serie'
          },
          {
              header   : 'Data', 
              width    : 70, 
              sortable : true,  
              dataIndex: 'data'
          },
          {
              header   : 'Valor', 
              width    : 70, 
              sortable : true,  
              dataIndex: 'valor'
          },
      ],
      stripeRows: true,
      height: 100,
      width: 230,
      //title: 'Mínimo',
      stateful: true,
      stateId: 'grid'
    });

    var eastCmp = {
      border: false,
      region: 'east',
      collapsible: true,
      title:'Estatisticas',
      split: true,
      width:225,
      height:215,
      minSize: 175,
      maxSize: 400,
      items: [{
        layout:'vbox',
        xtype:'form',
        hideLabel:false,
        align : 'stretchmax',
        fieldLabel:'Testando',
        html:'<center>1</center>',
        items:[{
          layout:'vbox',
          align : 'stretchmax',
          html:'<center>2</center>',
          items: [grid],
        }]
      },{
        layout:'vbox',
        align : 'stretch',
        html:'Máximo',
        //items: [grid],
      }],
    }
    
    return {} ;
  },

  initLoadChartDataMask: function() {
    var instance = this;
    var chartPanel = Ext.getDom('lapig-raster-series-chart-panel');
    var msgText = "Isto pode levar alguns minutinhos, relaxe e tome um café... ";
    
    instance.loadMask = new Ext.LoadMask(chartPanel, { msg: msgText });
    instance.loadMask.show();

    var countSeconds = 1;
    var runner = new Ext.util.TaskRunner();

    runner.start({
      run: function() {
        if (instance.chartData != undefined)
          runner.stopAll();
        else
          instance.loadMask.el.mask(msgText + countSeconds++ + " seg.", instance.loadMask.msgCls);
      },
      interval: 1000
    });
  },

  requestChartData: function(timeseriesId, longitude, latitude) {
    var instance = this;    
    var chartDataUrl = 'time-series/' + timeseriesId + '/values';

    instance.chartData = undefined;
    instance.initLoadChartDataMask();

    Ext.Ajax.request({
      url: chartDataUrl,
      method: 'GET',
      timeout: 360000,
      params: {
          longitude: longitude,
          latitude: latitude
      },
      success: function(request) {
        
        var loadMask = instance.loadMask;
        var chartOpts1 = Ext.getCmp('lapig-raster-series-chart-opts1');
        var chartOpts2 = Ext.getCmp('lapig-raster-series-chart-opts2');
        var chartOpts3 = Ext.getCmp('lapig-raster-series-chart-opts3');
        var chartPanel = Ext.getCmp('lapig-raster-series-chart-panel');
        var endYearCmb = Ext.getCmp('lapig-raster-series-cmb-end-year');
        var startYearCmb = Ext.getCmp('lapig-raster-series-cmb-start-year');
        var interpolationCmb = Ext.getCmp('lapig-raster-series-cmb-interpolation');

        instance.chartData = JSON.parse(request.responseText);

        var years = [];
        instance.chartData.values.forEach(function(value) {
          var array = value[0].split('-');
          years.push([array[0]])
        })

        var interpolations = []
        instance.chartData.series.forEach(function(serie) {
          if(serie.id == 'original')
            serie.label = 'Nenhum';

          interpolations.push(serie)
        })

        years = _.uniq(years, function(year) { return year[0]; });
        years = _.sortBy(years, function(year) { return year[0]; });
        
        endYearCmb.store.loadData(years);
        startYearCmb.store.loadData(years);
        interpolationCmb.store.loadData(interpolations)

        var startYear = [years[0]];
        var endYear = [years[years.length - 1]];

        endYearCmb.setValue(endYear);
        startYearCmb.setValue(startYear);

        instance.populateChart(startYear, endYear)

        chartOpts1.setDisabled(false);
        chartOpts2.setDisabled(false);
        chartOpts3.setDisabled(false);
        chartPanel.setDisabled(false);
        loadMask.hide();
      },                                    
    });
  },

  getWdwInfoButtons: function() {
    var instance = this;

    return [
      {
        text: "Selecione uma coordenada para continuar",
        xtype: "label",
      },
      {
        text: "Gerar gráfico",
        xtype: "button",
        disabled: true,
        listeners: {
          click: function(evt) {
            
            var grid = Ext.getCmp('lapig-coordinates-grid');
            var formTimeSeries = Ext.getCmp('lapig_rasterseries::frm-info');

            var record = grid.getSelectionModel().getSelected();
            var timeSeriesData = formTimeSeries.getForm().reader.jsonData;

            var timeSeriesId = timeSeriesData._id;
            var latitude = record.get('latitude');
            var longitude = record.get('longitude');
            var coordinateName = record.get('nome');
            var timeSeriesName = timeSeriesData.name;

            coordinateName = (coordinateName) ? " - " + coordinateName : ""

            //chartPanel.setTitle(timeSeriesName + coordinateName);

            var lapigCoordinatesWin = Ext.getCmp('lapig-coordinates-window');
            lapigCoordinatesWin.close();

            instance.requestChartData(timeSeriesId, longitude, latitude);
            
          }
        }
    }]
  }

});

Ext.preg(lapig.tools.RasterSeries.prototype.ptype, lapig.tools.RasterSeries);