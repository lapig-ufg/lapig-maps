L.UTFGridWMS = L.TileLayer.extend({

    defaultWmsParams: {
        SERVICE: 'WMS',
        REQUEST: 'GetMap',
        FORMAT: 'application/json',
        SRS:'EPSG:900913',
        imagetype:'utfgrid',
        VERSION: '1.1.1',
        WIDTH:512,
        HEIGHT:512

    },

	options: {
		resolution: 4,
		pointerCursor: true,
        mouseInterval: 66,
        crs: null,
        uppercase: false
	},

	_mouseOn: null,
    _mouseOnTile: null,
    _tileCharCode: null,
    _cache: null,
    _idIndex: null,
    _throttleMove: null,

    initialize: function (url, options) {

        this._url = url;

        var wmsParams = L.Util.extend({}, this.defaultWmsParams);

        for (var i in options) {
            if (!(i in this.options)) {
                wmsParams[i] = options[i];
            }
        }

        options = L.Util.setOptions(this, options);

        wmsParams.WIDTH = wmsParams.HEIGHT = this.defaultWmsParams.WIDTH * (options.detectRetina && retina ? 2 : 1);

        this.wmsParams = wmsParams;
    },

    _updateCursor: function(){ },

	onAdd: function (map) {
        this._cache = {};
        this._idIndex = {};

        L.TileLayer.prototype.onAdd.call(this, map);

        this._throttleMove = L.Util.throttle(this._move, this.options.mouseInterval, this);

        if (this.options.pointerCursor) {
            this._updateCursor = function(cursor) { this._container.style.cursor = cursor; }
        }

        map.on('boxzoomstart', this._disconnectMapEventHandlers, this);
        
        map.on('boxzoomend', this._throttleConnectEventHandlers, this);
        this._connectMapEventHandlers();
	},

	onRemove: function () {
		var map = this._map;
        map.off('boxzoomstart', this._disconnectMapEventHandlers, this);
        map.off('boxzoomend', this._throttleConnectEventHandlers, this);
        this._disconnectMapEventHandlers();
		this._updateCursor('');
        L.TileLayer.prototype.onRemove.call(this, map);
	},

    createTile: function(coords) {
        this._loadTile(coords);
        return document.createElement('div');
	},

    setUrl: function(url, noRedraw) {
        this._cache = {};
        return L.TileLayer.prototype.setUrl.call(this, url, noRedraw);
    },

    _connectMapEventHandlers: function(){
        this._map.on('click', this._onClick, this);
        this._map.on('mousemove', this._throttleMove, this);
    },

    _disconnectMapEventHandlers: function(){
        this._map.off('click', this._onClick, this);
		this._map.off('mousemove', this._throttleMove, this);
    },

    _throttleConnectEventHandlers: function() {
        setTimeout(this._connectMapEventHandlers.bind(this), 100);
    },

    _update: function (center, zoom) {
        L.TileLayer.prototype._update.call(this, center, zoom);
    },

    getTileUrl: function (coords) {

            this._crs = map.options.crs;
        var tileBounds = this._tileCoordsToBounds(coords),
            nw = this._crs.project(tileBounds.getNorthWest()),
            se = this._crs.project(tileBounds.getSouthEast()),

            bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ?
                [se.y, nw.x, nw.y, se.x] :
                [nw.x, se.y, se.x, nw.y]).join(','),

            url = L.TileLayer.prototype.getTileUrl.call(this, coords);

        var url = url +
            L.Util.getParamString(this.wmsParams, url, this.options.uppercase) +
            (this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
        
        return url;
    },

    _loadTile: function (coords) {
        var url = this.getTileUrl(coords);
		var key = this._tileCoordsToKey(coords);
		var self = this;
        if (this._cache[key]) { return }
        corslite(url, function(err, response){
            if (err) {
                self.fire('error', {error: err});
                return;
            }
            var data = JSON.parse(response.responseText);
            self._cache[key] = data;
            L.Util.bind(self._handleTileLoad, self)(key, data);
        }, true);
	},

    _handleTileLoad: function(key, data) {
    },

	_onClick: function (e) {
		this.fire('click', this._objectForEvent(e));
	},

	_move: function (e) {
        if (e.latlng == null){ return }

		var on = this._objectForEvent(e);

        if (on._tileCharCode !== this._tileCharCode) {
			if (this._mouseOn) {
				this.fire('mouseout', {
                    latlng: e.latlng,
                    data: this._mouseOn,
                    _tile: this._mouseOnTile,
                    _tileCharCode: this._tileCharCode
                });
				this._updateCursor('');
			}
			if (on.data) {
				this.fire('mouseover', on);
				this._updateCursor('pointer');
			}

			this._mouseOn = on.data;
            this._mouseOnTile = on._tile;
            this._tileCharCode = on._tileCharCode;
		} else if (on.data) {
			this.fire('mousemove', on);
		}
	},

	_objectForEvent: function (e) {
	    if (!e.latlng) return;

        var map = this._map,
		    point = map.project(e.latlng),
		    tileSize = this.options.tileSize,
		    resolution = this.options.resolution,
		    x = Math.floor(point.x / tileSize),
		    y = Math.floor(point.y / tileSize),
		    gridX = Math.floor((point.x - (x * tileSize)) / resolution),
		    gridY = Math.floor((point.y - (y * tileSize)) / resolution),
			max = map.options.crs.scale(map.getZoom()) / tileSize;

        x = (x + max) % max;
        y = (y + max) % max;

        var tileKey = this._tileCoordsToKey({z: map.getZoom(), x: x, y: y});

		var data = this._cache[tileKey];
		if (!data) {
			return {
                latlng: e.latlng,
                data: null,
                _tile: null,
                _tileCharCode: null
            };
		}

        var charCode = data.grid[gridY].charCodeAt(gridX);
		var idx = this._utfDecode(charCode),
		    key = data.keys[idx],
		    result = data.data[key];

		if (!data.data.hasOwnProperty(key)) {
			result = null;
		}

		return {
            latlng: e.latlng,
            data: result,
            id: (result)? result.id: null,
            _tile: tileKey,
            _tileCharCode: tileKey + ':' + charCode
        };
	},

    _dataForCharCode: function (tileKey, charCode) {
        var data = this._cache[tileKey];
        var idx = this._utfDecode(charCode),
		    key = data.keys[idx],
		    result = data.data[key];

		if (!data.data.hasOwnProperty(key)) {
			result = null;
		}
        return result;
    },

	_utfDecode: function (c) {
		if (c >= 93) {
			c--;
		}
		if (c >= 35) {
			c--;
		}
		return c - 32;
	},

    _utfEncode: function (c) {
        var charCode = c + 32;
        if (charCode >= 34) {
            charCode ++;
        }
        if (charCode >= 92) {
            charCode ++;
        }
        return charCode;
    }
});

L.utfGridWMS = function (url, options) {
    return new L.UTFGridWMS(url, options);
};
