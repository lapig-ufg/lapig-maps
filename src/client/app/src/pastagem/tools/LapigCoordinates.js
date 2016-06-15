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
 *
 * @require tools/LapigRowEditor.js
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
								lapigAnalytics.clickTool('Tools', 'Add Coordinates', '')
						},
						id: 'lapig-coordinates-tool',
						scope: this
				}]);

				return actions;
		},

		addOutput: function(buttons) {
			var instance = this;
			
			if (instance.CoordWindow == undefined){
				instance.CoordWindow = instance.getWindow(buttons);
				instance.CoordWindow.on('close', function() {
					instance.CoordWindow = undefined;
				});
				instance.CoordWindow.show();
			} else if(!instance.CoordWindow.isVisible()){
				instance.CoordWindow.show();
			}
		},

		createPersistenceObj: function() {
				var instance = this;
				
				instance.map = this.target.mapPanel.map;
				instance.contador = 0;

				instance.markersLayer = new OpenLayers.Layer.Markers(instance.layerName, {
						displayInLayerSwitcher: true
				});

				var radiusStyle = new OpenLayers.StyleMap({
			      "default": {
			          strokeColor: "fuchsia",
			          strokeWidth: 1,
			          fillOpacity: 0.2
			      }
			  });

				instance.vectorsLayer =  new OpenLayers.Layer.Vector("Coordinate_radius_layer", {
					styleMap: radiusStyle,
					displayInLayerSwitcher: false
				});

				instance.vectorsLayer.id = "Coordinate_radius_layer";

				instance.markers = {"selected": undefined};

				instance.map.addLayer(instance.markersLayer);
				instance.map.addLayer(instance.vectorsLayer);

				instance.store = new Ext.data.ArrayStore({
						fields: [{
								name: 'name'
						}, {
								name: 'longitude',
								type: 'float',
								allowBlank: false
						}, {
								name: 'latitude',
								type: 'float',
								allowBlank: false
						}],
						listeners: {
							'remove': function() {
								instance.checkButtonsState()
							}
						},
						sortInfo: {
					    field: 'name',
					    direction: 'ASC'
						}
				});

				instance.iconPath = 'theme/app/img/markers/map-pin-blue.png';
				instance.selectedIconPath = 'theme/app/img/markers/map-pin-pink.png';

				instance.map.events.register('addlayer', instance.map, function() {
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
		          	instance.addPointGUI(point.name, point.longitude, point.latitude, true);
		          });
		        } else {
		        	Ext.MessageBox.alert("", i18n.LAPIGCOORDINATES_ERRMSG_GETPOINTS);
		        }
	        }
				});
			}
		},

		insertPoint: function(name, lon, lat, oldLon, oldLat, callback) {
			var instance = this;

			if(isAnyoneHome){

				Ext.Ajax.request({
					url: 'user/points',
					method: 'PUT',
					jsonData:{
						name: name,
						longitude: lon,
						latitude: lat,
						oldLon: oldLon,
						oldLat: oldLat
					},
					success: function (response) {
						res = JSON.parse(response.responseText);
	          
	          if (!res.success) {
							Ext.MessageBox.alert("", i18n.LAPIGCOORDINATES_ERRMSG_INSERTPOINT);
						}else{
							 instance.addPointGUI(name, lon, lat, false, callback);
							 instance.unifyPoints(name, lon, lat);
						}
					}
				});
			}else{
				instance.addPointGUI(name, lon, lat, false, callback);
			}
		},

		deletePoint: function(lon, lat) {
			var instance = this;

			lapigAnalytics.clickTool('Add Coordinates', 'click-Remove', '')
			if(isAnyoneHome){
			
				Ext.Ajax.request({
					url: 'user/points',
					method: 'DELETE',
					params:{
						longitude: lon,
						latitude: lat
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

		removeCommasPoint: function (name, lon, lat) {
			var instance = this;

			var newlon = lon;
			var newlat = lat;
			
			var isInvalid = false;			
			if(typeof lon == 'string' && lon.indexOf(",") != -1){
				newlon = lon.replace(/,/g, ".");
				isInvalid = true;
			}
			if(typeof lat == 'string' && lat.indexOf(",") != -1){
				newlat = lat.replace(/,/g, ".");
				isInvalid = true;
			}
			
			if (isInvalid) {
				instance.insertPoint(name, newlon, newlat, lon, lat)
			}

			return {
				"lon": newlon,
				"lat": newlat 
			}
		},

		addPointGUI: function(name, lon, lat, updateStore, callback) {
			var instance = this;

			lapigAnalytics.clickTool('Add Coordinates', 'click-Save', '')

			validCoords = instance.removeCommasPoint(name, lon, lat);
			lon = validCoords.lon;
			lat = validCoords.lat;

			var lonLat = new OpenLayers.LonLat(lon, lat)
				.transform(instance.WGS84_PROJ, instance.GOOGLE_PROJ);

			var size = new OpenLayers.Size(38, 38);
			var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
			var icon = new OpenLayers.Icon(instance.iconPath, size, offset);

			var marker = new OpenLayers.Marker(lonLat, icon);
			marker.idLatLonCrl = name + lon + lat;
			instance.markersLayer.addMarker(marker);

			if(updateStore){
				instance.store.loadData([[ name, lon, lat]], true);
				instance.store.sort('name', 'ASC');
			}
			instance.markers[marker.idLatLonCrl] = marker;

			if (callback) callback();
		},

		unifyPoints: function(name, lon, lat){
			var instance = this;

			var duplicates = 0;
			instance.store.each(function(rec){
				if(rec.get('longitude') == lon && rec.get('latitude') == lat){
					if(rec.get('name') != name){
						instance.store.remove(rec);
						return false;
					}else{
						duplicates++;
						if(duplicates >= 2){
							instance.store.remove(rec);
							return false;
						}
					}
				}
				return true;
			});
		},

		resetPoints: function() {
			var instance = this;

			instance.store.removeAll();
			instance.markersLayer.clearMarkers();
		},

		setLayerIndex: function() {
				var instance = this;

				var lastIndex = 0;
				instance.map.layers.forEach(function(l) {
						var layerIndex = instance.map.getLayerIndex(l);
						if (layerIndex > lastIndex)
								lastIndex = layerIndex
				});

				instance.map.setLayerIndex(instance.markersLayer, (lastIndex + 1));
		},

		/*dms2dd: function(cd, cm, cs) {
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
		},*/

		/*dd2dms: function(x, y) {
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
		},*/

		/*setDd: function(lon, lat) {
				Ext.getCmp('form-text-lon-2').setValue(lon);
				Ext.getCmp('form-text-lat-2').setValue(lat);
		},*/

		/*setDms: function(coord) {

				var dmsLon = coord[0].split(' ');
				var dmsLat = coord[1].split(' ');

				Ext.getCmp('dms-lon-d-2').setValue(dmsLon[0]);
				Ext.getCmp('dms-lon-m-2').setValue(dmsLon[1]);
				Ext.getCmp('dms-lon-s-2').setValue(dmsLon[2]);

				Ext.getCmp('dms-lat-d-2').setValue(dmsLat[0]);
				Ext.getCmp('dms-lat-m-2').setValue(dmsLat[1]);
				Ext.getCmp('dms-lat-s-2').setValue(dmsLat[2]);
		},*/

		/*parseCoord: function(longitude, latitude) {
			if (longitude.match('')) {
				
			} else if (longitude.match('')) {

			}
		},*/

		checkButtonsState: function() {
			var fbar = Ext.getCmp('lapig-coordinates-window').getFooterToolbar();
			if (fbar == undefined) {
				return;
			}

			var buttons = fbar.items.items;
			var grid = Ext.getCmp('lapig-coordinates-grid');

			if(buttons) {
				var state = !grid.getSelectionModel().hasSelection();
				buttons.forEach(function(btn) {
					btn.setDisabled(state || (!btn.enableOnSelect && btn.disabled));
				})
			}
		},

		mapClickFn: function(e) {
			var instance = this;

			lapigAnalytics.clickTool('Add Coordinates', 'click-Map', '')
			var lonLat = instance.map.getLonLatFromPixel(e.xy)
					.transform(instance.GOOGLE_PROJ, instance.WGS84_PROJ);

			var lonCol = 1, latCol = 2;
			if (!(rowEditor.setValue(lonCol, lonLat.lon) &&
			rowEditor.setValue(latCol, lonLat.lat))){
				Ext.MessageBox.alert(i18n.LAPIGCOORDINATES_ALERT_ERRTLT, i18n.LAPIGCOORDINATES_ALERT_ERRMSG_SETLONLAT);
				return;
			}

			OpenLayers.Element.removeClass(instance.map.viewPortDiv, "olControlLapigCoordinates");
			instance.map.events.unregister("click", instance, instance.mapClickFn);
		},

		getGrid: function() {
				var instance = this;

				var Coordinate = Ext.data.Record.create([
					{
						name: 'name',
						type: 'string'
					},
					{
						name: 'longitude',
						type: 'float'
					},
					{
						name: 'latitude',
						type: 'float'
					}
				]);

				rowEditor = new gxp.plugins.LapigRowEditor({
					saveText: i18n.LAPIGCOORDINATES_BTNLBL_SAVE,
					cancelText: i18n.LAPIGCOORDINATES_BTNLBL_CANCEL,
					commitChangesText: i18n.LAPIGCOORDINATES_TOOLTIP_ERRMSG,
    			errorText: i18n.LAPIGCOORDINATES_ALERT_ERRTLT
				});

				var grid = new Ext.grid.GridPanel({
						store: instance.store,
						plugins: [rowEditor],
						selModel: new Ext.grid.RowSelectionModel({
							singleSelect: true,
							moveEditorOnEnter: true
						}),
						id: 'lapig-coordinates-grid',
						xtype: "grid",
						viewConfig: {
							emptyText: i18n.LAPIGCOORDINATES_INSTR_EMPTYTXTGRID,
							deferEmptyText: false,
							markDirty: false
						},
						header: false,
						style: {
							'margin-top': '10px'
						},
						tbar: [
							{
								xtype: 'button',
								tooltip: i18n.LAPIGCOORDINATES_BTNMAPCOORD_TLTP,
								iconCls: 'lapig-icon-add',
								handler: function() {
									lapigAnalytics.clickTool('Add Coordinates', 'click-Add', '')
									if (rowEditor.isEditing()) {
										return;
									}

									var p = new Coordinate({
                    name: i18n.LAPIGCOORDINATES_NAMEFIELD_EMPTYTXT_NEWCOORD
	                });
	                rowEditor.stopEditing();
	                instance.store.insert(0, p);
	                grid.getView().refresh();
	                rowEditor.newRecord(0);
	                grid.getSelectionModel().selectRow(0);
	                grid.newRecord = 0;

									OpenLayers.Element.addClass(instance.map.viewPortDiv, "olControlLapigCoordinates");
									instance.map.events.register("click", instance, instance.mapClickFn);
								}
							},
							' ',
							{
								xtype: 'button',
								tooltip: i18n.LAPIGCOORDINATES_BTNREMOVE_TLTP,
								iconCls: 'lapig-icon-delete',
								disabled: true,
								ref: '../removeBtn',
		            handler: function(){
	                rowEditor.stopEditing();
	                var rec = grid.getSelectionModel().getSelected(); //getSelections();
	                // for(var i = 0, r; r = s[i]; i++){
                  var idLatLonCrl = rec.get('name') + rec.get('longitude') + rec.get('latitude');

									instance.store.remove(rec);
									instance.markersLayer.removeMarker(instance.markers[idLatLonCrl]);
									
									instance.markers[idLatLonCrl].destroy();
									delete instance.markers[idLatLonCrl];
									delete instance.markers["selected"];
									
									instance.deletePoint(rec.get('longitude'), rec.get('latitude'));

									instance.vectorsLayer.destroyFeatures();
	                // }
	                // instance.store.commitChanges();
		            }
							},
							' ',
							{
								xtype: 'button',
								tooltip: i18n.LAPIGCOORDINATES_BTNEDIT_TLTP,
								iconCls: 'lapig-icon-edit',
								disabled: true,
								ref: '../editBtn',
								handler: function() {
								lapigAnalytics.clickTool('Add Coordinates', 'click-Edit', '')
	                rowEditor.stopEditing();
	                grid.getView().refresh();
	                var row = grid.getSelectionModel().getSelected();
	                rowEditor.startEditing(row);
								}
							}
						],
						columns: [
							{
								id: 'coordinate_name',
								header: i18n.LAPIGCOORDINATES_TTLCOL_NAME,
								width: 160,
								sortable: true,
								menuDisabled: true,
								dataIndex: 'name',
								editor: {
									xtype: 'textfield'
								}
							}, {
									header: i18n.LAPIGCOORDINATES_TTLCOL_LONG,
									width: 65,
									sortable: true,
									menuDisabled: true,
									dataIndex: 'longitude',
									editor: {
										xtype: 'numberfield',
										decimalPrecision: 4,
										decimalSeparator: ".",
                		allowBlank: false,
                		minValue: -180,
                		maxValue: 180,
                		minText: i18n.LAPIGCOORDINATES_ERRMSG_INVALIDVALUE,
                		maxText: i18n.LAPIGCOORDINATES_ERRMSG_INVALIDVALUE,
                		blankText: i18n.LAPIGCOORDINATES_WRNMSG_BLANKFIELD,
                		// validationEvent: false,
                		bubbleEvents: ["invalid", "valid"]
									}
							}, {
									header: i18n.LAPIGCOORDINATES_TTLCOL_LAT,
									width: 65,
									sortable: true,
									menuDisabled: true,
									dataIndex: 'latitude',
									editor: {
										xtype: 'numberfield',
										decimalPrecision: 4,
										decimalSeparator: ".",
                		allowBlank: false,
                		minValue: -90,
                		maxValue: 90,
                		minText: i18n.LAPIGCOORDINATES_ERRMSG_INVALIDVALUE,
                		maxText: i18n.LAPIGCOORDINATES_ERRMSG_INVALIDVALUE,
                		blankText: i18n.LAPIGCOORDINATES_WRNMSG_BLANKFIELD,
                		// validationEvent: false,
                		bubbleEvents: ["invalid", "valid"]
									}
							}
						],
						stripeRows: true,
						autoExpandColumn: 'coordinate_name',
						autoHeight: true, //!!!
						autoWidth : true, //!!!
						listeners: {
							'rowclick': instance.checkButtonsState,

							'rowdblclick': function (grid, rowIndex, event) {
								var rec = grid.getSelectionModel().getSelected();
								var lon = rec.get("longitude");
								var lat = rec.get("latitude");

								var lonLat = new OpenLayers.LonLat(lon, lat)
									.transform(instance.WGS84_PROJ, instance.GOOGLE_PROJ);

								instance.map.setCenter(lonLat, 15);
							},

							'canceledit': function(rowEditor, forced, rowIndex) {
								lapigAnalytics.clickTool('Add Coordinates', 'click-cancelEdit', '')
								if(forced){
									if(grid.newRecord !== -1 && grid.newRecord !== undefined){
										instance.store.removeAt(rowIndex);
										grid.newRecord = -1;
										
										OpenLayers.Element.removeClass(instance.map.viewPortDiv, "olControlLapigCoordinates");
										instance.map.events.unregister("click", instance, instance.mapClickFn);
									}
								}else{
									grid.newRecord = -1;

									OpenLayers.Element.removeClass(instance.map.viewPortDiv, "olControlLapigCoordinates");
									instance.map.events.unregister("click", instance, instance.mapClickFn);
								}
							},

							'validateedit': function(rowEditor, changes, rec, rowIndex) {
								/*var lon = parseFloat(changes.longitude);
								var lat = parseFloat(changes.latitude);

								if(lat > 90 || lat < -91 || lon > 180 || lon < -180){
									Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_TXT_ALERTATTENCION, "Coordenadas inválidas");
									return false;
								}
								else*/ return true;
							},

							'afteredit': function(rowEditor, changes, rec, rowIndex) {
								grid.newRecord = -1;
								var name = rec.get('name'), lon = rec.get('longitude'), lat = rec.get('latitude');
								
								if(rec.modified){
									var oldLon = rec.modified.longitude == undefined ? lon : rec.modified.longitude;
									var oldLat = rec.modified.latitude == undefined ? lat : rec.modified.latitude;
								}
								
								OpenLayers.Element.removeClass(instance.map.viewPortDiv, "olControlLapigCoordinates");
								instance.map.events.unregister("click", instance, instance.mapClickFn);

								instance.insertPoint(name, lon, lat, oldLon, oldLat, function(){
									instance.store.commitChanges();
									grid.getSelectionModel().selectRow(rowIndex);
								});
							},

							invalid: function(field, msg){
								if (msg.indexOf(i18n.LAPIGCOORDINATES_ERRMSG_INVALIDVALUE) != -1) {
									console.log(field)
									rowEditor.showTooltip(i18n.LAPIGCOORDINATES_ALERT_ERRTLT,
									 i18n.LAPIGCOORDINATES_ERRMSG_INVALIDVALUE+' '+
									 i18n.LAPIGCOORDINATES_TOOLTIP_ERRMSG_ALLOWVAL+' ' + field.minValue +
									 " "+i18n.LAPIGRASTERSERIES_FIELDLBLCB_A+' '+field.maxValue)
								}
							},

							valid: function(field) {
								rowEditor.hideTooltip()
							}
						}
				});

				grid.getSelectionModel().on('selectionchange', function(sm){
	        grid.removeBtn.setDisabled(sm.getCount() < 1 || rowEditor.isEditing());
	        grid.editBtn.setDisabled(sm.getCount() < 1 || rowEditor.isEditing());

	        if (sm.getCount() == 1) {
	        	var selectedRec = sm.getSelected();
	        	
	        	var name = selectedRec.get("name");
	        	var lon = selectedRec.get("longitude");
	        	var lat = selectedRec.get("latitude");

		        if (lon !== undefined && lat !== undefined) {
		        	if (instance.markers["selected"] !== undefined) {
		        		instance.markers["selected"].icon.setUrl(instance.iconPath);
		        	}

		        	var idLatLonCrl = name + lon + lat;
		        	instance.markers[idLatLonCrl].icon.setUrl(instance.selectedIconPath);
		        	instance.markers["selected"] = instance.markers[idLatLonCrl];
		        	instance.markersLayer.redraw();
		        }
	        }
		    });

				return grid;
		},

		getWindowContent: function() {
				var instance = this;
				var map = this.target.mapPanel.map;

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
						padding:'0',
						align:'stretch'
					},
					items: [
						instance.getGrid()
					]
				};

				return rasterSeriesForm;
		},

		getWindow: function(buttons) {
			var instance = this;

			var screenSize = Ext.getBody().getViewSize();
			var width = 330, height = 350;
			var x = screenSize.width - width - (screenSize.width*0.05);
			var y = screenSize.height/2 - height/2;

				return new Ext.Window({
						id: 'lapig-coordinates-window',
						title: i18n.LAPIGCOORDINATES_TTLWIN_COORD,
						width: width,
						height: height,
						layout: 'fit',
						plain: true,
						x: x,
						y: y,
						items: [
								instance.getWindowContent()
						],
						bodyStyle: 'padding:0px;',
						listeners: {
								close: function() {
									OpenLayers.Element.removeClass(instance.map.viewPortDiv, "olControlLapigCoordinates");
									instance.map.events.unregister("click", instance, instance.mapClickFn);
								}
						},
						buttonAlign: 'left',
						fbar: buttons
				});
		}
});

Ext.preg(gxp.plugins.LapigCoordinates.prototype.ptype, gxp.plugins.LapigCoordinates);