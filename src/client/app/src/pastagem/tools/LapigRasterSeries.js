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

  tabProperties: {
    series : 0,
    trend : 1,
    name: [
      'series',
      'trend'
    ]
  },

  constructor: function(config) {
    lapig.tools.RasterSeries.superclass.constructor.apply(this, arguments);

    this.projectsParam = config.project.join(',');
    this.timeSeriesTreeUrl = 'time-series/tree?projects=' + this.projectsParam + '&lang='+i18n.lang;

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

    if(activeTab.index == instance.tabProperties.series){
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
    var instance = this;
    var tab = Ext.getCmp('lapig-raster-series-tab-pnl').getActiveTab();

    if(tab.getId().indexOf("trend") != -1){
      return {
        name:instance.tabProperties.name[instance.tabProperties.trend],
        index: instance.tabProperties.trend
      };
    }else{
      return {
        name:instance.tabProperties.name[instance.tabProperties.series],
        index: instance.tabProperties.series
      };
    }
  },

  populateChart: function(startYear, endYear, startValue, endValue, interpolationPosition, groupType, groupOperation) {
    var instance = this;

    var activeTab = instance.getSeriesActiveTab();
    var chart = Ext.getCmp('lapig-coordinates-chart-' + activeTab.name);

    var originalPosition = 0;
    var trendPosition = -1;
    for(var i in instance.chartData[activeTab.index].series) {
      var serie = instance.chartData[activeTab.index].series[i];
      if(serie.id == 'original') {
        originalPosition = serie.position;
      }
      else if(serie.type == 'trend'){
        trendPosition = serie.position;
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

        if(activeTab.index == instance.tabProperties.trend){
          var record = { date: date, original: value, interpolation: null, trend: null, dateStr: dateStr };
          record.trend = (trendPosition != -1) ? values[trendPosition] : null;
        }else{
          var record = { date: date, original: value, interpolation: null, dateStr: dateStr };
        }
        
        if (interpolationPosition < 0) {
          record.original = null;
          if(interpolationPosition != originalPosition)
            record.interpolation = (value >= startValue && value <= endValue) ? values[interpolationPosition * -1] : null;
        }else{
          if(interpolationPosition != originalPosition)
            record.interpolation = (value >= startValue && value <= endValue) ? values[interpolationPosition] : null;
        }

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
      title: i18n.LAPIGRASTERSERIES_TITLE_TEMPORALDATA,
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
              title: i18n.LAPIGRASTERSERIES_TTLAREA_CAT,
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
                    lapigAnalytics.clickTool('Time Series','view-Layer',id);
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
              title: i18n.LAPIGRASTERSERIES_TTLAREA_DETAILS,
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
              baseParams: {
                'projects': this.projectsParam,
                'lang': i18n.lang
              },
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
                  fieldLabel:i18n.LAPIGRASTERSERIES_FIELDLBL_NAME,
                  name: "name",
                  width:350,
                  height:20,
                  readOnly:true,
                },
                {
                  xtype: 'textarea',
                  hideLabel: false,
                  anchor:'100%',
                  fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_DESCRIPTION,
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
                          fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_SATELLITE,
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
                            fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_SOURCE,
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
                          fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_PERIOD,
                          name: 'date',
                          height: 20,
                          width: 165,
                          readOnly: true,
                          anchor:'100%'
                        },
                        {
                            xtype:'textfield',
                            id: 'lapig_rasterserires::wdw-info-txt-scale',
                            fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_SCALE,
                            name: 'scale',
                            height: 20,
                            width: 165,
                            readOnly: true,
                            anchor:'100%'
                        },
                        {
                          xtype:'textfield',
                          fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_UNIMEASURE,
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
                text: i18n.LAPIGRASTERSERIES_BTNTXT_SELECT,
                listeners: {
                  click: function(evt) {
                    var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                    var lapigCoordinatesTool = Ext.getCmp('lapig-coordinates-tool');
                    var wndInfoButtons = instance.getWdwInfoButtons();
                    var selectView = Ext.getCmp('lapig_rasterseries::frm-info');
                    lapigAnalytics.clickTool('Time Series','select-Layer',selectView.reader.jsonData._id);

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

      var startYearCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-year');
      var endYearCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-year');

      var startValueCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value');
      var endValueCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value');

      var interpolationCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-interpolation');
      var groupCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-group-data');

      var groupValueSplited = groupCmb.getValue().split("_");
      var groupType = groupValueSplited[0];
      var groupOperation = groupValueSplited[1];

      instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(), 
                startValueCmb.getValue(), endValueCmb.getValue(), interpolationCmb.getValue(), groupType, groupOperation)
    }

    var repopulateChart = function(){

      var activeTab = instance.getSeriesActiveTab();

      var startYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-start-year');
      var endYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-end-year');

      var timeSeriesName = Ext.getCmp('lapig_rasterseries::frm-info').getForm().reader.jsonData.name;
      Ext.getCmp('southpanel').setTitle(i18n.LAPIGVIEWER_TTL_TOOL_TIME_SERIES+' - '+timeSeriesName);

      if(instance.chartData[activeTab.index] == undefined){
        if(instance.seriesProperties != undefined){
          instance.requestChartData(instance.seriesProperties.timeseriesId,
            instance.seriesProperties.longitude, instance.seriesProperties.latitude, instance.seriesProperties.radius);
        }else{
          instance.restartChart();
        }
      }else{

        if(activeTab.index == instance.tabProperties.series){
          var startValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value').getValue();
          var endValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value').getValue();
          // Ext.getCmp('lapig-raster-series-tab-series-cmb-interpolation').setValue("Nenhum");

          instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(),
          startValue, endValue);
        }else{
          instance.drawTrend(instance.chartData[activeTab.index])
        }
      }
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
          xtype: "tabpanel",
          id: "lapig-raster-series-tab-pnl",
          activeItem: "lapig-raster-series-tab-series",
          border: false,
          region: "center",
          listeners: {
            'tabchange': function(evt, tab) {
              if(tab.id == "lapig-raster-series-tab-series") {
                  lapigAnalytics.clickTool('Tools','Time Series','')
              } else {
                if(tab.id == "lapig-raster-series-tab-trend") {
                  lapigAnalytics.clickTool('Tools','Trend','')
                }
              }
            }
          },
          items: [
            {
              title: i18n.LAPIGRASTERSERIES_TITLE_TIMESERIES,
              id: "lapig-raster-series-tab-series",
              layout: "border",
              tbar: [
                {
                  text: i18n.LAPIGRASTERSERIES_TITLE_TEMPORALDATA,
                  iconCls: 'lapig-icon-add-2',
                  xtype:"button",
                  listeners: {
                    click: function(evt) {
                      lapigAnalytics.clickTool('Time Series','click-temporalData','')
                      var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                      wdwInfo.show(this)
                    }
                  }
                },
                '-',
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_PERIOD,
                {
                  xtype:'combo',
                  id: "lapig-raster-series-tab-series-cmb-start-year",
                  fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBLCB_PERIOD,
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
                    select: function() {
                      filterChartData();
                      var TDcmbStartYear = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-year').getValue(); 
                      lapigAnalytics.clickTool('Time Series','click-filterDateStart',TDcmbStartYear)
                    }
                  }
                }, 
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_A
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
                    select: function() {
                      filterChartData();
                      var TDcmbEndYear = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-year').getValue(); 
                      lapigAnalytics.clickTool('Time Series','click-filterDateEnd',TDcmbEndYear)
                    }
                  }
                },
                '-',
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_VALUES,
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
                    select: function() {
                      filterChartData();
                      var TDfilterStartValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value').getValue(); 
                      lapigAnalytics.clickTool('Time Series','click-filterValueStart',TDfilterStartValue)
                    }
                  }
                }, 
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_A
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
                    select: function() {
                      filterChartData();
                      var TDfilterEndValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value').getValue(); 
                      lapigAnalytics.clickTool('Time Series','click-filterValueEnd',TDfilterEndValue)
                    }
                  }
                },
                '-',
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_FILTER
                ,{
                  xtype:'combo',
                  id: 'lapig-raster-series-tab-series-cmb-interpolation',
                  displayField:'label',
                  valueField: 'position',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  width: 200,
                  triggerAction: 'all',
                  store: {
                    xtype: 'jsonstore',
                    fields: [ 'label', 'position', 'id' ]
                  },
                  listeners: {
                    select: function() {
                      filterChartData();
                      var TDfilterSoften = Ext.getCmp('lapig-raster-series-tab-series-cmb-interpolation').getValue();
                      lapigAnalytics.clickTool('Time Series','click-filterSoften',TDfilterSoften)
                    }
                  }
                },
                '-',
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_GROUP,
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
                      ['NONE_NONE', i18n.LAPIGRASTERSERIES_GROUPCB_NONE ],
                      ['YEAR_mean', i18n.LAPIGRASTERSERIES_GROUPCB_YEARAVERAGE ],
                      ['YEAR_sum', i18n.LAPIGRASTERSERIES_GROUPCB_YEARSUM ],
                      ['NPP_mean', i18n.LAPIGRASTERSERIES_GROUPCB_OCTAPRAVER ],
                      ['NPP_sum', i18n.LAPIGRASTERSERIES_GROUPCB_OCTAPRSUM ],
                      ['MONTH_mean', i18n.LAPIGRASTERSERIES_GROUPCB_MONTHAVER ],
                      ['MONTH_sum', i18n.LAPIGRASTERSERIES_GROUPCB_MONTHSUM ],
                      ['DAY_mean', i18n.LAPIGRASTERSERIES_GROUPCB_DAYAVER ],
                      ['DAY_sum', i18n.LAPIGRASTERSERIES_GROUPCB_DAYSUM ],
                    ]
                  }),
                  listeners: {
                    select: function() {
                      filterChartData();
                      var TDclassifyBy = Ext.getCmp('lapig-raster-series-tab-series-cmb-group-data').getValue(); 
                      lapigAnalytics.clickTool('Time Series','click-filterClassifyBy',TDclassifyBy)
                    }
                  }
                },
                '->',
                {
                  xtype: 'button',
                  id: 'lapig-raster-series-tab-series-btn-csv',
                  iconCls: 'lapig-icon-csv',
                  disabled: true,
                  listeners: {
                    click: function() {
                      var csvUrl = 'time-series/' + instance.seriesProperties.timeseriesId + 
                      '/csv?longitude='+instance.seriesProperties.longitude+
                      "&latitude="+instance.seriesProperties.latitude+"&mode=series&radius="+
                      instance.seriesProperties.radius;
                      lapigAnalytics.clickTool('Time Series','csv-Downloads',instance.seriesProperties.timeseriesId);
                      window.open(csvUrl)
                    }
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
                                + i18n.LAPIGRASTERSERIES_TXT_ORIGINAL + originalValue + "\n"
                                + i18n.LAPIGRASTERSERIES_TXT_FILTRATED + Ext.util.Format.number(serie.interpolation, numberFormat);
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
              title: i18n.LAPIGRASTERSERIES_TITLE_TREND,
              id: "lapig-raster-series-tab-trend",
              layout: "border",
              disabled: true,
              tbar: [
                {
                  text: i18n.LAPIGRASTERSERIES_TITLE_TEMPORALDATA,
                  iconCls: 'lapig-icon-add-2',
                  xtype:"button",
                  listeners: {
                    click: function(evt) {
                      lapigAnalytics.clickTool('Trend','click-temporalData','')
                      var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                      wdwInfo.show(this)
                    }
                  }
                },
                '-',
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_PERIOD,
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
                  },
                  listeners: {
                    select: function() {
                      var TrendCmbStartYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-start-year').getValue(); 
                      lapigAnalytics.clickTool('Trend','click-filterDateStart',TrendCmbStartYear)
                    }
                  }
                }, 
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_A,
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
                  },
                  listeners: {
                    select: function() {
                      var TrendCmbEndYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-end-year').getValue(); 
                      lapigAnalytics.clickTool('Trend','click-filterDateEnd',TrendCmbEndYear)
                    }
                  }
                },
                '-',
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_FILTER,
                {
                  xtype:'combo',
                  id: 'lapig-raster-series-tab-trend-cmb-interpolation',
                  displayField:'label',
                  valueField: 'id',
                  mode: 'local',
                  typeAhead: true,
                  editable: false,
                  disabled: true,
                  width: 120,
                  triggerAction: 'all',
                  store: {
                    xtype: 'jsonstore',
                    idProperty: 'id',
                    fields: [ 'label', 'position', 'id' ]
                  },
                  listeners: {
                    select: function() {
                      var TrendFilterSoften = Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation').getValue(); 
                      lapigAnalytics.clickTool('Trend','click-filterSoften',TrendFilterSoften)
                    }
                  }
                },
                '-',
                i18n.LAPIGRASTERSERIES_FIELDLBLCB_GROUP,
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
                      ['NONE_NONE', i18n.LAPIGRASTERSERIES_GROUPCB_NONE ],
                      ['YEAR_mean', i18n.LAPIGRASTERSERIES_GROUPCB_YEARAVERAGE ],
                      ['MONTH-YEAR_mean', i18n.LAPIGRASTERSERIES_GROUPCB_MONTHYEARAVER ]
                    ]
                  }),
                  listeners: {
                    select: function() {
                      var TrendFiterClassifyBy = Ext.getCmp('lapig-raster-series-tab-trend-cmb-group-data').getValue(); 
                      lapigAnalytics.clickTool('Trend','click-fiterClassifyBy',TrendFiterClassifyBy)
                    }
                  }
                },
                '-',
                i18n.LAPIGRASTERSERIES_GROUPCB_TIME,
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
                  value: "YEAR",
                  width: 70,
                  triggerAction: 'all',
                  store:  new Ext.data.ArrayStore({
                    fields: [
                      {name: 'id'}, 
                      {name: 'label'}
                    ],
                    data: [
                      ['DAY', i18n.LAPIGRASTERSERIES_GROUPCB_DAYS],
                      ['MONTH', i18n.LAPIGRASTERSERIES_GROUPCB_MONTHS],
                      ['YEAR', i18n.LAPIGRASTERSERIES_GROUPCB_YEARS]
                    ]
                  }),
                  listeners: {
                    select: function() {
                      var TrendFiterClassifyByPeriod = Ext.getCmp('lapig-raster-series-tab-trend-cmb-time-change-units').getValue(); 
                      lapigAnalytics.clickTool('Trend','click-fiterClassifyByPeriod',TrendFiterClassifyByPeriod)
                    }
                  }
                },
                ' ',
                {
                  xtype: 'button',
                  id: 'lapig-raster-series-tab-trend-btn-refresh',
                  tooltip: i18n.LAPIGRASTERSERIES_BTNTOOLTIP_RECALCULATE,
                  iconCls: 'lapig-icon-refresh',
                  disabled: true,
                  listeners: {
                    click: function() {
                      instance.calculateTrend();
                      lapigAnalytics.clickTool('Trend','click-Refresh','');
                    }
                  }
                },
                '->',
                {
                  xtype: 'button',
                  id: 'lapig-raster-series-tab-trend-btn-csv',
                  iconCls: 'lapig-icon-csv',
                  disabled: true,
                  listeners: {
                    click: function() {
                      lapigAnalytics.clickTool('Trend','click-csvDownloads',instance.seriesProperties.timeseriesId)
                      var csvUrl = 'time-series/' + instance.seriesProperties.timeseriesId + '/csv';

                      var startYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-start-year').getValue();
                      var endYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-end-year').getValue();
                      var interpolation = Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation').getValue();
                      var groupData = Ext.getCmp('lapig-raster-series-tab-trend-cmb-group-data').getValue();
                      var timeChange = Ext.getCmp('lapig-raster-series-tab-trend-num-time-change').getValue();
                      var timeChangeUnits = Ext.getCmp('lapig-raster-series-tab-trend-cmb-time-change-units').getValue();

                      csvUrl = csvUrl+"?longitude="+instance.seriesProperties.longitude+
                      "&latitude="+instance.seriesProperties.latitude+
                      "&startYear="+startYear+
                      "&endYear="+endYear+
                      "&interpolation="+interpolation+
                      "&groupData="+groupData+
                      "&timeChange="+timeChange+
                      "&timeChangeUnits="+timeChangeUnits+
                      "&mode=trend"+
                      "&radius="+instance.seriesProperties.radius

                      window.open(csvUrl)
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

                        var trendValue = Ext.util.Format.number(serie.trend, numberFormat);

                        if(serie.interpolation != null) {
                          return date + "\n" 
                                + i18n.LAPIGRASTERSERIES_TXT_TREND + trendValue + "\n"
                                + i18n.LAPIGRASTERSERIES_TXT_FILTRATED + Ext.util.Format.number(serie.interpolation, numberFormat);
                        } else if(serie.original != null){
                          return date + "\n" 
                                + i18n.LAPIGRASTERSERIES_TXT_TREND + trendValue + "\n"
                                + i18n.LAPIGRASTERSERIES_TXT_ORIGINAL + Ext.util.Format.number(serie.original, numberFormat);
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
                            size: 4,
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
      ]
    }
  },

  calculateTrend: function(){
    var instance = this;

    var activeTab = instance.getSeriesActiveTab();

    var startYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-start-year').getValue();
    var endYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-end-year').getValue();

    if (endYear - startYear < 1){
      return Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_ALERT_VALIDATION, i18n.LAPIGRASTERSERIES_ALERT_ERROR1);
    }

    var interpolation = Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation').getValue();
    var groupData = Ext.getCmp('lapig-raster-series-tab-trend-cmb-group-data').getValue();
    var timeChange = Ext.getCmp('lapig-raster-series-tab-trend-num-time-change').getValue();
    var timeChangeUnits = Ext.getCmp('lapig-raster-series-tab-trend-cmb-time-change-units').getValue();

    var trendDataUrl = 'time-series/' + instance.seriesProperties.timeseriesId + '/trend';

    instance.setSeriesActiveTabDisabled(true);

    var oldChartData = instance.chartData[activeTab.index];
    instance.chartData[activeTab.index] = undefined;

    instance.initLoadChartDataMask();

    Ext.Ajax.request({
      url: trendDataUrl,
      method: 'GET',
      timeout: 360000,
      params: {
        longitude: instance.seriesProperties.longitude,
        latitude: instance.seriesProperties.latitude,
        startYear: startYear,
        endYear: endYear,
        interpolation: interpolation,
        groupData: groupData,
        timeChange: timeChange,
        timeChangeUnits: timeChangeUnits,
        radius: instance.seriesProperties.radius
      },
      success: function(request){

        var loadMask = instance.loadMask;

        var jsonResponse = JSON.parse(request.responseText);
        if (jsonResponse.error == undefined) {
          instance.chartData[activeTab.index] = jsonResponse;
          instance.drawTrend(instance.chartData[activeTab.index]);
        } else {
          Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_ALERT_VALIDATION, i18n.LAPIGRASTERSERIES_TXT_ALERTATTENCION + ': ' + jsonResponse.error);
          instance.chartData[activeTab.index] = oldChartData;
          instance.drawTrend(instance.chartData[activeTab.index]);
        }

        instance.setSeriesActiveTabDisabled(false);
        loadMask.hide();
      }
    });
  },

  drawTrend : function(trendData){
    var instance = this;

    var activeTab = instance.getSeriesActiveTab();

    var chart = Ext.getCmp('lapig-coordinates-chart-'+activeTab.name);
    var interpolationCmb = Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation');
    var filter = interpolationCmb.getValue();

    var trendPosition = 0;
    var originalPosition = -1;
    var interpolationPosition = -1;
    
    trendData.series.forEach(function(serie) {
      if(serie.type == 'trend') {
        trendPosition = serie.position;
      }else if(serie.type == 'original'){
        originalPosition = serie.position;
        serie.label = "Nenhum";
      }else if(serie.type == 'filter' && filter != 'Nenhum'){
        interpolationPosition = serie.position;
      }
    });

    var chartRecords = [];
    trendData.values.forEach(function(values){
      var dateStr = '-' + values[0];
      date = new Date(dateStr).getTime();

      var record = {
        date: date, 
        original: originalPosition != -1 ? values[originalPosition] : null,
        interpolation: interpolationPosition != -1 && originalPosition == -1 ? values[interpolationPosition] : null,
        trend: values[trendPosition],
        dateStr: dateStr };
      chartRecords.push(record);
    });

    
    chart.setSeriesStyles(instance.getChartSeries(trendData.length));
    chart.store.loadData(chartRecords);

    var dtType = trendData.values[0][0].split('-').length;
    if (dtType > 1) {
      chart.setXAxis(new Ext.chart.TimeAxis({
        labelRenderer: function(date) { 
          return date.format("m.Y");
        }
      }));
    } else {
      chart.setXAxis(new Ext.chart.CategoryAxis({
        labelRenderer: function(time){
          var year = time/1000/60/60/24/365 +1970;
          return Math.floor(year);
        }
      }));
    }
  },
 
  initLoadChartDataMask: function() {
    var instance = this;
    var chartPanel = Ext.getDom('lapig-raster-series-tab-pnl');
    var msgText = i18n.LAPIGRASTERSERIES_TXT_ALERTRELAX;
    var activeTab = instance.getSeriesActiveTab();

    instance.loadMask = new Ext.LoadMask(chartPanel, { msg: msgText });
    instance.loadMask.show();

    var countSeconds = 1;
    var runner = new Ext.util.TaskRunner();

    runner.start({
      run: function() {
        if (instance.chartData[activeTab.index] != undefined){
          runner.stopAll();
          console.log("Series download and processing elapsed time: "+ countSeconds,
            "\nId: "+ instance.seriesProperties.timeseriesId,
            "\nRadius: "+ instance.seriesProperties.radius,
            "\nCoordinates: ("+instance.seriesProperties.longitude+", "+instance.seriesProperties.latitude+")");
        }else{
          instance.loadMask.el.mask(msgText + countSeconds++ + " seg.", instance.loadMask.msgCls);
        }
      },
      interval: 1000
    });
  },

  setSeriesActiveTabDisabled : function(disable){
    var instance = this;

    var index;
    var activeTab = instance.getSeriesActiveTab();
    var components = [];

    if(activeTab.index == instance.tabProperties.series){
      components.push(Ext.getCmp('lapig-raster-series-tab-series-btn-csv'));

      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-start-year'));
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-end-year'));
      
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value'));
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value'));
      
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-interpolation'));
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-group-data'));
      
      components.push(Ext.getCmp('lapig-raster-series-tab-series-chart-pnl'));

      var tabTrend = Ext.getCmp('lapig-raster-series-tab-trend');
      if (tabTrend.disabled){
        components.push(tabTrend);
      }

    }else if(activeTab.index == instance.tabProperties.trend){
      components.push(Ext.getCmp('lapig-raster-series-tab-trend-btn-csv'));

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

  restartChart : function() {
    var instance = this;
    var empty = [];
    var components = [];
    var activeTab = instance.getSeriesActiveTab();

    components.push(Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-start-year'));
    components.push(Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-end-year'));
    components.push(Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-interpolation'));

    components.push(Ext.getCmp('lapig-coordinates-chart-'+activeTab.name));

    if(activeTab.index == instance.tabProperties.series){
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value'));
      components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value'));
    }else if(activeTab.index == instance.tabProperties.trend){

      Ext.getCmp('lapig-raster-series-tab-trend-num-time-change').setValue(1);
      Ext.getCmp('lapig-raster-series-tab-trend-cmb-time-change-units').setValue('YEAR');
    }

    components.forEach(function(cmp) {
      cmp.store.removeAll();
    });

    instance.setSeriesActiveTabDisabled(true);

    Ext.getCmp('southpanel').setTitle(i18n.LAPIGVIEWER_TTL_TOOL_TIME_SERIES);
    instance.seriesProperties = undefined;
    instance.chartData[activeTab.index] = undefined;
  },

  requestChartData: function(timeseriesId, longitude, latitude, radius) {
    var instance = this;
    
    var activeTab = instance.getSeriesActiveTab();

    var startYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-start-year');
    var endYearCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-end-year');
    
    var groupDataCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-group-data');

    var interpolationCmb = Ext.getCmp('lapig-raster-series-tab-'+ activeTab.name +'-cmb-interpolation');

    if(activeTab.index == instance.tabProperties.series){
      var startValueCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value');
      var endValueCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value');
    }else if(activeTab.index == instance.tabProperties.trend){
      if (timeseriesId.indexOf('MOD13Q1') == -1) {
        Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_ALERT_VALIDATION, i18n.LAPIGRASTERSERIES_ALERT_ERROR2);
        instance.restartChart();
        return;
      }

      var timeChangeNum = Ext.getCmp('lapig-raster-series-tab-trend-num-time-change');
      var timeChangeUnitsCmb = Ext.getCmp('lapig-raster-series-tab-trend-cmb-time-change-units');

      timeChangeNum.setValue(1);
      timeChangeUnitsCmb.setValue('YEAR');
    }

    var chartDataUrl = 'time-series/' + timeseriesId + '/values';

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
          latitude: latitude,
          mode: activeTab.name,
          radius: radius
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

        years = _.sortBy(years, function(year) { return year[0]; });
        years = _.uniq(years, true, function(year) { return year[0]; });
        endYearCmb.store.loadData(years);
        startYearCmb.store.loadData(years);

        if(activeTab.index == instance.tabProperties.series){
          var interpolations = [];
          instance.chartData[activeTab.index].series.forEach(function(serie) {
            if(serie.id == 'original')
              serie.label = i18n.LAPIGRASTERSERIES_GROUPCB_NONE; 
            else{
              var filterOnly = {};
              filterOnly.position = -serie.position;
              filterOnly.type = serie.type;
              filterOnly.id = "only-"+serie.id;
              filterOnly.label = "Apenas " + serie.label;
              interpolations.push(filterOnly);
            }

            interpolations.push(serie)
          })
          interpolationCmb.store.loadData(interpolations);
        }else{
          var seriesInterpolationCmb = Ext.getCmp("lapig-raster-series-tab-series-cmb-interpolation");
          var filteredRecs = [];

          seriesInterpolationCmb.store.each(function (rec) {
            if (rec.get('id').indexOf("only") == -1) filteredRecs.push(rec.copy());
          });
          interpolationCmb.store.removeAll();
          interpolationCmb.store.add(filteredRecs);
        }

        var startYear = [years[0]];
        var endYear = [years[years.length - 1]];

        var startValue = [values[0]];
        var endValue = [values[values.length - 1]];

        endYearCmb.setValue(endYear);
        startYearCmb.setValue(startYear);

        if(activeTab.index == instance.tabProperties.series){
          startValueCmb.store.loadData(values);
          endValueCmb.store.loadData(values);
          
          endValueCmb.setValue(endValue);
          startValueCmb.setValue(startValue);
        }

        instance.seriesProperties = {timeseriesId, longitude, latitude, startYear, endYear, startValue, endValue, radius};

        instance.populateChart(startYear, endYear, startValue, endValue);

        instance.setSeriesActiveTabDisabled(false);

        loadMask.hide();
      },                                    
    });
  },

  getWdwInfoButtons: function() {
    var instance = this;

    var scale = parseInt(Ext.getCmp('lapig_rasterserires::wdw-info-txt-scale').getValue());
    var srcHtml = Ext.getCmp('lapig_rasterseries::frm-info-source').body.dom.innerHTML;
    var source = srcHtml.slice(32, -6);

    var addRadiusGUI = function(combo){
      var radius = combo.getValue();
      if(radius == '') return;

      var grid = Ext.getCmp('lapig-coordinates-grid');
      var map = instance.target.mapPanel.map;
      var vectorsLayer = map.getLayer("Coordinate_radius_layer");
      var selectedRec = grid.getSelectionModel().getSelected();

      var lon = selectedRec.get("longitude");
      var lat = selectedRec.get("latitude");

      var lonLat = new OpenLayers.LonLat(lon, lat)
        .transform(instance.WGS84_PROJ, instance.GOOGLE_PROJ);
      var centerPoint = new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat);

      var radiusPolygon = OpenLayers.Geometry.Polygon.createRegularPolygon(centerPoint, radius, 30, 0);
      circleFeature = new OpenLayers.Feature.Vector(radiusPolygon);

      vectorsLayer.destroyFeatures();
      vectorsLayer.addFeatures([circleFeature]);
    }

    return [
      {
        xtype: 'checkbox',
        boxLabel: "Usar raio:",
        id: 'lapig-coordinates-chk-use-radius',
        width: 'auto',
        disabled: true,
        enableOnSelect: (source != 'lapig') ? true : false,
        listeners:{
          check: function(checkbox, checked) {
            Ext.getCmp('lapig-coordinates-cmb-radius').setDisabled(!checked);
            Ext.getCmp('lapig-coordinates-label-radius').setDisabled(!checked);
          }
        }
      },
      {
        xtype:'combo',
        id: "lapig-coordinates-cmb-radius",
        fieldLabel: 'Raios',
        border: false,
        displayField:'radius',
        valueField: 'radius',
        mode: 'local',
        typeAhead: true,
        editable: false,
        disabled: true,
        triggerAction: 'all',
        width: 70,
        store: {
          xtype: 'arraystore',
          fields: [
             {name: 'radius'},
          ],
          data: [
            [scale], [scale*2], [scale*3]
          ]
        },
        listeners:{
          select: addRadiusGUI,
          disable: function(combo) {
            var map = instance.target.mapPanel.map;
            var vectorsLayer = map.getLayer("Coordinate_radius_layer");
            vectorsLayer.destroyFeatures();
          },
          enable: addRadiusGUI
        }
      },
      {
        xtype: 'label',
        id: 'lapig-coordinates-label-radius',
        text: i18n.LAPIGRASTERSERIES_TXT_RADUNIT_METER,
        width: 'auto',
        height: 'auto',
        disabled: true,
      },
      '->',
      {
        text: i18n.LAPIGRASTERSERIES_BTNTXT_CREATEGRAPH,
        xtype: "button",
        disabled: true,
        enableOnSelect: true,
        listeners: {
          click: function(evt) {
            lapigAnalytics.clickTool('Time Series','click-createGraphic','')
            
            var viewRadius = Ext.getCmp()

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

            southPanel.setTitle(i18n.LAPIGVIEWER_TTL_TOOL_TIME_SERIES + ' - ' + timeSeriesName);

            var activeTab = instance.getSeriesActiveTab();
            var otherTabIndex = Math.abs(activeTab.index-1);

            if (instance.chartData != undefined){
              instance.chartData[otherTabIndex] = undefined;
            }

            var useRadius = Ext.getCmp('lapig-coordinates-chk-use-radius').getValue();
            var radius = undefined;
            if (useRadius == true) {
              radius = Ext.getCmp('lapig-coordinates-cmb-radius').getValue();
            }

            /*if((useRadius == 250) || (useRadius == 500) || (useRadius == 750)){
                //lapigAnalytics.clickTool('Time Series','value-Radius',valueRadius.lastSelectionText);
                console.log("tirar o // value-Radius",valueRadius.lastSelectionText);
            } else {
              //lapigAnalytics.clickTool('Time Series','value-Radius','0');
              console.log("valor do raio eh 0");
            }*/

            var lapigCoordinatesWin = Ext.getCmp('lapig-coordinates-window');
            lapigCoordinatesWin.close();

            instance.requestChartData(timeSeriesId, longitude, latitude, radius);
            
          }
        }
      }
    ]
  }

});

Ext.preg(lapig.tools.RasterSeries.prototype.ptype, lapig.tools.RasterSeries);