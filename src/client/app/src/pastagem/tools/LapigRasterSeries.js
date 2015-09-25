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

  groupChartData: function(chartData, groupType, groupOperation) {
    
    var groupType = (groupType) ? groupType.toUpperCase() : '';

    var groupedOriginalData = {}
    var groupedInterpolationData = {}

    var chart = Ext.getCmp('lapig-coordinates-chart');

    var datePos;
    var defaultDatePattern;
    if(groupType == 'YEAR') {
      datePos = 0;
      defaultDatePattern = "{}/01/01";
      chart.setXAxis(new Ext.chart.CategoryAxis({}));
    } else if(groupType == 'MONTH') {
      datePos = 1;
      defaultDatePattern = "2000/{}/01";
      chart.setXAxis(new Ext.chart.CategoryAxis({}));
    } else if(groupType == 'DAY') {
      datePos = 2;
      defaultDatePattern = "2000/01/{}";
      chart.setXAxis(new Ext.chart.CategoryAxis({}));
    } else {
      chart.setXAxis(new Ext.chart.TimeAxis({
        labelRenderer: function(date) { 
          return date.format("m.Y"); ; 
        }
      }));
      return chartData;
    }

    chartData.forEach(function(cData) {
      var key = cData.dateStr.split('-')[datePos];
      
      if(groupedOriginalData[key] && cData.original != null)
        groupedOriginalData[key].push(cData.original);
      else
        groupedOriginalData[key] = [cData.original];
      
      if(groupedInterpolationData[key] && cData.interpolation != null)
        groupedInterpolationData[key].push(cData.interpolation);
      else
        groupedInterpolationData[key] = [cData.interpolation];

    })

    var groupedData = [];

    for(var key in groupedOriginalData) {
      groupedData.push({
        original: jStat[groupOperation](groupedOriginalData[key]),
        interpolation: jStat[groupOperation](groupedInterpolationData[key]),
        date: key
      });
    }
    
    groupedData = _.sortBy(groupedData, function(gData){ return gData.date; })

    return groupedData;
  },

  getChartSeries: function(chartDataLength) {

    var markerSize;
    if(chartDataLength > 300)
      markerSize = 4;
    else if(chartDataLength > 100)
      markerSize = 6;
    else if(chartDataLength > 50)
      markerSize = 8;
    else if(chartDataLength > 0)
      markerSize = 10;

    // http://yui.github.io/yui2/docs/yui_2.9.0_full/charts/index.html#series
    return [
      {
        color: 0xfc4239,
        size: markerSize,
        lineSize: 2
      }, {
        color: 0x5057a6,
        size: 0,
        lineSize: 2
      }
    ];
  },

  populateChart: function(starYear, endYear, interpolationPosition, groupType, groupOperation) {
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

    var chartData = [];
    instance.chartData.values.forEach(function(values) {

      var dateStr = values[0];
      var dtArray = values[0].split('-');
      var year = dtArray[0];
      var date = new Date(dtArray[0] + "/" + dtArray[1] + "/" + dtArray[2]).getTime();

      if(year >= starYear && year <= endYear) {
        var record = { date: date, original: values[originalPosition], interpolation: null, dateStr: dateStr };
        if(interpolationPosition > 0 && interpolationPosition != originalPosition)
          record.interpolation = values[interpolationPosition]

        chartData.push(record)
      }
    })

    chartData = instance.groupChartData(chartData, groupType, groupOperation);
    console.log(chart);

    chart.setSeriesStyles(instance.getChartSeries(chartData.length));
    chart.store.loadData(chartData);
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
      var groupCmb = Ext.getCmp('lapig-raster-series-cmb-group-data');

      var groupValueSplited = groupCmb.getValue().split("_");
      var groupType = groupValueSplited[0];
      var groupOperation = groupValueSplited[1];

      instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(), interpolationCmb.getValue(), groupType, groupOperation)
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
          layout: 'hbox',
          layoutConfig: {
            padding:'4',
            align:'stretch'
          },
          border: true,
          height:35,
          region:'north',
          id: 'lapig_rasterseries::pnl-chart-north',
          defaults: {
            border:false,
            margins:'0 5 0 0'
          },
          items: [
            {
              flex: 1,
              text: 'Selecionar Dados',
              xtype:"button",
              listeners: {
                click: function(evt) {
                  var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                  wdwInfo.show(this)
                }
              }
            }, {
              flex: 8,
              layout: 'hbox',
              id: 'lapig_rasterseries::frm-chart-opts',
              layoutConfig: {
                padding:'1',
                align:'middle'
              },
              defaults: {
                border:false,
                margins:'0 5 0 0'
              },
              disabled: true,
              items: [
                {
                  flex: 3,
                  layout: 'form',
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
                }, {
                  flex: 4,
                  layout: 'form',
                  border:false,
                  labelWidth:30,
                  items: [
                    {
                      xtype: 'compositefield',
                      fieldLabel: 'Filtro',
                      items: [
                        {
                          xtype:'combo',
                          id: 'lapig-raster-series-cmb-interpolation',
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
                }, {
                  flex: 4,
                  layout: 'form',
                  border:false,
                  labelWidth:70,
                  items: [
                    {
                      xtype: 'compositefield',
                      fieldLabel: 'Agrupar por',
                      items: [
                        {
                          xtype:'combo',
                          id: 'lapig-raster-series-cmb-group-data',
                          displayField:'label',
                          valueField: 'id',
                          mode: 'local',
                          typeAhead: true,
                          editable: false,
                          triggerAction: 'all',
                          store:  new Ext.data.ArrayStore({
                            fields: [
                              {name: 'id'}, 
                              {name: 'label'}
                            ],
                            data: [
                              ['NONE_NONE', 'Nenhum' ],
                              ['YEAR_mean', 'Ano (média)' ],
                              ['YEAR_median', 'Ano (mediana)' ],
                              ['YEAR_sum', 'Ano (somatório)' ],
                              ['YEAR_stdev', 'Ano (devio padrão)' ],
                              ['MONTH_mean', 'Mês (média)' ],
                              ['MONTH_median', 'Mês (mediana)' ],
                              ['MONTH_sum', 'Mês (somatório)' ],
                              ['MONTH_stdev', 'Mês (devio padrão)' ],
                              ['DAY_mean', 'Dia (média)' ],
                              ['DAY_median', 'Dia (mediana)' ],
                              ['DAY_sum', 'Dia (somatório)' ],
                              ['DAY_stdev', 'Dia (devio padrão)' ],
                            ]
                          }),
                          flex: 1,
                          listeners: {
                            select: filterChartData
                          }
                        }
                      ],
                    }
                  ]
                }, {
                  flex: 1,
                  xtype:'button',
                  text: 'CSV',
                  margins:'0 5 10 0',
                }, {
                  flex: 1,
                  xtype:'button',
                  text: 'PNG',
                  margins:'0 5 10 0',
                }
              ]
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
              yAxis: new Ext.chart.NumericAxis(),
              xAxis: new Ext.chart.TimeAxis({
                labelRenderer: function(date) { 
                  return date.format("m.Y"); ; 
                }
              }),
              tipRenderer : function(chart, record, index, series) {
                  
                var numberFormat = '0.000'
                var serie = series.data[index];

                var date = serie.date;
                if(typeof date === 'number')
                  date = new Date(date).format("d/m/Y") ;

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
              ]
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
        var chartPanel = Ext.getCmp('lapig-raster-series-chart-panel');
        var endYearCmb = Ext.getCmp('lapig-raster-series-cmb-end-year');
        var startYearCmb = Ext.getCmp('lapig-raster-series-cmb-start-year');
        var interpolationCmb = Ext.getCmp('lapig-raster-series-cmb-interpolation');
        var chartNorth = Ext.getCmp('lapig_rasterseries::pnl-chart-north');
        var charOpts = Ext.getCmp('lapig_rasterseries::frm-chart-opts');

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

        charOpts.setDisabled(false)

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