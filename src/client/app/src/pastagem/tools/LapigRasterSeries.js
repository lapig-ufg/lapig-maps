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
      ]
    };
  },

  groupChartData: function(startValue, endValue, chartData, groupType, groupOperation) {
    var instance = this;

    var groupType = (groupType) ? groupType.toUpperCase() : '';

    var groupedOriginalData = {}
    var groupedInterpolationData = {}

    var chart = Ext.getCmp('lapig-coordinates-chart-'+instance.getSeriesActiveTab().name);
    var axisPercent = 0.1

    var datePos;
    var defaultDatePattern;
    if(groupType == 'YEAR') {
      datePos = 0;
      defaultDatePattern = "{}/01/01";
      chart.setXAxis(new Ext.chart.CategoryAxis({}));
    } else if(groupType == 'NPP') {
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

      var maximum = (Number(endValue) + (Number(endValue) * axisPercent)).toFixed(2);
      var minimum = (Number(startValue) - (Number(startValue) * axisPercent)).toFixed(2);

      chart.setXAxis(new Ext.chart.TimeAxis({
        labelRenderer: function(date) { 
          return date.format("m.Y");
        }
      }));
      chart.setYAxis(new Ext.chart.NumericAxis({ maximum: maximum, minimum: minimum }));
      return chartData;
    }

    if(groupType == 'NPP') {
      chartData.forEach(function(cData) {
        var key = cData.dateStr.split('-')[datePos];
        var month = cData.dateStr.split('-')[1];
        
        if (Number(month) >= 10 || Number(month) <= 4) {
          if(groupedOriginalData[key] == undefined)
            groupedOriginalData[key] = [];
          if(cData.original != null)
            groupedOriginalData[key].push(cData.original)

          if(groupedInterpolationData[key] == undefined)
            groupedInterpolationData[key] = [];
          if(cData.interpolation != null)
            groupedInterpolationData[key].push(cData.interpolation)
        }


      })
    } else {
      chartData.forEach(function(cData) {
        var key = cData.dateStr.split('-')[datePos];
        
        if(groupedOriginalData[key] == undefined)
          groupedOriginalData[key] = [];
        if(cData.original != null)
          groupedOriginalData[key].push(cData.original)

        if(groupedInterpolationData[key] == undefined)
          groupedInterpolationData[key] = [];
        if(cData.interpolation != null)
          groupedInterpolationData[key].push(cData.interpolation)

      })
    }

    var groupedData = [];

    for(var key in groupedOriginalData) {
      groupedData.push({
        original: jStat[groupOperation](groupedOriginalData[key]),
        interpolation: jStat[groupOperation](groupedInterpolationData[key]),
        date: key
      });
    }
    
    groupedData = _.sortBy(groupedData, function(gData){ return gData.date; })

    maximum = _.max(groupedData, function(gData){ return gData.original; }).original
    minimum = _.min(groupedData, function(gData){ return gData.original; }).original

    maximum = (Number(maximum) + (Number(maximum) * axisPercent)).toFixed(2);
    minimum = (Number(minimum) - (Number(minimum) * axisPercent)).toFixed(2);

    if(groupType) {
      chart.setYAxis(new Ext.chart.NumericAxis({ maximum: maximum, minimum: minimum }));
    }

    return groupedData;
  },

  getChartSeries: function(chartDataLength) {
    var instance = this;

    var activeTab = instance.getSeriesActiveTab();

    var markerSize;
    if(chartDataLength > 300)
      markerSize = 4;
    else if(chartDataLength > 100)
      markerSize = 6;
    else if(chartDataLength > 50)
      markerSize = 8;
    else if(chartDataLength > 0)
      markerSize = 10;

    var style;

    if(activeTab.index == 0){
      style = [
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
    }else{
      style = [
                {
                  color: 0xfc4239,
                  size: markerSize,
                  lineSize: 2
                }, {
                  color: 0x5057a6,
                  size: 0,
                  lineSize: 2
                }, {
                  color: 0x00cc00,
                  size: 0,
                  lineSize: 2
                }
              ];
    }

    // http://yui.github.io/yui2/docs/yui_2.9.0_full/charts/index.html#series
    return style;
  },

  getSeriesActiveTab: function(){
    var tabseries = Ext.getCmp('lapig-raster-series-tab-pnl').getActiveTab();

    if(~tabseries.getId().indexOf("trend")){
      return {
        name:'trend',
        index: 1
      };
    }else{
      return {
        name:'series',
        index: 0
      };
    }
  },

  populateChart: function(startYear, endYear, startValue, endValue, interpolationPosition, groupType, groupOperation) {
    var instance = this;
    console.log("populate: "+startYear + ", "+endYear+", "+startValue+", "+endValue);

    var activeTab = instance.getSeriesActiveTab();
    var chart = Ext.getCmp('lapig-coordinates-chart-' + activeTab.name);

    var originalPosition = 0;
    for(var i in instance.chartData[activeTab.index].series) {
      var serie = instance.chartData[activeTab.index].series[i];
      if(serie.id == 'original') {
        originalPosition = serie.position;
        break;
      }
    }

    var chartData = [];
    instance.chartData[activeTab.index].values.forEach(function(values) {

      var dateStr = values[0];
      var dtArray = values[0].split('-');
      var year = dtArray[0];
      var date = new Date(dtArray[0] + "/" + dtArray[1] + "/" + dtArray[2]).getTime();
      var value = values[originalPosition];

      if(year >= startYear && year <= endYear) {
        
        value = (value >= startValue && value <= endValue) ? value : null;

        if(activeTab.index == 1){
          var record = { date: date, original: value, interpolation: null, trend: null, dateStr: dateStr };
          record.trend = values[instance.trendPosition];
        }else{
          var record = { date: date, original: value, interpolation: null, dateStr: dateStr };
        }
        
        if(interpolationPosition > 0 && interpolationPosition != originalPosition)
          record.interpolation = (value >= startValue && value <= endValue) ? values[interpolationPosition] : null;

        chartData.push(record)
      }
    })

    chartData = instance.groupChartData(startValue, endValue, chartData, groupType, groupOperation);

    chart.setSeriesStyles(instance.getChartSeries(chartData.length));
    chart.store.loadData(chartData);
  },

  initWdwInfo: function() {
    var instance = this;

    var wdwInfo = new Ext.Window({
      id: 'lapig_rasterseries::wdw-info',
      layout:'fit',
      border:false,
      width:700,
      height:440,
      closeAction:'hide',
      plain: true,
      title: 'Dados Temporais',
      items:[
        {
          region: 'center',
          closable:true,
          height:350,
          plain:true,
          layout: 'border',
          border:false,
          items: [
            {
              title: 'Categorias',
              region: 'west',
              xtype: 'treepanel',
              border: false,
              useArrows: true,
              autoScroll: true,
              animate: true,
              enableDD: false,
              containerScroll: true,
              rootVisible: false,
              height: 350,
              width: 260,
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
            },
            {
              title: 'Detalhes',
              border:false,
              frame:true,
              region: 'center',
              layout:'form',
              xtype:'form',
              split: true,
              width: 180,
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
                  height:110,
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
                  ]
                },
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
      console.log("filterChartData")

      var activeTab = instance.getSeriesActiveTab();

      var startYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-start-year');
      var endYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-end-year');

      var interpolationCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-interpolation');
      var groupCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-group-data');

      var groupValueSplited = groupCmb.getValue().split("_");
      var groupType = groupValueSplited[0];
      var groupOperation = groupValueSplited[1];

      var startValue = 0;
      var endValue = 1;
      if(activeTab.index == 0){
        var startValueCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-start-value');
        var endValueCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-end-value');

        var startValue = startValueCmb.getValue();
        var endValue = endValueCmb.getValue();
      }else{
        var startValue = instance.seriesProperties.startValue;
        var endValue = instance.seriesProperties.endValue;
      }

      instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(), 
                startValue, endValue, interpolationCmb.getValue(), groupType, groupOperation)
    }

    var repopulateChart = function(){
      console.log("repopulate");

      var activeTab = instance.getSeriesActiveTab();

      var startYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-start-year');
      var endYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-end-year');

      if(startYearCmb.getValue() == ""){
        if(instance.seriesProperties != undefined){

          instance.requestChartData(instance.seriesProperties.timeseriesId,
            instance.seriesProperties.longitude, instance.seriesProperties.latitude);
        }
      }else{

        var startValue, endValue;
        if(activeTab.index == 0){
          startValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value').getValue();
          endValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value').getValue();
        }else{
          startValue = instance.seriesProperties.startValue;
          endValue = instance.seriesProperties.endValue;
        }

        instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(),
          startValue, endValue);
      }
    }

    return {
      border: false,
      region: 'center',
      collapsible: false,
      split: true,
      layout: 'border',
      id: "lapig-coordinates-center-chart",
      tbar: [
        {
          text: 'Dados Temporais',
          iconCls: 'lapig-icon-add-2',
          xtype:"button",
          listeners: {
            click: function(evt) {
              var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
              wdwInfo.show(this)
            }
          }
        },
        "->",
        {
          xtype: 'button',
          id: 'lapig-raster-series-btn-csv',
          iconCls: 'lapig-icon-csv',
          disabled: true,
          listeners: {
            click: function() {
              window.open(instance.csvUrl)
            }
          }
        }
      ],
      items: [
        {
          xtype: "tabpanel",
          id: "lapig-raster-series-tab-pnl",
          activeItem: "lapig-raster-series-tab-series",
          border: false,
          region: "center",
          items: [
            {
              title: "Série temporal",
              id: "lapig-raster-series-tab-series",
              layout: "border",
              tbar: [
                'Período:',
                {
                  xtype:'combo',
                  id: "lapig-raster-series-tab-series-cmb-start-year",
                  fieldLabel: 'Período',
                  border: false,
                  displayField:'year',
                  valueField: 'year',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  triggerAction: 'all',
                  width: 70,
                  store: {
                    xtype: 'arraystore',
                    fields: [
                       {name: 'year'},
                    ]
                  },
                  listeners: {
                    select: filterChartData
                  }
                }, 
                'a'
                , {
                  xtype:'combo',
                  id: "lapig-raster-series-tab-series-cmb-end-year",
                  maxLength:150,
                  border: false,
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  triggerAction: 'all',
                  displayField:'year',
                  valueField: 'year',
                  mode: 'local',
                  width: 70,
                  store: {
                    xtype: 'arraystore',
                    fields: [
                       {name: 'year'},
                    ]
                  },
                  listeners: {
                    select: filterChartData
                  }
                },
                '-',
                'Valores de:',
                {
                  xtype:'combo',
                  id: "lapig-raster-series-tab-series-cmb-start-value",
                  border: false,
                  displayField:'value',
                  valueField: 'value',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  triggerAction: 'all',
                  width: 70,
                  store: {
                    xtype: 'arraystore',
                    fields: [
                       {name: 'value'},
                    ]
                  },
                  listeners: {
                    select: filterChartData
                  }
                }, 
                'a'
                , {
                  xtype:'combo',
                  id: "lapig-raster-series-tab-series-cmb-end-value",
                  maxLength:150,
                  border: false,
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  triggerAction: 'all',
                  displayField:'value',
                  valueField: 'value',
                  mode: 'local',
                  width: 70,
                  store: {
                    xtype: 'arraystore',
                    fields: [
                       {name: 'value'},
                    ]
                  },
                  listeners: {
                    select: filterChartData
                  }
                },
                '-',
                'Filtro:'
                ,{
                  xtype:'combo',
                  id: 'lapig-raster-series-tab-series-cmb-interpolation',
                  displayField:'label',
                  valueField: 'position',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  width: 120,
                  triggerAction: 'all',
                  store: {
                    xtype: 'jsonstore',
                    fields: [ 'label', 'position' ]
                  },
                  listeners: {
                    select: filterChartData
                  }
                },
                '-',
                'Agupar por:',
                {
                  xtype:'combo',
                  id: 'lapig-raster-series-tab-series-cmb-group-data',
                  displayField:'label',
                  valueField: 'id',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  width: 120,
                  triggerAction: 'all',
                  store:  new Ext.data.ArrayStore({
                    fields: [
                      {name: 'id'}, 
                      {name: 'label'}
                    ],
                    data: [
                      ['NONE_NONE', 'Nenhum' ],
                      ['YEAR_mean', 'Ano (média)' ],
                      ['YEAR_sum', 'Ano (somatório)' ],
                      ['NPP_mean', 'Out-Abr (média)' ],
                      ['NPP_sum', 'Out-Abr (somatório)' ],
                      ['MONTH_mean', 'Mês (média)' ],
                      ['MONTH_sum', 'Mês (somatório)' ],
                      ['DAY_mean', 'Dia (média)' ],
                      ['DAY_sum', 'Dia (somatório)' ],
                    ]
                  }),
                  listeners: {
                    select: filterChartData
                  }
                }
              ],
              items:[
                {
                  region: 'center',
                  border: false,
                  xtype: 'panel',
                  disabled: true,
                  id: 'lapig-raster-series-tab-series-chart-pnl',
                  items: [
                    {
                      xtype: 'linechart',
                      id: 'lapig-coordinates-chart-series',
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
                      ],
                      listeners: {
                        "initialize": function() {
                          repopulateChart();
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              title: "Tendêcia",
              id: "lapig-raster-series-tab-trend",
              layout: "border",
              tbar: [
                'Período:',
                {
                  xtype:'combo',
                  id: "lapig-raster-series-tab-trend-cmb-start-year",
                  fieldLabel: 'Período',
                  border: false,
                  displayField:'year',
                  valueField: 'year',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  triggerAction: 'all',
                  width: 70,
                  store: {
                    xtype: 'arraystore',
                    fields: [
                       {name: 'year'},
                    ]
                  }
                }, 
                'a',
                {
                  xtype:'combo',
                  id: "lapig-raster-series-tab-trend-cmb-end-year",
                  maxLength:150,
                  border: false,
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  triggerAction: 'all',
                  displayField:'year',
                  valueField: 'year',
                  mode: 'local',
                  width: 70,
                  store: {
                    xtype: 'arraystore',
                    fields: [
                       {name: 'year'},
                    ]
                  }
                },
                '-',
                'Filtro:',
                {
                  xtype:'combo',
                  id: 'lapig-raster-series-tab-trend-cmb-interpolation',
                  displayField:'label',
                  valueField: 'position',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  width: 120,
                  triggerAction: 'all',
                  store: {
                    xtype: 'jsonstore',
                    fields: [ 'label', 'position' ]
                  }
                },
                '-',
                'Agupar por:',
                {
                  xtype:'combo',
                  id: 'lapig-raster-series-tab-trend-cmb-group-data',
                  displayField:'label',
                  valueField: 'id',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  width: 120,
                  triggerAction: 'all',
                  store:  new Ext.data.ArrayStore({
                    fields: [
                      {name: 'id'}, 
                      {name: 'label'}
                    ],
                    data: [
                      ['NONE_NONE', 'Nenhum' ],
                      ['YEAR_mean', 'Ano (média)' ],
                      ['MONTH-YEAR_mean', 'Mês-Ano (média)' ]
                    ]
                  })
                },
                '-',
                'Tempo em que ocorre mudança:',
                {
                  xtype:'numberfield',
                  id: 'lapig-raster-series-tab-trend-num-time-change',
                  allowBlank: false,
                  allowDecimals: false,
                  allowNegative: false,
                  editable: true,
                  disabled: true,
                  width: 60,
                  maxLength: 5,
                  value: 1
                },
                '  ',
                {
                  xtype:'combo',
                  id: 'lapig-raster-series-tab-trend-cmb-time-change-units',
                  displayField:'label',
                  valueField: 'id',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  value: "Anos",
                  width: 70,
                  triggerAction: 'all',
                  store:  new Ext.data.ArrayStore({
                    fields: [
                      {name: 'id'}, 
                      {name: 'label'}
                    ],
                    data: [
                      ['DAY', 'Dias' ],
                      ['MONTH', 'Meses' ],
                      ['YEAR', 'Anos']
                    ]
                  })
                },
                {
                  xtype: 'button',
                  id: 'lapig-raster-series-tab-trend-btn-refresh',
                  iconCls: 'lapig-icon-refresh',
                  disabled: true,
                  listeners: {
                    click: function() {
                      instance.calculateTrend();
                    }
                  }
                }
              ],
              items: [
                {
                  region: 'center',
                  border: false,
                  xtype: 'panel',
                  disabled: true,
                  id: 'lapig-raster-series-tab-trend-chart-pnl',
                  items: [
                    {
                      xtype: 'linechart',
                      id: "lapig-coordinates-chart-trend",
                      store: new Ext.data.JsonStore({
                          fields: [ 'date', 'original', 'interpolation', 'trend' ]
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
                        }, {
                          type:'line',
                          yField: 'trend',
                          displayField: 'trend',
                          style: {
                            color: 0x00cc00,
                            size: 0,
                            lineSize: 2
                          }
                        }
                      ],
                      listeners: {
                        "initialize": function() {
                          repopulateChart();
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
    }
  },

  calculateTrend: function(){
    var instance = this;

    console.log("calculateTrend");

    var activeTab = instance.getSeriesActiveTab();

    var startYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-start-year').getValue();
    var endYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-end-year').getValue();
    var interpolation = Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation').getId();
    var groupData = Ext.getCmp('lapig-raster-series-tab-trend-cmb-group-data').getValue();
    var timeChange = Ext.getCmp('lapig-raster-series-tab-trend-num-time-change').getValue();
    var timeChangeUnits = Ext.getCmp('lapig-raster-series-tab-trend-cmb-time-change-units').getValue();

    var trendDataUrl = 'time-series/' + instance.seriesProperties.timeseriesId + '/trend/values';

    instance.setSeriesActiveTabDisabled(true);

    instance.trendData = undefined;

    instance.initLoadChartDataMask();

    Ext.Ajax.request({
      url: trendDataUrl,
      method: 'GET',
      timeout: 360000,
      params: {
          startYear: startYear,
          endYear: endYear,
          interpolation: interpolation,
          groupData: groupData,
          timeChange: timeChange,
          timeChangeUnits: timeChangeUnits
      },
      success: function(request){

        var loadMask = instance.loadMask;

        instance.trendData = JSON.parse(request.responseText);

        instance.populateChart(startYear, endYear, startValue, endValue)

        instance.setSeriesActiveTabDisabled(false);

        loadMask.hide();
      }
    });
  },

  initLoadChartDataMask: function() {
    var instance = this;
    var chartPanel = Ext.getDom('lapig-raster-series-tab-pnl');
    var msgText = "Isto pode levar alguns minutinhos, relaxe e tome um café... ";
    var activeTab = instance.getSeriesActiveTab();

    instance.loadMask = new Ext.LoadMask(chartPanel, { msg: msgText });
    instance.loadMask.show();

    var countSeconds = 1;
    var runner = new Ext.util.TaskRunner();

    runner.start({
      run: function() {
        if (instance.chartData[activeTab.index] != undefined)
          runner.stopAll();
        else
          instance.loadMask.el.mask(msgText + countSeconds++ + " seg.", instance.loadMask.msgCls);
      },
      interval: 1000
    });
  },

  setSeriesActiveTabDisabled : function(disable){
    var instance = this;

    var index;
    var activeTab = instance.getSeriesActiveTab();
    var components = [];

    components.push(Ext.getCmp('lapig-raster-series-btn-csv'));

    if(activeTab.index == 0){
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-start-year'));
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-end-year'));
      
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value'));
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value'));
      
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-interpolation'));
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-group-data'));
      
      components.push(Ext.getCmp('lapig-raster-series-tab-series-chart-pnl'));

    }else if(activeTab.index == 1){
      components.push(Ext.getCmp('lapig-raster-series-tab-trend-cmb-start-year'));
      components.push(Ext.getCmp('lapig-raster-series-tab-trend-cmb-end-year'));
      
      components.push(Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation'));
      components.push(Ext.getCmp('lapig-raster-series-tab-trend-cmb-group-data'));

      components.push(Ext.getCmp('lapig-raster-series-tab-trend-num-time-change'));
      components.push(Ext.getCmp('lapig-raster-series-tab-trend-cmb-time-change-units'));

      components.push(Ext.getCmp('lapig-raster-series-tab-trend-chart-pnl'));
      components.push(Ext.getCmp('lapig-raster-series-tab-trend-btn-refresh'));
    }

    for(index=0; index<components.length; index++){
      components[index].setDisabled(disable);
    }
  },

  requestChartData: function(timeseriesId, longitude, latitude) {
    var instance = this;

    longitude = -55;
    latitude = -8;
    
    var activeTab = instance.getSeriesActiveTab();

    var startYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-start-year');
    var endYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-end-year');
    
    var groupDataCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-group-data');

    var interpolationCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-interpolation');

    if(activeTab.index == 0){
      var startValueCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value');
      var endValueCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value');
    }

    var chartDataUrl = 'time-series/' + timeseriesId + '/values';
    instance.csvUrl = 'time-series/' + timeseriesId + '/csv?longitude='+longitude+"&latitude="+latitude;

    instance.setSeriesActiveTabDisabled(true);

    groupDataCmb.setValue('NONE_NONE');
    interpolationCmb.setValue('Nenhum');

    if(instance.chartData == undefined){
      instance.chartData = [];
    }

    instance.chartData[activeTab.index] = undefined;
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

        instance.chartData[activeTab.index] = JSON.parse(request.responseText);

        var values = [];
        var years = [];
        instance.chartData[activeTab.index].values.forEach(function(value) {
          var array = value[0].split('-');
          years.push([array[0]])
          values.push([Number(value[1].toFixed(2))])
        })

        values = _.sortBy(values, function(value) { return value[0]; });
        values = _.uniq(values, true, function(value) { return value[0]; });

        var interpolations = []
        instance.chartData[activeTab.index].series.forEach(function(serie) {
          if(serie.id == 'original')
            serie.label = 'Nenhum';
          else if(serie.type == 'trends'){
            instance.trendPosition = serie.position;
            return;
          }

          interpolations.push(serie)
        })

        years = _.sortBy(years, function(year) { return year[0]; });
        years = _.uniq(years, true, function(year) { return year[0]; });

        endYearCmb.store.loadData(years);
        startYearCmb.store.loadData(years);
        interpolationCmb.store.loadData(interpolations);

        var startYear = [years[0]];
        var endYear = [years[years.length - 1]];

        var startValue = [values[0]];
        var endValue = [values[values.length - 1]];

        endYearCmb.setValue(endYear);
        startYearCmb.setValue(startYear);

        if(activeTab.index == 0){
          startValueCmb.store.loadData(values);
          endValueCmb.store.loadData(values);
          
          endValueCmb.setValue(endValue);
          startValueCmb.setValue(startValue);
        }

        instance.seriesProperties = {timeseriesId, longitude, latitude, startYear, endYear, startValue, endValue};

        console.log("request: "+startYear + ", "+endYear+", "+startValue+", "+endValue);

        instance.populateChart(startYear, endYear, startValue, endValue)

        instance.setSeriesActiveTabDisabled(false);

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
            var southPanel = Ext.getCmp('southpanel');

            var record = grid.getSelectionModel().getSelected();
            var timeSeriesData = formTimeSeries.getForm().reader.jsonData;

            var timeSeriesId = timeSeriesData._id;
            var latitude = record.get('latitude');
            var longitude = record.get('longitude');
            var coordinateName = record.get('nome');
            var timeSeriesName = timeSeriesData.name;

            coordinateName = (coordinateName) ? " - " + coordinateName : ""

            southPanel.setTitle('Análise de Séries Temporais - ' + timeSeriesName);

            var lapigCoordinatesWin = Ext.getCmp('lapig-coordinates-window');
            lapigCoordinatesWin.close();

            instance.requestChartData(timeSeriesId, longitude, latitude);
            
          }
        }
    }]
  }

});

Ext.preg(lapig.tools.RasterSeries.prototype.ptype, lapig.tools.RasterSeries);