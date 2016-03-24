/**
 * Copyright (c) 2008-2011 The Open Planning Project
 *
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires OpenLayers/Layer/Markers.js
 * @requires OpenLayers/Icon.js
 * @requires OpenLayers/Marker.js
 * @requires OpenLayers/Control/DrawFeature.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Zoom
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Zoom(config)
 *
 *    Provides two actions for zooming in and out.
 */
gxp.plugins.LapigCoordinates = Ext.extend(gxp.plugins.Tool, {

		ptype: "gxp_lapigcoordinates",

		GOOGLE_PROJ: new OpenLayers.Projection("EPSG:900913"),

		WGS84_PROJ: new OpenLayers.Projection("EPSG:4326"),

		layerName: 'Coordenadas Geográficas',

		pubLayer: 'WS_LAPIG_INDICES:or_publicacoes_lapig',

		data: null,

		vectors: null,

		constructor: function(config) {
				gxp.plugins.LapigCoordinates.superclass.constructor.apply(this, arguments);
		},

		addActions: function() {
				var instance = this;

				var actions = gxp.plugins.LapigCoordinates.superclass.addActions.apply(this, [{
						tooltip: this.tooltip,
						iconCls: "gxp-icon-lapigcoordinates",
						handler: function(scope, evt, buttons) {
								instance.addOutput(buttons);
						},
						id: 'lapig-coordinates-tool',
						scope: this
				}]);

				return actions;
		},

		addOutput: function(buttons) {
				var windowObj = this.getWindow(buttons);

				windowObj.show();
		},

		createPersistenceObj: function() {
				var instance = this;
				var map = this.target.mapPanel.map;

				instance.contador = 0;

				instance.vectors = new OpenLayers.Layer.Markers(instance.layerName, {
						displayInLayerSwitcher: true
				});
				map.addLayer(instance.vectors);

				instance.store = new Ext.data.ArrayStore({
						fields: [{
								name: 'name'
						}, {
								name: 'longitude',
								type: 'float'
						}, {
								name: 'latitude',
								type: 'float'
						}],
						listeners: {
							'remove': function() {
								instance.checkButtonsState()
							}
						}
				});

				instance.iconPathSelect = 'theme/app/img/markers/map-pin-blue.png';

				map.events.register('addlayer', map, function() {
						instance.setLayerIndex();
				});

				this.target.addListener("logout", instance.resetPoints, this);
				
				this.target.addListener("login", function(){
					instance.resetPoints();
					instance.getPoints();
				}, this);

				instance.getPoints();
		},

		getPoints: function() {
			var instance = this;
			if(isAnyoneHome) {

				Ext.Ajax.request({
					url: '/user/points',
	        method: 'GET',

	        success: function (response){
	          res = JSON.parse(response.responseText);
	          
	          if (res.success) {
		          res.result.forEach(function(point){
		          	instance.addPointGUI(point.name, point.longitude, point.latitude);
		          });
		        } else {
		        	Ext.MessageBox.alert("", i18n.LAPIGCOORDINATES_ERRMSG_GETPOINTS);
		        }
	        }
				});
			}
		},

		insertPoint: function(name, lon, lat) {
			var instance = this;
			if(isAnyoneHome){

				console.log("inserting point:", name, "lon:", lon, "lat:", lat)

				Ext.Ajax.request({
					url: 'user/points',
					method: 'PUT',
					jsonData:{
						name: name,
						longitude: lon,
						latitude: lat
					},
					success: function (response) {
						res = JSON.parse(response.responseText);
	          
	          if (!res.success) {
							Ext.MessageBox.alert("", i18n.LAPIGCOORDINATES_ERRMSG_INSERTPOINT);
						}else{
							 instance.addPointGUI(name, lon, lat);
						}
					}
				});
			}else{
				instance.addPointGUI(name, lon, lat);
			}
		},

		deletePoint: function(lon, lat) {
			var instance = this;
			if(isAnyoneHome){

				console.log("deleting point:", "lon:", lon, "lat:", lat)
			
				Ext.Ajax.request({
					url: 'user/points',
					method: 'DELETE',
					params:{
						longitude: lon,
						latitude: lat,
					},
					success: function (response) {
						res = JSON.parse(response.responseText);
	          
	          if (!res.success) {
							Ext.MessageBox.alert("", i18n.LAPIGCOORDINATES_ERRMSG_DELETEPOINT);
						}
					}
				});
			}
		},

		addPointGUI: function(name, lon, lat) {
			var instance = this;

			var lonLat = new OpenLayers.LonLat(lon, lat)
				.transform(instance.WGS84_PROJ, instance.GOOGLE_PROJ);

			var size = new OpenLayers.Size(38, 38);
			var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
			var icon = new OpenLayers.Icon(instance.iconPathSelect, size, offset);

			var marker = new OpenLayers.Marker(lonLat, icon);
			marker.idLatLonCrl = name + '-' + lat + '-' + lon;
			instance.vectors.addMarker(marker);
			instance.store.loadData([[ name, lon, lat]], true);
		},

		resetPoints: function() {
			var instance = this;
			var map = this.target.mapPanel.map;

			instance.store.removeAll();
			instance.vectors.clearMarkers();
		},

		getMapMarker: function(longitude, latitude) {
				var instance = this;
				var markers = instance.vectors.markers;

				for (var i = 0; i < markers.length; i++) {
						var marker = markers[i];

						if (marker.controle == (String(longitude) + String(latitude)))
								return marker;
				}
				layerName

				return undefined;
		},

		setLayerIndex: function() {
				var instance = this;
				var map = this.target.mapPanel.map;

				var lastIndex = 0;
				map.layers.forEach(function(l) {
						var layerIndex = map.getLayerIndex(l);
						if (layerIndex > lastIndex)
								lastIndex = layerIndex
				});

				map.setLayerIndex(instance.vectors, (lastIndex + 1));
		},

		dms2dd: function(cd, cm, cs) {
				try {
						//YAHOO.log("dms2dd", "i3geo");
						//converte dms em dd
						var sinal = 'positivo';
						if (cd < 0) {
								cd = cd * -1;
								sinal = 'negativo';
						}
						spm = cs / 3600;
						mpg = cm / 60;
						var dd = (cd * 1) + (mpg * 1) + (spm * 1);
						if (sinal == 'negativo') {
								dd = dd * -1;
						}
						//YAHOO.log("Fim dms2dd", "i3geo");
						return (dd);
				} catch (e) {
						return (0);
				}
		},

		dd2dms: function(x, y) {
				var m = 0;
				var s = 0;
				var dx = parseInt(x);
				if (dx > 0) {
						var restod = x - dx;
				}
				if (dx < 0) {
						restod = (x * -1) - (dx * -1);
				}
				dx = dx;
				if (restod != 0) {
						var mm = restod * 60;
						var m = parseInt(restod * 60);
						var restos = mm - m;
						var mx = m;
						if (restos != 0) {
								var s = restos * 60;
								var s = (s + "_").substring(0, 5);
								var sx = s;
						} else {
								s = "00.00"
						}
				} else {
						var mx = "00";
						var sx = "00.00";
				}
				if (m.length == 2) {
						m = "0" + m + "";
				}
				if (s * 1 < 10) {
						s = "0" + s;
				}
				var xv = dx + " " + mx + " " + sx;
				var m = 0;
				var s = 0;
				var dy = parseInt(y);
				if (dy > 0) {
						var restod = y - dy;
				}
				if (dy < 0) {
						var restod = (y * -1) - (dy * -1);
				}
				dy = dy;
				if (restod != 0) {
						var mm = restod * 60;
						var m = parseInt(restod * 60);
						var restos = mm - m;
						var my = m;
						if (restos != 0) {
								var s = restos * 60;
								s = (s + "_").substring(0, 5);
								var sy = s;
						} else {
								var s = "00.00";
						}
				} else {
						var my = "00";
						var sy = "00.00";
				}
				if (m.length == 2) {
						m = "0" + m;
				}
				if (s * 1 < 10) {
						s = "0" + s;
				}
				var yv = dy + " " + my + " " + sy;
				var res = new Array();
				res[0] = xv;
				res[1] = yv;
				return res;
		},

		setDd: function(lon, lat) {
				Ext.getCmp('form-text-lon-2').setValue(lon);
				Ext.getCmp('form-text-lat-2').setValue(lat);
		},

		setDms: function(coord) {

				var dmsLon = coord[0].split(' ');
				var dmsLat = coord[1].split(' ');

				Ext.getCmp('dms-lon-d-2').setValue(dmsLon[0]);
				Ext.getCmp('dms-lon-m-2').setValue(dmsLon[1]);
				Ext.getCmp('dms-lon-s-2').setValue(dmsLon[2]);

				Ext.getCmp('dms-lat-d-2').setValue(dmsLat[0]);
				Ext.getCmp('dms-lat-m-2').setValue(dmsLat[1]);
				Ext.getCmp('dms-lat-s-2').setValue(dmsLat[2]);
		},

		checkButtonsState: function() {
			var buttons = Ext.getCmp('lapig-coordinates-window').buttons;
			var grid = Ext.getCmp('lapig-coordinates-grid');
			if(buttons) {
				var state = !grid.getSelectionModel().hasSelection();
					buttons.forEach(function(btn) {
						btn.setDisabled(state);
					})
			}
		},

		getGrid: function() {
				var instance = this;

				return {
						store: instance.store,
						id: 'lapig-coordinates-grid',
						xtype: "grid",
						viewConfig: {
							emptyText: i18n.LAPIGCOORDINATES_INSTR_EMPTYTXTGRID,
							deferEmptyText: false
						},
						header: false,
						style: {
							'margin-top': '10px'
						},
						columns: [
							{
								id: 'name',
								header: i18n.LAPIGCOORDINATES_TTLCOL_NAME,
								width: 160,
								sortable: true,
								menuDisabled: true,
								dataIndex: 'name'
							}, {
									header: i18n.LAPIGCOORDINATES_TTLCOL_LONG,
									width: 65,
									sortable: true,
									menuDisabled: true,
									dataIndex: 'longitude'
							}, {
									header: i18n.LAPIGCOORDINATES_TTLCOL_LAT,
									width: 65,
									sortable: true,
									menuDisabled: true,
									dataIndex: 'latitude'
							}, {
									xtype: 'actioncolumn',
									width: 40,
									sortable: false,
									menuDisabled: true,
									items: [{
											icon: "theme/app/img/delete.png",
											tooltip: i18n.LAPIGCOORDINATES_BTNREMOVE_TLTP,
											handler: function(grid, rowIndex, colIndex) {
													var rec = instance.store.getAt(rowIndex);

													var idLatLonCrl = rec.get('name') + '-' + rec.get('latitude') + '-' + rec.get('longitude');

													instance.vectors.markers.every(function(m) {
															if(m.idLatLonCrl == idLatLonCrl) {
																	instance.store.removeAt(rowIndex);
																	instance.vectors.removeMarker(m);
																	instance.deletePoint(rec.get('longitude'), rec.get('latitude'));
																	return false;
															} else {
																	return true;
															}
													})
											}
									}]
							}
						],
						stripeRows: true,
						autoExpandColumn: 'name',
						autoHeight: true, //!!!
						autoWidth : true, //!!!
						listeners: {
							'rowclick': instance.checkButtonsState
						}
				};
		},

		getWindowContent: function() {
				var fm = Ext.form;
				var instance = this;
				var map = this.target.mapPanel.map;
				var selectedValueLine = '';
				var selectedValueBar = '';

				var getMapCoordBtn = function() {
						return {
								xtype: 'button',
								icon: 'theme/app/img/lapig-coordenadas-add.png',
								height: 10,
								tooltip: i18n.LAPIGCOORDINATES_BTNMAPCOORD_TLTP,
								style: {
										'margin-right': '10px'
								},
								handler: function() {
										var fn = function(e) {
												var lonLat = map.getLonLatFromPixel(e.xy)
														.transform(instance.GOOGLE_PROJ, instance.WGS84_PROJ);

												instance.setDd(lonLat.lon, lonLat.lat);
												instance.setDms(instance.dd2dms(lonLat.lon, lonLat.lat));

												OpenLayers.Element.removeClass(map.viewPortDiv, "olControlLapigCoordinates");
												map.events.unregister("click", map, fn);
										};

										OpenLayers.Element.addClass(map.viewPortDiv, "olControlLapigCoordinates");
										map.events.register("click", map, fn);

								}
						};
				};

				var layerExist = false;

				map.layers.every(function(l) {
						if (l.name == instance.layerName)
								layerExist = true;

						return !layerExist;
				});

				if (!layerExist) {
						instance.createPersistenceObj();
				}

				var rasterSeriesForm = {
					xtype: 'panel',
					border: false,
					layout: {
						type:'vbox',
						padding:'5',
						align:'stretch'
					},
					items: [
						{
							xtype: 'fieldset',
							title: i18n.LAPIGCOORDINATES_TTLVBOX_COORD,
							id: 'teste',
							layout: {
								type:'vbox',
								padding:'1',
								align:'stretch'
							},
							defaults: {
							},
							height: 120,
							items: [
									{
										xtype: 'radiogroup',
										hideLabel: true,
										flex: 1,
										items: [
											{
												name: 'graus',
												boxLabel: i18n.LAPIGCOORDINATES_BOXLBL_GDEC,
												inputValue: 'DD',
												checked: true,
												listeners: {
														check: function(evt, checked) {
																if (checked) {

																		var ddLon = instance.dms2dd(
																				Ext.getCmp('dms-lon-d-2').getValue(),
																				Ext.getCmp('dms-lon-m-2').getValue(),
																				Ext.getCmp('dms-lon-s-2').getValue()
																		);

																		var ddLat = instance.dms2dd(
																				Ext.getCmp('dms-lat-d-2').getValue(),
																				Ext.getCmp('dms-lat-m-2').getValue(),
																				Ext.getCmp('dms-lat-s-2').getValue()
																		);

																		instance.setDd(ddLon, ddLat);

																		Ext.getCmp('dd-panel-2').show();
																		Ext.getCmp('dms-panel-2').hide();
																}
														}
												}
											},
										  {
												name: 'graus',
												boxLabel: i18n.LAPIGCOORDINATES_BOXLBL_GMINSE,
												inputValue: 'DMS',
												listeners: {
													check: function(evt, checked) {
															if (checked) {

																	var ddLon = Ext.getCmp('form-text-lon-2').value;
																	var ddLat = Ext.getCmp('form-text-lat-2').value;

																	if (ddLon && ddLat)
																			instance.setDms(instance.dd2dms(ddLon, ddLat));

																	Ext.getCmp('dd-panel-2').hide();
																	Ext.getCmp('dms-panel-2').show();
																	Ext.getCmp('teste').doLayout();
															}
													}
												}
											}
										]
									},
								  {
										id: 'dd-panel-2',
										flex: 1,
										xtype: 'compositefield',
										layout: {
											type:'hbox',
											padding:'2',
											align:'stretch'
										},
										items: [
											getMapCoordBtn(),
										 	{
													xtype: 'numberfield',
													id: 'form-text-lon-2',
													emptyText: i18n.LAPIGCOORDINATES_NBFIELD_EMPTYTXTLON,
													decimalPrecision: 4,
													flex: 1,
													name: 'lon',
													style: {
															'text-align': 'right'
													}
											},
										  {
												xtype: 'numberfield',
												id: 'form-text-lat-2',
												emptyText: i18n.LAPIGCOORDINATES_NBFIELD_EMPTYTXTLAT,
												decimalPrecision: 4,
												flex: 1,
												style: {
													'text-align': 'right'
												}
											}
										]
									},
								  {
										xtype: 'compositefield',
										id: 'dms-panel-2',
										flex: 1,
										hidden: true,
										layout: {
											type:'hbox',
											padding:'0',
											align:'stretch'
										},
										items: [
												getMapCoordBtn(),
												{
														xtype: 'numberfield',
														decimalPrecision: 0,
														width: 25,
														id: 'dms-lon-d-2'
												}, {
														xtype: 'label',
														text: '°',
														width: 1
												}, {
														xtype: 'numberfield',
														decimalPrecision: 0,
														width: 25,
														id: 'dms-lon-m-2'
												}, {
														xtype: 'label',
														text: "'",
														width: 1
												}, {
														xtype: 'numberfield',
														decimalPrecision: 4,
														flex: 1,
														id: 'dms-lon-s-2'
												}, {
														xtype: 'label',
														text: '"',
														width: 1
												}, {
														xtype: 'numberfield',
														decimalPrecision: 0,
														width: 25,
														id: 'dms-lat-d-2'
												}, {
														xtype: 'label',
														text: '°',
														width: 1
												}, {
														xtype: 'numberfield',
														decimalPrecision: 0,
														width: 25,
														id: 'dms-lat-m-2'
												}, {
														xtype: 'label',
														text: "'",
														width: 1
												}, {
														xtype: 'numberfield',
														decimalPrecision: 4,
														flex: 1,
														id: 'dms-lat-s-2'
												}, {
														xtype: 'label',
														text: '"',
														width: 4
												}
										]
									},
								  {
										xtype: 'compositefield',
										layout: {
											type:'hbox',
											padding:'2',
											align:'stretch'
										},
										flex:1,
										items: [
											{
												xtype: "label",
												text: i18n.LAPIGCOORDINATES_FIELDLBL_NAMEDESC,
												width: 100,
												style: {
													'margin-top': '4px'
												}
											}, {
													xtype: "textfield",
													flex:1,
													id: "form-text-name",
											}, {
													icon: "theme/app/img/add.png",
													xtype: 'button',
													width: '20px',
													handler: function() {

															var lat = Ext.getCmp('form-text-lat-2').getValue();
															var lon = Ext.getCmp('form-text-lon-2').getValue();
															var name = Ext.getCmp('form-text-name').getValue();

															if(!lat || !lon) {
																	var ddLon = instance.dms2dd(
																			Ext.getCmp('dms-lon-d-2').getValue(),
																			Ext.getCmp('dms-lon-m-2').getValue(),
																			Ext.getCmp('dms-lon-s-2').getValue()
																	);

																	var ddLat = instance.dms2dd(
																			Ext.getCmp('dms-lat-d-2').getValue(),
																			Ext.getCmp('dms-lat-m-2').getValue(),
																			Ext.getCmp('dms-lat-s-2').getValue()
																	);

																	instance.setDd(ddLon, ddLat);
																	lat = Ext.getCmp('form-text-lat-2').getValue();
																	lon = Ext.getCmp('form-text-lon-2').getValue();

																	if(!lat || !lon) {
																		return Ext.MessageBox.alert('LAPIG-Maps - Validação', 'Digite uma coordenada geográfica preenchendo os campos Longitude e Latitude');
																	}
															}

															instance.insertPoint(name, lon, lat);

															Ext.getCmp('form-text-lat-2').setValue('');
															Ext.getCmp('form-text-lon-2').setValue('');

															Ext.getCmp('dms-lat-d-2').setValue('');
															Ext.getCmp('dms-lat-m-2').setValue('');
															Ext.getCmp('dms-lat-s-2').setValue('');
															Ext.getCmp('dms-lon-d-2').setValue('');
															Ext.getCmp('dms-lon-m-2').setValue('');
															Ext.getCmp('dms-lon-s-2').setValue('');

															Ext.getCmp('form-text-name').setValue('');
													}
											}
										]
									}
							]
						},
						{
							height: 120,
							border: false,
							autoScroll: true,
							items: [
								instance.getGrid()
							]
						},
						{
							xtype: 'fieldset',
							title: 'Configuração de raio',
							hidden: true,
							id: 'lapig-coordinates-radius-fieldset',
							layout: {
								type: 'hbox',
								// padding: '5'
							},
							height: 60,
							items: [
								{
									xtype: 'checkbox',
									boxLabel: "Usar raio:",
									id: 'lapig-coordenadas-chk-use-radius',
									flex: 1,
									listeners:{
										check: function(checkbox, checked) {
											Ext.getCmp('lapig-coordenadas-cmb-radius').setDisabled(!checked);
										}
									}
								},
								{
									xtype:'combo',
                  id: "lapig-coordenadas-cmb-radius",
                  flex: 1,
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
                  value: 250,
                  store: {
                    xtype: 'arraystore',
                    fields: [
                       {name: 'radius'},
                    ],
                    data: [
                    	[250], [500], [1000], [1250]
                    ]
                  }
								},
								{
									xtype: 'label',
									html: "<text font=18>metros</text>",
									flex: 1,
									width: 1
								}
							]
						}
					]
				};

				return rasterSeriesForm;
		},

		getWindow: function(buttons) {
				return new Ext.Window({
						id: 'lapig-coordinates-window',
						title: i18n.LAPIGCOORDINATES_TTLWIN_COORD,
						width: 330,
						height: 340,
						layout: 'fit',
						plain: true,
						items: [
								this.getWindowContent()
						],
						bodyStyle: 'padding:0px;',
						listeners: {
								close: function() {}
						},
						buttons: buttons
				});
		}
});

Ext.preg(gxp.plugins.LapigCoordinates.prototype.ptype, gxp.plugins.LapigCoordinates);