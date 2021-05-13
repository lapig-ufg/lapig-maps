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


// override 3.4.0 to be able to restore column state
Ext.override(Ext.grid.ColumnModel, {
    // add properties on columns that are stateful here
    statefulColProps: ['width', 'hidden'],
    setState: function(col, state) {
        // filter properties on those that should actually be stateful
        // (prevents overwriting properties like renderer accidentally)
        var newState = {};
        if (state) {
            Ext.each(this.statefulColProps, function(prop) {
                if (state[prop]) newState[prop] = state[prop];
            });
        };
        // apply to column configuration 
        if (this.columns && this.columns[col]) {
            Ext.apply(this.columns[col], newState);
        } else if (this.config && this.config[col]) {
            Ext.apply(this.config[col], newState);
        }
    }
});

// override 3.4.0 to fix layout bug with composite fields (field width too narrow)
Ext.override(Ext.form.TriggerField, {
    onResize: function(w, h) {
        Ext.form.TriggerField.superclass.onResize.call(this, w, h);
        var tw = this.getTriggerWidth();
        if (Ext.isNumber(w)) {
            this.el.setWidth(w - tw);
        }
        if (this.rendered && !this.readOnly && this.editable && !this.el.getWidth()) this.wrap.setWidth(w);
        else this.wrap.setWidth(this.el.getWidth() + tw);
    }
});

// override 3.4.0 to fix issue where drag to select didn't work in ext scheduler
Ext.override(Ext.dd.DragTracker, {
    onMouseMove: function(e, target) {
        // !Ext.isIE9 check added
        if (this.active && Ext.isIE && !Ext.isIE9 && !e.browserEvent.button) {
            e.preventDefault();
            this.onMouseUp(e);
            return;
        }

        e.preventDefault();
        var xy = e.getXY(),
            s = this.startXY;
        this.lastXY = xy;
        if (!this.active) {
            if (Math.abs(s[0] - xy[0]) > this.tolerance || Math.abs(s[1] - xy[1]) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }
        this.fireEvent('mousemove', this, e);
        this.onDrag(e);
        this.fireEvent('drag', this, e);
    }
});

// override 3.4.0 to fix issue with tooltip text wrapping in IE9 (tooltip 1 pixel too narrow)
// JS: I suspect this issue is caused by subpixel rendering in IE9 causing bad measurements
Ext.override(Ext.Tip, {
    doAutoWidth: function(adjust) {
        // next line added to allow beforeshow to cancel tooltip (see below)
        if (!this.body) return;
        adjust = adjust || 0;
        var bw = this.body.getTextWidth();
        if (this.title) {
            bw = Math.max(bw, this.header.child('span').getTextWidth(this.title));
        }
        bw += this.getFrameWidth() + (this.closable ? 20 : 0) + this.body.getPadding("lr") + adjust;
        // added this line:
        if (Ext.isIE9) bw += 1;
        this.setWidth(bw.constrain(this.minWidth, this.maxWidth));

        if (Ext.isIE7 && !this.repainted) {
            this.el.repaint();
            this.repainted = true;
        }
    }
});

// override 3.4.0 to allow beforeshow to cancel the tooltip
// EP: override 3.4.0 onMouseMove - to forbid tooltip to be positioned outside of the parent container(if this.constrainPosition == true)
Ext.override(Ext.ToolTip, {
    show: function() {
        if (this.anchor) {
            this.showAt([-1000, -1000]);
            this.origConstrainPosition = this.constrainPosition;
            this.constrainPosition = false;
            this.anchor = this.origAnchor;
        }
        this.showAt(this.getTargetXY());

        if (this.anchor) {
            this.anchorEl.show();
            this.syncAnchor();
            this.constrainPosition = this.origConstrainPosition;
            // added "if (this.anchorEl)"
        } else if (this.anchorEl) {
            this.anchorEl.hide();
        }
    },
    showAt: function(xy) {
        this.lastActive = new Date();
        this.clearTimers();
        Ext.ToolTip.superclass.showAt.call(this, xy);
        if (this.dismissDelay && this.autoHide !== false) {
            this.dismissTimer = this.hide.defer(this.dismissDelay, this);
        }
        if (this.anchor && !this.anchorEl.isVisible()) {
            this.syncAnchor();
            this.anchorEl.show();
            // added "if (this.anchorEl)"
        } else if (this.anchorEl) {
            this.anchorEl.hide();
        }
    },
    onMouseMove: function(e) {
        var t = this.delegate ? e.getTarget(this.delegate) : this.triggerElement = true;
        if (t) {
            this.targetXY = e.getXY();
            if (t === this.triggerElement) {
                if (!this.hidden && this.trackMouse) {
                    var xy = this.getTargetXY();
                    //added adjust positioning
                    if (this.constrainPosition) {
                        xy = this.el.adjustForConstraints(xy);
                    }
                    this.setPagePosition(xy);
                }
            } else {
                this.hide();
                this.lastActive = new Date(0);
                this.onTargetOver(e);
            }
        } else if (!this.closable && this.isVisible()) {
            this.hide();
        }
    }
});

// override 3.4.0 to fix issue where enableDragDrop + checkbox selection has issues
// clicking on a selected checkbox does not unselect it + impossible to select multiple
// rows via checkbox
Ext.override(Ext.grid.GridDragZone, {
    getDragData: function(e) {
        var t = Ext.lib.Event.getTarget(e);
        var rowIndex = this.view.findRowIndex(t);
        if (rowIndex !== false) {
            var sm = this.grid.selModel;

            if (sm instanceof(Ext.grid.CheckboxSelectionModel)) {
                sm.onMouseDown(e, t);
            }

            if (t.className != 'x-grid3-row-checker' && (!sm.isSelected(rowIndex) || e.hasModifier())) {
                sm.handleMouseDown(this.grid, rowIndex, e);
            }
            return { grid: this.grid, ddel: this.ddel, rowIndex: rowIndex, selections: sm.getSelections() };
        }
        return false;
    }
});

// override 3.4.0 to fix false security warning in IE on component destroy
Ext.apply(Ext, {
    removeNode: Ext.isIE && !Ext.isIE9 ? function() {
        return function(n) {
            if (n && n.tagName != 'BODY') {
                (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n, true): Ext.EventManager.removeAll(n);
                if (n.parentNode && n.tagName == 'TD') {
                    if (Ext.isIE7) {
                        n.parentNode.removeChild(n);
                    } else {
                        n.parentNode.deleteCell(n);
                    }
                } else if (n.parentNode && n.tagName == 'TR') {
                    n.parentNode.deleteRow(n);
                } else {
                    n.outerHTML = ' ';
                }
                delete Ext.elCache[n.id];
            }
        };
    }() : function(n) {
        if (n && n.parentNode && n.tagName != 'BODY') {
            (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n, true): Ext.EventManager.removeAll(n);
            n.parentNode.removeChild(n);
            delete Ext.elCache[n.id];
        }
    }
});

// override 3.4.0 to ensure that the grid stops editing if the view is refreshed
// actual bug: removing grid lines with active lookup editor didn't hide editor
(function() {
    var originalProcessRows = Ext.grid.GridView.prototype.processRows;
    Ext.override(Ext.grid.GridView, {
        processRows: function() {
            if (this.grid) this.grid.stopEditing(true);
            originalProcessRows.apply(this, arguments);
        }
    });
}());

// override 3.4.0 to fix issue with chart labels losing their labelRenderer after hide/show
Ext.override(Ext.chart.CartesianChart, {
    createAxis: function(axis, value) {
        var o = Ext.apply({}, value),
            ref,
            old;

        if (this[axis]) {
            old = this[axis].labelFunction;
            this.removeFnProxy(old);
            this.labelFn.remove(old);
        }
        if (o.labelRenderer) {
            ref = this.getFunctionRef(o.labelRenderer);
            o.labelFunction = this.createFnProxy(function(v) {
                return ref.fn.call(ref.scope, v);
            });
            // delete o.labelRenderer; // <-- commented out this line
            this.labelFn.push(o.labelFunction);
        }
        if (axis.indexOf('xAxis') > -1 && o.position == 'left') {
            o.position = 'bottom';
        }
        return o;
    }
});

// override 3.4.0 to allow tabbing between editable grid cells to work correctly
Ext.override(Ext.grid.RowSelectionModel, {
    acceptsNav: function(row, col, cm) {
        if (!cm.isHidden(col) && cm.isCellEditable(col, row)) {
            // check that there is actually an editor
            if (cm.getCellEditor) return !!cm.getCellEditor(col, row);
            return true;
        }
        return false;
    }
});

// override ExtJS 3.4.0 to make sure that in IE the HTMLEditor
// persists the cursor position across blur/focus events
Ext.override(Ext.form.HtmlEditor, {
    onEditorEvent: function() {
        if (Ext.isIE) {
            this.currentRange = this.getDoc().selection.createRange();
        }
        this.updateToolbar();
    },
    insertAtCursor: function(text) {
        if (!this.activated) return;
        if (Ext.isIE) {
            this.win.focus();
            var r = this.currentRange || this.getDoc().selection.createRange();
            if (r) {
                r.collapse(true);
                r.pasteHTML(text);
                this.syncValue();
                this.deferFocus();
                r.moveEnd('character', 0);
                r.moveStart('character', 0);
                r.select();
            }
        } else if (Ext.isGecko || Ext.isOpera || Ext.isChrome) {
            this.win.focus();
            this.execCmd('InsertHTML', text);
            this.deferFocus();
        } else if (Ext.isWebKit) {
            this.execCmd('InsertText', text);
            this.deferFocus();
        }
    },
    // JB: Cross browser function to get the selected text in the HtmlEditor body.
    // TODO: find solution so that the normal selected text in the HtmlEditor in IE gets replaced by the final link.
    // SOL1 and current implement: Remove text on first getSelectedText call if IE and then if cancel for link insert
    //                             it back else insert link.
    // SOL2: remember the start position and the length of the text+html tags. When clip, remove first then insert.
    getSelectedText: function(clip, extract) {
        var doc = this.getDoc(),
            selDocFrag;
        var txt = '',
            hasHTML = false,
            selNodes = [],
            ret, html = '';
        if (this.win.getSelection || doc.getSelection) {
            // FF, Chrome, Safari
            var sel = this.win.getSelection();
            if (!sel) {
                sel = doc.getSelection();
            }
            if (clip) {
                // TODO: need patch for IE9. In IE9 selection gets lost when LinkWindow is focused.
                // TODO: if we do not fix this then the selected text will not be replaced.
                selDocFrag = sel.getRangeAt(0).extractContents();
            } else {
                if (Ext.isIE9 && extract) {
                    selDocFrag = this.win.getSelection().getRangeAt(0).extractContents();
                } else {
                    selDocFrag = this.win.getSelection().getRangeAt(0).cloneContents();
                }
            }
            Ext.each(selDocFrag.childNodes, function(n) {
                if (n.nodeType !== 3) {
                    hasHTML = true;
                }
            });
            if (hasHTML) {
                var div = document.createElement('div');
                div.appendChild(selDocFrag);
                html = div.innerHTML;
                txt = this.win.getSelection() + '';
            } else {
                html = txt = selDocFrag.textContent;
            }
            ret = {
                textContent: txt,
                hasHTML: hasHTML,
                html: html
            };
        } else if (doc.selection) {
            // IE
            this.win.focus();
            txt = doc.selection.createRange();
            if (txt.text !== txt.htmlText) {
                hasHTML = true;
            }
            ret = {
                textContent: txt.text,
                hasHTML: hasHTML,
                html: txt.htmlText
            };
        } else {
            return {
                textContent: ''
            };
        }
        return ret;
    }
});

// override ExtJS 3.4.0 to avoid "string is undefined" or "object is undefined" or
// "cannot execute code from a freed script" errors in IE9 when using <iframe> tags
// in the html property.
// The real cause is explained here:
// http://stackoverflow.com/questions/5514973/javascript-code-in-iframes-in-ie9-not-working
if (Ext.isIE9) {
    Ext.Component.prototype.originalRender = Ext.Component.prototype.render;
    Ext.override(Ext.Component, {
        render: function(container, position) {
            var hasIframe =
                (this.html && Ext.isString(this.html) &&
                    (this.html.toLowerCase().indexOf('iframe') >= 0));
            if (hasIframe) {
                var originalHtml = this.html;
                delete this.html;
            }
            var result = Ext.Component.prototype.originalRender.apply(this, arguments);
            if (hasIframe) {
                var contentTarget = this.getContentTarget();
                contentTarget.update.defer(100, contentTarget, [Ext.DomHelper.markup(originalHtml)]);
            }
            return result;
        }
    });
};

// override ExtJS 3.4.0 to encode HTML according to ESAPI security guidelines:
// https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
Ext.apply(Ext.util.Format, {
    htmlEncode: function(value) {
        return !value ? value :
            String(value).replace(
                /&/g, "&amp;").replace(
                />/g, "&gt;").replace(
                /</g, "&lt;").replace(
                /"/g, "&quot;").replace(
                /'/g, "&#x27;").replace(
                /\//g, "&#x2F;");
    }
});

//added styleSheet to fix the incorrectly rendered grid columns in Chrome 19+ and other recent webkit browsers
//
//Box-sizing was changed beginning with Chrome v19.  For background information, see:
//   http://code.google.com/p/chromium/issues/detail?id=124816
//   https://bugs.webkit.org/show_bug.cgi?id=78412
//   https://bugs.webkit.org/show_bug.cgi?id=87536
//   http://www.sencha.com/forum/showthread.php?198124-Grids-are-rendered-differently-in-upcoming-versions-of-Google-Chrome&p=891425&viewfull=1#post891425
if (!Ext.isDefined(Ext.webKitVersion)) {
    Ext.webKitVersion = Ext.isWebKit ? parseFloat(/AppleWebKit\/([\d.]+)/.exec(navigator.userAgent)[1], 10) : NaN;
};
// chrome 19+ or safari 6+ (or any other recent webkit browser)
if (Ext.isWebKit && Ext.webKitVersion >= 535.2) {
    Ext.onReady(function() {
        Ext.util.CSS.createStyleSheet('.ext-chrome .x-grid3-cell, .ext-chrome .x-grid3-gcell{box-sizing: border-box !important;}', 'chrome-fixes-box-sizing');
    });
};

// override 3.4.0 to remove memory leaks
// make sure Ext.Component does not keep references to external components around
// (this.plugins, this.initialConfig)
(function() {
    var originalDestroy = Ext.Component.prototype.destroy;
    Ext.override(Ext.Component, {
        destroy: function() {
            if (!this.isDestroyed) {
                originalDestroy.apply(this, arguments);
                this.plugins = this.initialConfig = null;
            };
        }
    });
})();

// override 3.4.0 to remove memory leaks
// make sure Ext.grid.GridView does not keep references to drag-and-drop components
// this.columnDrag, this.columnDrop, this.ds, ...
(function() {
    var originalDestroy = Ext.grid.GridView.prototype.destroy;
    Ext.override(Ext.grid.GridView, {
        destroy: function() {
            originalDestroy.apply(this, arguments);
            this.columnDrag = this.columnDrop = this.splitZone = this.hmenu = this.ds = null;
        }
    })
})();

// override 3.4.0 to remove memory leaks
// make sure Ext.PagingToolbar does not keep references to objects around
// this.dsLoaded
(function() {
    var originalDestroy = Ext.PagingToolbar.prototype.destroy;
    Ext.override(Ext.PagingToolbar, {
        destroy: function() {
            originalDestroy.apply(this, arguments);
            this.dsLoaded = null;
        }
    });
})();

// override 3.4.0 to avoid leaking memory in container layouts
(function() {
    var originalDestroy = Ext.layout.ContainerLayout.prototype.destroy;
    Ext.override(Ext.layout.ContainerLayout, {
        destroy: function() {
            originalDestroy.apply(this, arguments);
            this.resizeTask = null;
        }
    })
})();

// override 3.4.0 to make the "readOnly" attribute work correctly on a CheckBox
// (property had no effect on clickability
(function() {
    var originalOnClick = Ext.form.Checkbox.prototype.onClick;
    Ext.override(Ext.form.Checkbox, {
        onClick: function() {
            if (!this.readOnly) {
                return originalOnClick.apply(this, arguments);
            } else {
                this.el.dom.checked = this.checked;
            };
            return this;
        }
    })
})();

// override 3.4.0 to make AnchorLayout not render scrollbars for anchor: 100% when
// zooming in firefox (ctrl-+)
(function() {
    var originalParseAnchor = Ext.layout.AnchorLayout.prototype.parseAnchor;
    Ext.override(Ext.layout.AnchorLayout, {
        parseAnchor: function(a, start, cstart) {
            var anchorFn = originalParseAnchor.apply(this, arguments);
            if (anchorFn && Ext.isGecko && (a.indexOf('100%') != -1)) {
                var isZoomed = window['matchMedia'] && window.matchMedia('(max--moz-device-pixel-ratio:0.99), (min--moz-device-pixel-ratio:1.01)').matches;
                if (isZoomed) {
                    return function(v) {
                        var result = anchorFn.call(this, v);
                        result -= 2;
                        return result;
                    };
                };
            };
            return anchorFn;
        }
    });
})();

lapig.tools.RasterSeries = Ext.extend(gxp.plugins.Tool, {

    ptype: "lapig_rasterseries",

    GOOGLE_PROJ: new OpenLayers.Projection("EPSG:900913"),

    WGS84_PROJ: new OpenLayers.Projection("EPSG:4326"),

    data: null,

    vectors: null,

    tabProperties: {
        series: 0,
        trend: 1,
        name: [
            'series',
            'trend'
        ]
    },

    bfastApplicableLayers: [
        'TRMM_PRECIPITATION',
        'MOD16_NOR_EVAPOTRANSPIRATION',
        'MOD16_POT_EVAPOTRANSPIRATION',
        'MOD16_EVAPOTRANSPIRATION',
        'MOD13Q1_NDVI',
        'MOD13Q1_EVI',
        'MOD13Q1_EVI2',
        'MOD13Q1_B01',
        'MOD13Q1_B02',
        'MOD13Q1_B07'
    ],

    constructor: function(config) {
        lapig.tools.RasterSeries.superclass.constructor.apply(this, arguments);

        this.projectsParam = config.project.join(',');
        this.timeSeriesTreeUrl = 'time-series/tree?projects=' + this.projectsParam + '&lang=' + i18n.lang;

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
                this.getCenterCmp()
            ]
        };
    },

    groupChartData: function(startValue, endValue, chartData, groupType, groupOperation) {
        var instance = this;

        var groupType = (groupType) ? groupType.toUpperCase() : '';

        var groupedOriginalData = {}
        var groupedInterpolationData = {}

        var chart = Ext.getCmp('lapig-coordinates-chart-' + instance.getSeriesActiveTab().name);
        var axisPercent = 0.1

        var datePos;
        var defaultDatePattern;

        if (groupType == 'YEAR') {
            datePos = 0;
            defaultDatePattern = "{}/01/01";
            chart.setXAxis(new Ext.chart.CategoryAxis({}));
        } else if (groupType == 'NPP') {
            datePos = 0;
            defaultDatePattern = "{}/01/01";
            chart.setXAxis(new Ext.chart.CategoryAxis({}));
        } else if (groupType == 'MONTH') {
            datePos = 1;
            defaultDatePattern = "2000/{}/01";
            chart.setXAxis(new Ext.chart.CategoryAxis({}));
        } else if (groupType == 'DAY') {
            datePos = 2;
            defaultDatePattern = "2000/01/{}";
            chart.setXAxis(new Ext.chart.CategoryAxis({}));
        } else {

            var maximum = (Number(endValue) + (Number(endValue) * axisPercent)).toFixed(2);
            var minimum = (Number(startValue) - (Number(startValue) * axisPercent)).toFixed(2);

            chart.setYAxis(new Ext.chart.NumericAxis({ maximum: maximum, minimum: minimum }));

            console.log("chart do ELSE - ", chart)

            chart.setXAxis(new Ext.chart.TimeAxis({
                labelRenderer: function(date) {
                    return date.format("m.Y");
                }
            }));

            return chartData;
        }

        if (groupType == 'NPP') {
            chartData.forEach(function(cData) {
                var key = cData.dateStr.split('-')[datePos];
                var month = cData.dateStr.split('-')[1];

                if (Number(month) >= 10 || Number(month) <= 4) {
                    if (groupedOriginalData[key] == undefined)
                        groupedOriginalData[key] = [];
                    if (cData.original != null)
                        groupedOriginalData[key].push(cData.original)

                    if (groupedInterpolationData[key] == undefined)
                        groupedInterpolationData[key] = [];
                    if (cData.interpolation != null)
                        groupedInterpolationData[key].push(cData.interpolation)
                }


            })
        } else {
            chartData.forEach(function(cData) {
                var key = cData.dateStr.split('-')[datePos];

                if (groupedOriginalData[key] == undefined)
                    groupedOriginalData[key] = [];
                if (cData.original != null)
                    groupedOriginalData[key].push(cData.original)

                if (groupedInterpolationData[key] == undefined)
                    groupedInterpolationData[key] = [];
                if (cData.interpolation != null)
                    groupedInterpolationData[key].push(cData.interpolation)

            })
        }

        var groupedData = [];

        for (var key in groupedOriginalData) {
            groupedData.push({
                original: jStat[groupOperation](groupedOriginalData[key]),
                interpolation: jStat[groupOperation](groupedInterpolationData[key]),
                date: key
            });
        }

        groupedData = _.sortBy(groupedData, function(gData) { return gData.date; })

        maximum = _.max(groupedData, function(gData) { return gData.original; }).original
        minimum = _.min(groupedData, function(gData) { return gData.original; }).original

        maximum = (Number(maximum) + (Number(maximum) * axisPercent)).toFixed(2);
        minimum = (Number(minimum) - (Number(minimum) * axisPercent)).toFixed(2);

        if (groupType) {
            chart.setYAxis(new Ext.chart.NumericAxis({ maximum: maximum, minimum: minimum }));
        }

        return groupedData;
    },

    getChartSeries: function(chartDataLength) {
        var instance = this;

        var activeTab = instance.getSeriesActiveTab();

        var markerSize;
        if (chartDataLength > 300)
            markerSize = 4;
        else if (chartDataLength > 100)
            markerSize = 6;
        else if (chartDataLength > 50)
            markerSize = 8;
        else if (chartDataLength > 0)
            markerSize = 10;

        var style;

        if (activeTab.index == instance.tabProperties.series) {
            style = [{
                color: 0xfc4239,
                size: markerSize,
                lineSize: 2
            }, {
                color: 0x5057a6,
                size: 0,
                lineSize: 2
            }];
        } else {
            style = [{
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
            }];
        }

        // http://yui.github.io/yui2/docs/yui_2.9.0_full/charts/index.html#series
        return style;
    },

    getSeriesActiveTab: function() {
        var instance = this;
        var tab = Ext.getCmp('lapig-raster-series-tab-pnl').getActiveTab();

        if (tab.getId().indexOf("trend") != -1) {
            return {
                name: instance.tabProperties.name[instance.tabProperties.trend],
                index: instance.tabProperties.trend
            };
        } else {
            return {
                name: instance.tabProperties.name[instance.tabProperties.series],
                index: instance.tabProperties.series
            };
        }
    },

    populateChart: function(startYear, endYear, startValue, endValue, interpolationPosition, groupType, groupOperation) {
        var instance = this;

        var activeTab = instance.getSeriesActiveTab();
        var chart = Ext.getCmp('lapig-coordinates-chart-' + activeTab.name);

        var originalPosition = -1;
        var trendPosition = -1;

        console.log("instance - ", instance)

        for (var i in instance.chartData[activeTab.index].series) {
            var serie = instance.chartData[activeTab.index].series[i];
            if (serie.id == 'original') {
                originalPosition = serie.position;
            } else if (serie.type == 'trend') {
                trendPosition = serie.position;
            }
            // === triple equal sign here is VERY important;
            // === sinal triplo de igual aqui é MUITO importante;
            else if (serie.type == 'filter') {
                if (interpolationPosition === null || interpolationPosition == serie.id) {
                    interpolationPosition = serie.position
                }
            }
        }

        if (typeof interpolationPosition == 'string' || interpolationPosition == originalPosition) {
            interpolationPosition = undefined;
        }

        if (startValue == undefined || startValue == null) {
            startValue = instance.seriesProperties.startValue
        }
        if (endValue == undefined || endValue == null) {
            endValue = instance.seriesProperties.endValue
        }

        var chartData = [];
        instance.chartData[activeTab.index].values.forEach(function(values) {

            var dateStr = values[0];
            var dtArray = values[0].split('-');
            var year = dtArray[0];
            var date = new Date(dtArray[0] + "/" + dtArray[1] + "/" + dtArray[2]).getTime();

            if (year >= startYear && year <= endYear) {

                if (activeTab.index == instance.tabProperties.trend) {
                    var record = { date: date, original: null, interpolation: null, trend: null, dateStr: dateStr };

                    record.original = (originalPosition != -1) ? values[originalPosition] : null;
                    record.trend = (trendPosition != -1) ? values[trendPosition] : null;
                    record.interpolation = (interpolationPosition != undefined) ? values[Math.abs(interpolationPosition)] : null;
                } else {
                    var record = { date: date, original: null, interpolation: null, dateStr: dateStr };

                    var value = (originalPosition != -1) ? values[originalPosition] : "no_original";
                    value = (value >= startValue && value <= endValue) ? value : null;
                    record.original = (interpolationPosition >= 0 || interpolationPosition === undefined) ? value : null;
                    record.interpolation = (interpolationPosition != undefined && value != null) ? values[Math.abs(interpolationPosition)] : null;
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
            layout: 'fit',
            border: false,
            width: 740,
            height: 440,
            closeAction: 'hide',
            plain: true,
            title: i18n.LAPIGRASTERSERIES_TITLE_TEMPORALDATA,
            items: [{
                region: 'center',
                closable: true,
                height: 350,
                plain: true,
                layout: 'border',
                border: false,
                items: [{
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
                        width: 300,
                        region: 'west',
                        root: new Ext.tree.AsyncTreeNode({
                            text: 'Extensions',
                            draggable: false,
                            id: 'ux'
                        }),
                        dataUrl: this.timeSeriesTreeUrl,
                        requestMethod: 'GET',
                        columns: [{
                            header: 'Assuntos',
                            dataIndex: 'task',
                            width: 200
                        }],
                        listeners: {
                            click: function(node, e) {
                                if (node.leaf) {
                                    var id = node.attributes.id;
                                    var url = 'time-series/' + id;
                                    var frmInfo = Ext.getCmp('lapig_rasterseries::frm-info');
                                    lapigAnalytics.clickTool('Time Series', 'view-Layer', id);
                                    frmInfo.load({
                                        url: url,
                                        method: 'GET',
                                        waitMsg: 'Loading'
                                    });
                                }
                            }
                        }
                    },
                    {
                        title: i18n.LAPIGRASTERSERIES_TTLAREA_DETAILS,
                        border: false,
                        frame: true,
                        region: 'center',
                        layout: 'form',
                        xtype: 'form',
                        split: true,
                        width: 180,
                        labelAlign: 'top',
                        padding: "10px 10px 0px 10px",
                        id: 'lapig_rasterseries::frm-info',
                        waitMsgTarget: 'lapig_rasterseries::frm-info',
                        disabled: true,
                        baseParams: {
                            'projects': this.projectsParam,
                            'lang': i18n.lang
                        },
                        reader: new Ext.data.JsonReader({
                            idProperty: '_id',
                            root: '',
                            fields: [
                                { name: 'name', mapping: 'name' },
                                { name: 'description', mapping: 'description' },
                                { name: 'date', mapping: 'date' },
                                { name: 'pixelMeasure', mapping: 'pixelMeasure' },
                                { name: 'satelite', mapping: 'satelite' },
                                { name: 'scale', mapping: 'scale' },
                                { name: 'source', mapping: 'source' }
                            ]
                        }),
                        items: [{
                                xtype: 'textfield',
                                hideLabel: false,
                                anchor: '100%',
                                fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_NAME,
                                name: "name",
                                width: 350,
                                height: 20,
                                readOnly: true
                            },
                            {
                                xtype: 'textarea',
                                hideLabel: false,
                                anchor: '100%',
                                fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_DESCRIPTION,
                                name: "description",
                                padding: "0px 0px 0px 0px",
                                width: 350,
                                height: 110,
                                readOnly: true,
                                autoScroll: true
                            },
                            {
                                layout: 'column',
                                xtype: 'panel',
                                hideLabel: true,
                                border: false,
                                readOnly: true,
                                items: [{
                                        columnWidth: .5,
                                        layout: 'form',
                                        labelAlign: 'top',
                                        border: false,
                                        items: [{
                                                xtype: 'textfield',
                                                fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_SATELLITE,
                                                name: "satelite",
                                                height: 20,
                                                readOnly: true,
                                                name: 'satelite',
                                                anchor: '100%'
                                            },
                                            {
                                                xtype: 'panel',
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
                                        columnWidth: .5,
                                        layout: 'form',
                                        labelAlign: 'top',
                                        border: false,
                                        padding: "0px 0px 0px 10px",
                                        readOnly: true,
                                        items: [{
                                                xtype: 'textfield',
                                                fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_PERIOD,
                                                name: 'date',
                                                height: 20,
                                                width: 165,
                                                readOnly: true,
                                                anchor: '100%'
                                            },
                                            {
                                                xtype: 'textfield',
                                                id: 'lapig_rasterserires::wdw-info-txt-scale',
                                                fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_SCALE,
                                                name: 'scale',
                                                height: 20,
                                                width: 165,
                                                readOnly: true,
                                                anchor: '100%'
                                            },
                                            {
                                                xtype: 'textfield',
                                                fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBL_UNIMEASURE,
                                                name: 'pixelMeasure',
                                                height: 20,
                                                width: 165,
                                                readOnly: true,
                                                anchor: '100%'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        buttons: [{
                            text: i18n.LAPIGRASTERSERIES_BTNTXT_SELECT,
                            listeners: {
                                click: function(evt) {
                                    var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                                    var lapigCoordinatesTool = Ext.getCmp('lapig-coordinates-tool');
                                    var wndInfoButtons = instance.getWdwInfoButtons();
                                    var selectView = Ext.getCmp('lapig_rasterseries::frm-info');
                                    lapigAnalytics.clickTool('Time Series', 'select-Layer', selectView.reader.jsonData._id);

                                    wdwInfo.hide(this);
                                    lapigCoordinatesTool.handler(null, null, wndInfoButtons);
                                }
                            }
                        }],
                        listeners: {
                            actioncomplete: function(basicFormLayer, actionLayer) {
                                var formTimeSeries = Ext.getCmp('lapig_rasterseries::frm-info');
                                var fieldSource = Ext.getCmp('lapig_rasterseries::frm-info-source');

                                var urlSource = 'theme/app/img/sources/' + actionLayer.result.data.source + '.png';
                                fieldSource.update('<img src = ' + urlSource + '>');
                                formTimeSeries.enable();

                            }
                        }
                    }
                ]
            }]
        });
    },

    getCenterCmp: function() {
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

            // console.log("------------- filter:")
            // console.log("start year - ", startYearCmb.getValue())
            // console.log("end year - ", endYearCmb.getValue())
            // console.log("start value - ", startValueCmb.getValue())
            // console.log("end value - ", endValueCmb.getValue())
            // console.log("interpolation - ", interpolationCmb.getValue())
            // console.log("groupSplitted - ", groupValueSplited)
            // console.log("groupType - ", groupType)
            // console.log("end year - ", groupOperation)

            instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(),
                startValueCmb.getValue(), endValueCmb.getValue(), interpolationCmb.getValue(), groupType, groupOperation)
        }

        var repopulateChart = function() {

            var activeTab = instance.getSeriesActiveTab();

            var startYearCmb = Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-start-year');
            var endYearCmb = Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-end-year');

            var timeSeriesName = Ext.getCmp('lapig_rasterseries::frm-info').getForm().reader.jsonData.name;
            Ext.getCmp('southpanel').setTitle(i18n.LAPIGVIEWER_TTL_TOOL_TIME_SERIES + ' - ' + timeSeriesName);

            if (instance.chartData[activeTab.index] == undefined) {
                if (instance.seriesProperties != undefined) {
                    instance.requestChartData(instance.seriesProperties.timeseriesId,
                        instance.seriesProperties.longitude, instance.seriesProperties.latitude, instance.seriesProperties.radius);
                } else {
                    instance.restartChart();
                }
            } else {

                if (activeTab.index == instance.tabProperties.series) {
                    var startValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value').getValue();
                    var endValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value').getValue();
                    // Ext.getCmp('lapig-raster-series-tab-series-cmb-interpolation').setValue("Nenhum");

                    instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(),
                        startValue, endValue);
                } else {
                    instance.populateChart(startYearCmb.getValue(), endYearCmb.getValue(), null, null, null)
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
            items: [{
                xtype: "tabpanel",
                id: "lapig-raster-series-tab-pnl",
                activeItem: "lapig-raster-series-tab-series",
                border: false,
                region: "center",
                listeners: {
                    'tabchange': function(evt, tab) {
                        if (tab.id == "lapig-raster-series-tab-series") {
                            lapigAnalytics.clickTool('Tools', 'Time Series', '')
                        } else {
                            if (tab.id == "lapig-raster-series-tab-trend") {
                                lapigAnalytics.clickTool('Tools', 'Trend', '')
                            }
                        }
                    }
                },
                items: [{
                        title: i18n.LAPIGRASTERSERIES_TITLE_TIMESERIES,
                        id: "lapig-raster-series-tab-series",
                        layout: "border",
                        tbar: [{
                                text: i18n.LAPIGRASTERSERIES_TITLE_TEMPORALDATA,
                                iconCls: 'lapig-icon-add-2',
                                xtype: "button",
                                listeners: {
                                    click: function(evt) {
                                        lapigAnalytics.clickTool('Time Series', 'click-temporalData', '')
                                        var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                                        wdwInfo.show(this)
                                    }
                                }
                            },
                            '-',
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_PERIOD,
                            {
                                xtype: 'combo',
                                id: "lapig-raster-series-tab-series-cmb-start-year",
                                fieldLabel: i18n.LAPIGRASTERSERIES_FIELDLBLCB_PERIOD,
                                border: false,
                                displayField: 'year',
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
                                        { name: 'year' }
                                    ]
                                },
                                listeners: {
                                    select: function() {
                                        filterChartData();
                                        var TDcmbStartYear = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-year').getValue();
                                        lapigAnalytics.clickTool('Time Series', 'click-filterDateStart', TDcmbStartYear)
                                    }
                                }
                            },
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_A, {
                                xtype: 'combo',
                                id: "lapig-raster-series-tab-series-cmb-end-year",
                                maxLength: 150,
                                border: false,
                                typeAhead: true,
                                editable: false,
                                disabled: true,
                                triggerAction: 'all',
                                displayField: 'year',
                                valueField: 'year',
                                mode: 'local',
                                width: 70,
                                store: {
                                    xtype: 'arraystore',
                                    fields: [
                                        { name: 'year' }
                                    ]
                                },
                                listeners: {
                                    select: function() {
                                        filterChartData();
                                        var TDcmbEndYear = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-year').getValue();
                                        lapigAnalytics.clickTool('Time Series', 'click-filterDateEnd', TDcmbEndYear)
                                    }
                                }
                            },
                            '-',
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_VALUES,
                            {
                                xtype: 'combo',
                                id: "lapig-raster-series-tab-series-cmb-start-value",
                                border: false,
                                displayField: 'value',
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
                                        { name: 'value' }
                                    ]
                                },
                                listeners: {
                                    select: function() {
                                        filterChartData();
                                        var TDfilterStartValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value').getValue();
                                        lapigAnalytics.clickTool('Time Series', 'click-filterValueStart', TDfilterStartValue)
                                    }
                                }
                            },
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_A, {
                                xtype: 'combo',
                                id: "lapig-raster-series-tab-series-cmb-end-value",
                                maxLength: 150,
                                border: false,
                                typeAhead: true,
                                editable: false,
                                disabled: true,
                                triggerAction: 'all',
                                displayField: 'value',
                                valueField: 'value',
                                mode: 'local',
                                width: 70,
                                store: {
                                    xtype: 'arraystore',
                                    fields: [
                                        { name: 'value' }
                                    ]
                                },
                                listeners: {
                                    select: function() {
                                        filterChartData();
                                        var TDfilterEndValue = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value').getValue();
                                        lapigAnalytics.clickTool('Time Series', 'click-filterValueEnd', TDfilterEndValue)
                                    }
                                }
                            },
                            '-',
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_FILTER, {
                                xtype: 'combo',
                                id: 'lapig-raster-series-tab-series-cmb-interpolation',
                                displayField: 'label',
                                valueField: 'position',
                                mode: 'local',
                                typeAhead: true,
                                editable: false,
                                disabled: true,
                                width: 200,
                                triggerAction: 'all',
                                store: {
                                    xtype: 'jsonstore',
                                    fields: ['label', 'position', 'id']
                                },
                                listeners: {
                                    select: function() {
                                        filterChartData();
                                        var TDfilterSoften = Ext.getCmp('lapig-raster-series-tab-series-cmb-interpolation').getValue();
                                        lapigAnalytics.clickTool('Time Series', 'click-filterSoften', TDfilterSoften)
                                    }
                                }
                            },
                            '-',
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_GROUP,
                            {
                                xtype: 'combo',
                                id: 'lapig-raster-series-tab-series-cmb-group-data',
                                displayField: 'label',
                                valueField: 'id',
                                mode: 'local',
                                typeAhead: true,
                                editable: false,
                                disabled: true,
                                width: 120,
                                triggerAction: 'all',
                                store: new Ext.data.ArrayStore({
                                    fields: [
                                        { name: 'id' },
                                        { name: 'label' }
                                    ],
                                    data: [
                                        ['NONE_NONE', i18n.LAPIGRASTERSERIES_GROUPCB_NONE],
                                        ['YEAR_mean', i18n.LAPIGRASTERSERIES_GROUPCB_YEARAVERAGE],
                                        ['YEAR_sum', i18n.LAPIGRASTERSERIES_GROUPCB_YEARSUM],
                                        ['NPP_mean', i18n.LAPIGRASTERSERIES_GROUPCB_OCTAPRAVER],
                                        ['NPP_sum', i18n.LAPIGRASTERSERIES_GROUPCB_OCTAPRSUM],
                                        ['MONTH_mean', i18n.LAPIGRASTERSERIES_GROUPCB_MONTHAVER],
                                        ['MONTH_sum', i18n.LAPIGRASTERSERIES_GROUPCB_MONTHSUM],
                                        ['DAY_mean', i18n.LAPIGRASTERSERIES_GROUPCB_DAYAVER],
                                        ['DAY_sum', i18n.LAPIGRASTERSERIES_GROUPCB_DAYSUM]
                                    ]
                                }),
                                listeners: {
                                    select: function() {
                                        filterChartData();
                                        var TDclassifyBy = Ext.getCmp('lapig-raster-series-tab-series-cmb-group-data').getValue();
                                        lapigAnalytics.clickTool('Time Series', 'click-filterClassifyBy', TDclassifyBy)
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
                                            '/csv?longitude=' + instance.seriesProperties.longitude +
                                            "&latitude=" + instance.seriesProperties.latitude + "&mode=series&radius=" +
                                            instance.seriesProperties.radius;
                                        lapigAnalytics.clickTool('Time Series', 'csv-Downloads', instance.seriesProperties.timeseriesId);
                                        window.open(csvUrl)
                                    }
                                }
                            }
                        ],
                        items: [{
                            region: 'center',
                            border: false,
                            xtype: 'panel',
                            disabled: true,
                            id: 'lapig-raster-series-tab-series-chart-pnl',
                            items: [{
                                xtype: 'linechart',
                                id: 'lapig-coordinates-chart-series',
                                store: new Ext.data.JsonStore({
                                    fields: ['date', 'original', 'interpolation']
                                }),
                                xField: 'date',
                                yAxis: new Ext.chart.NumericAxis(),
                                xAxis: new Ext.chart.TimeAxis({
                                    labelRenderer: function(date) {
                                        return date.format("m.Y");;
                                    }
                                }),
                                tipRenderer: function(chart, record, index, series) {

                                    var numberFormat = '0.000'
                                    var serie = series.data[index];

                                    var date = serie.date;
                                    if (typeof date === 'number')
                                        date = new Date(date).format("d/m/Y");

                                    var originalValue = Ext.util.Format.number(serie.original, numberFormat);

                                    if (serie.interpolation == null) {
                                        return date + ": " + originalValue
                                    } else {
                                        return date + "\n" +
                                            i18n.LAPIGRASTERSERIES_TXT_ORIGINAL + originalValue + "\n" +
                                            i18n.LAPIGRASTERSERIES_TXT_FILTRATED + Ext.util.Format.number(serie.interpolation, numberFormat);
                                    }
                                },
                                chartStyle: {
                                    animationEnabled: true,
                                    xAxis: {
                                        color: 0xaaaaaa,
                                        labelSpacing: 5,
                                        labelDistance: 5,
                                        majorTicks: { color: 0xaaaaaa, length: 10 },
                                        minorTicks: { color: 0xdddddd, length: 5 },
                                        majorGridLines: { size: 1, color: 0xaaaaaa },
                                        minorGridLines: { size: 0.5, color: 0xdddddd }
                                    },
                                    yAxis: {
                                        color: 0xaaaaaa,
                                        labelDistance: 6,
                                        majorTicks: { color: 0xaaaaaa, length: 10 },
                                        minorTicks: { color: 0xdddddd, length: 5 },
                                        majorGridLines: { size: 1, color: 0xaaaaaa },
                                        minorGridLines: { size: 0.5, color: 0xdddddd }
                                    }
                                },
                                series: [{
                                    type: 'line',
                                    yField: 'original',
                                    displayField: 'original',
                                    style: {
                                        color: 0xfc4239,
                                        size: 4,
                                        lineSize: 2
                                    }
                                }, {
                                    type: 'line',
                                    yField: 'interpolation',
                                    displayField: 'interpolation',
                                    style: {
                                        color: 0x5057a6,
                                        size: 0,
                                        lineSize: 2
                                    }
                                }],
                                listeners: {
                                    "initialize": function() {
                                        repopulateChart();
                                    }
                                }
                            }]
                        }]
                    },
                    {
                        title: i18n.LAPIGRASTERSERIES_TITLE_TREND,
                        id: "lapig-raster-series-tab-trend",
                        layout: "border",
                        disabled: true,
                        tbar: [{
                                text: i18n.LAPIGRASTERSERIES_TITLE_TEMPORALDATA,
                                iconCls: 'lapig-icon-add-2',
                                xtype: "button",
                                listeners: {
                                    click: function(evt) {
                                        lapigAnalytics.clickTool('Trend', 'click-temporalData', '')
                                        var wdwInfo = Ext.getCmp('lapig_rasterseries::wdw-info');
                                        wdwInfo.show(this)
                                    }
                                }
                            },
                            '-',
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_PERIOD,
                            {
                                xtype: 'combo',
                                id: "lapig-raster-series-tab-trend-cmb-start-year",
                                fieldLabel: 'Período',
                                border: false,
                                displayField: 'year',
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
                                        { name: 'year' }
                                    ]
                                },
                                listeners: {
                                    select: function() {
                                        var TrendCmbStartYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-start-year').getValue();
                                        lapigAnalytics.clickTool('Trend', 'click-filterDateStart', TrendCmbStartYear)
                                    }
                                }
                            },
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_A,
                            {
                                xtype: 'combo',
                                id: "lapig-raster-series-tab-trend-cmb-end-year",
                                maxLength: 150,
                                border: false,
                                typeAhead: true,
                                editable: false,
                                disabled: true,
                                triggerAction: 'all',
                                displayField: 'year',
                                valueField: 'year',
                                mode: 'local',
                                width: 70,
                                store: {
                                    xtype: 'arraystore',
                                    fields: [
                                        { name: 'year' }
                                    ]
                                },
                                listeners: {
                                    select: function() {
                                        var TrendCmbEndYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-end-year').getValue();
                                        lapigAnalytics.clickTool('Trend', 'click-filterDateEnd', TrendCmbEndYear)
                                    }
                                }
                            },
                            '-',
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_FILTER,
                            {
                                xtype: 'combo',
                                id: 'lapig-raster-series-tab-trend-cmb-interpolation',
                                displayField: 'label',
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
                                    fields: ['label', 'position', 'id']
                                },
                                listeners: {
                                    select: function() {
                                        var TrendFilterSoften = Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation').getValue();
                                        lapigAnalytics.clickTool('Trend', 'click-filterSoften', TrendFilterSoften)
                                    }
                                }
                            },
                            '-',
                            i18n.LAPIGRASTERSERIES_FIELDLBLCB_GROUP,
                            {
                                xtype: 'combo',
                                id: 'lapig-raster-series-tab-trend-cmb-group-data',
                                displayField: 'label',
                                valueField: 'id',
                                mode: 'local',
                                typeAhead: true,
                                editable: false,
                                disabled: true,
                                width: 120,
                                triggerAction: 'all',
                                store: new Ext.data.ArrayStore({
                                    fields: [
                                        { name: 'id' },
                                        { name: 'label' }
                                    ],
                                    data: [
                                        ['NONE_NONE', i18n.LAPIGRASTERSERIES_GROUPCB_NONE],
                                        ['YEAR_mean', i18n.LAPIGRASTERSERIES_GROUPCB_YEARAVERAGE],
                                        ['MONTH-YEAR_mean', i18n.LAPIGRASTERSERIES_GROUPCB_MONTHYEARAVER]
                                    ]
                                }),
                                listeners: {
                                    select: function() {
                                        var TrendFiterClassifyBy = Ext.getCmp('lapig-raster-series-tab-trend-cmb-group-data').getValue();
                                        lapigAnalytics.clickTool('Trend', 'click-fiterClassifyBy', TrendFiterClassifyBy)
                                    }
                                }
                            },
                            '-',
                            i18n.LAPIGRASTERSERIES_GROUPCB_TIME,
                            {
                                xtype: 'numberfield',
                                id: 'lapig-raster-series-tab-trend-num-time-change',
                                allowBlank: false,
                                allowDecimals: false,
                                allowNegative: false,
                                editable: true,
                                disabled: true,
                                width: 60,
                                maxLength: 5,
                                value: 1,
                                listeners: {
                                    invalid: function(field, msg) {
                                        var refreshBtnCmp = Ext.getCmp('lapig-raster-series-tab-trend-btn-refresh');
                                        refreshBtnCmp.setDisabled(true);
                                    },

                                    valid: function(field, msg) {
                                        var refreshBtnCmp = Ext.getCmp('lapig-raster-series-tab-trend-btn-refresh');
                                        refreshBtnCmp.setDisabled(false);
                                    }
                                }
                            },
                            '  ',
                            {
                                xtype: 'combo',
                                id: 'lapig-raster-series-tab-trend-cmb-time-change-units',
                                displayField: 'label',
                                valueField: 'id',
                                mode: 'local',
                                typeAhead: true,
                                editable: false,
                                disabled: true,
                                value: "YEAR",
                                width: 70,
                                triggerAction: 'all',
                                store: new Ext.data.ArrayStore({
                                    fields: [
                                        { name: 'id' },
                                        { name: 'label' }
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
                                        lapigAnalytics.clickTool('Trend', 'click-fiterClassifyByPeriod', TrendFiterClassifyByPeriod)
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
                                        lapigAnalytics.clickTool('Trend', 'click-Refresh', '');
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
                                        lapigAnalytics.clickTool('Trend', 'click-csvDownloads', instance.seriesProperties.timeseriesId)
                                        var csvUrl = 'time-series/' + instance.seriesProperties.timeseriesId + '/csv';

                                        var startYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-start-year').getValue();
                                        var endYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-end-year').getValue();
                                        var interpolation = Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation').getValue();
                                        var groupData = Ext.getCmp('lapig-raster-series-tab-trend-cmb-group-data').getValue();
                                        var timeChange = Ext.getCmp('lapig-raster-series-tab-trend-num-time-change').getValue();
                                        var timeChangeUnits = Ext.getCmp('lapig-raster-series-tab-trend-cmb-time-change-units').getValue();

                                        csvUrl = csvUrl + "?longitude=" + instance.seriesProperties.longitude +
                                            "&latitude=" + instance.seriesProperties.latitude +
                                            "&startYear=" + startYear +
                                            "&endYear=" + endYear +
                                            "&interpolation=" + interpolation +
                                            "&groupData=" + groupData +
                                            "&timeChange=" + timeChange +
                                            "&timeChangeUnits=" + timeChangeUnits +
                                            "&mode=trend" +
                                            "&radius=" + instance.seriesProperties.radius

                                        window.open(csvUrl)
                                    }
                                }
                            }
                        ],
                        items: [{
                            region: 'center',
                            border: false,
                            xtype: 'panel',
                            disabled: true,
                            id: 'lapig-raster-series-tab-trend-chart-pnl',
                            items: [{
                                xtype: 'linechart',
                                id: "lapig-coordinates-chart-trend",
                                store: new Ext.data.JsonStore({
                                    fields: ['date', 'original', 'interpolation', 'trend']
                                }),
                                xField: 'date',
                                yAxis: new Ext.chart.NumericAxis(),
                                xAxis: new Ext.chart.TimeAxis({
                                    labelRenderer: function(date) {
                                        return date.format("m.Y");;
                                    }
                                }),
                                tipRenderer: function(chart, record, index, series) {
                                    var numberFormat = '0.000'
                                    var serie = series.data[index];

                                    var date = serie.date;
                                    if (typeof date === 'number')
                                        date = new Date(date).format("d/m/Y");

                                    var trendValue = Ext.util.Format.number(serie.trend, numberFormat);

                                    if (serie.interpolation != null) {
                                        return date + "\n" +
                                            i18n.LAPIGRASTERSERIES_TXT_TREND + trendValue + "\n" +
                                            i18n.LAPIGRASTERSERIES_TXT_FILTRATED + Ext.util.Format.number(serie.interpolation, numberFormat);
                                    } else if (serie.original != null) {
                                        return date + "\n" +
                                            i18n.LAPIGRASTERSERIES_TXT_TREND + trendValue + "\n" +
                                            i18n.LAPIGRASTERSERIES_TXT_ORIGINAL + Ext.util.Format.number(serie.original, numberFormat);
                                    }
                                },
                                chartStyle: {
                                    animationEnabled: true,
                                    xAxis: {
                                        color: 0xaaaaaa,
                                        labelSpacing: 5,
                                        labelDistance: 5,
                                        majorTicks: { color: 0xaaaaaa, length: 10 },
                                        minorTicks: { color: 0xdddddd, length: 5 },
                                        majorGridLines: { size: 1, color: 0xaaaaaa },
                                        minorGridLines: { size: 0.5, color: 0xdddddd }
                                    },
                                    yAxis: {
                                        color: 0xaaaaaa,
                                        labelDistance: 6,
                                        majorTicks: { color: 0xaaaaaa, length: 10 },
                                        minorTicks: { color: 0xdddddd, length: 5 },
                                        majorGridLines: { size: 1, color: 0xaaaaaa },
                                        minorGridLines: { size: 0.5, color: 0xdddddd }
                                    }
                                },
                                series: [{
                                    type: 'line',
                                    yField: 'original',
                                    displayField: 'original',
                                    style: {
                                        color: 0xfc4239,
                                        size: 4,
                                        lineSize: 2
                                    }
                                }, {
                                    type: 'line',
                                    yField: 'interpolation',
                                    displayField: 'interpolation',
                                    style: {
                                        color: 0x5057a6,
                                        size: 4,
                                        lineSize: 2
                                    }
                                }, {
                                    type: 'line',
                                    yField: 'trend',
                                    displayField: 'trend',
                                    style: {
                                        color: 0x00cc00,
                                        size: 0,
                                        lineSize: 2
                                    }
                                }],
                                listeners: {
                                    "initialize": function() {
                                        repopulateChart();
                                    }
                                }
                            }]
                        }]
                    }
                ]
            }]
        }
    },

    calculateTrend: function() {
        var instance = this;

        var activeTab = instance.getSeriesActiveTab();

        var startYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-start-year').getValue();
        var endYear = Ext.getCmp('lapig-raster-series-tab-trend-cmb-end-year').getValue();

        if (endYear - startYear < 1) {
            return Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_ALERT_VALIDATION, i18n.LAPIGRASTERSERIES_ALERT_SMLTIMECHANGE);
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
            success: function(request) {

                var loadMask = instance.loadMask;

                var jsonResponse = JSON.parse(request.responseText);
                if (jsonResponse.error == undefined) {
                    instance.chartData[activeTab.index] = jsonResponse;
                    instance.populateChart(startYear, endYear, null, null, interpolation);
                    // instance.drawTrend(instance.chartData[activeTab.index]);
                } else {
                    Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_ALERT_VALIDATION, i18n.LAPIGRASTERSERIES_TXT_ALERTATTENCION + ': ' + jsonResponse.error);
                    instance.chartData[activeTab.index] = oldChartData;
                    instance.populateChart(startYear, endYear, null, null, interpolation);
                    // instance.drawTrend(instance.chartData[activeTab.index]);
                }

                instance.setSeriesActiveTabDisabled(false);
                loadMask.hide();
            }
        });
    },

    drawTrend: function(trendData) {
        var instance = this;

        var activeTab = instance.getSeriesActiveTab();

        var chart = Ext.getCmp('lapig-coordinates-chart-' + activeTab.name);
        var interpolationCmb = Ext.getCmp('lapig-raster-series-tab-trend-cmb-interpolation');
        var filter = interpolationCmb.getValue();

        var trendPosition = 0;
        var originalPosition = -1;
        var interpolationPosition = -1;

        trendData.series.forEach(function(serie) {
            if (serie.type == 'trend') {
                trendPosition = serie.position;
            } else if (serie.type == 'original') {
                originalPosition = serie.position;
                serie.label = "Nenhum";
            } else if (serie.type == 'filter' && filter != 'Nenhum') {
                interpolationPosition = serie.position;
            }
        });

        var chartRecords = [];
        trendData.values.forEach(function(values) {
            var dateStr = '-' + values[0];
            date = new Date(dateStr).getTime();

            var record = {
                date: date,
                original: originalPosition != -1 ? values[originalPosition] : null,
                interpolation: interpolationPosition != -1 && originalPosition == -1 ? values[interpolationPosition] : null,
                trend: values[trendPosition],
                dateStr: dateStr
            };
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
                labelRenderer: function(time) {
                    var year = time / 1000 / 60 / 60 / 24 / 365 + 1970;
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
                if (instance.chartData[activeTab.index] != undefined) {
                    runner.stopAll();
                    console.log("Series download and processing elapsed time: " + countSeconds,
                        "\nId: " + instance.seriesProperties.timeseriesId,
                        "\nRadius: " + instance.seriesProperties.radius,
                        "\nCoordinates: (" + instance.seriesProperties.longitude + ", " + instance.seriesProperties.latitude + ")");
                } else {
                    if (countSeconds < 50) {
                        msgText = i18n.LAPIGRASTERSERIES_TXT_ALERTRELAX
                    } else {
                        msgText = i18n.LAPIGRASTERSERIES_TXT_ALERTRELAXMORE
                    }
                    instance.loadMask.el.mask(msgText + countSeconds++ + " seg.", instance.loadMask.msgCls);
                }
            },
            interval: 1000
        });
    },

    setSeriesActiveTabDisabled: function(disable) {
        var instance = this;

        var index;
        var activeTab = instance.getSeriesActiveTab();
        var components = [];

        if (activeTab.index == instance.tabProperties.series) {
            components.push(Ext.getCmp('lapig-raster-series-tab-series-btn-csv'));

            components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-start-year'));
            components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-end-year'));

            components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value'));
            components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value'));

            components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-interpolation'));
            components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-group-data'));

            components.push(Ext.getCmp('lapig-raster-series-tab-series-chart-pnl'));

            var tabTrend = Ext.getCmp('lapig-raster-series-tab-trend');
            if (tabTrend.disabled) {
                components.push(tabTrend);
            }

        } else if (activeTab.index == instance.tabProperties.trend) {
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

        for (index = 0; index < components.length; index++) {
            components[index].setDisabled(disable);
        }
    },

    restartChart: function() {
        var instance = this;
        var empty = [];
        var components = [];
        var activeTab = instance.getSeriesActiveTab();

        components.push(Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-start-year'));
        components.push(Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-end-year'));
        components.push(Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-interpolation'));

        components.push(Ext.getCmp('lapig-coordinates-chart-' + activeTab.name));

        if (activeTab.index == instance.tabProperties.series) {
            components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value'));
            components.push(Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value'));
        } else if (activeTab.index == instance.tabProperties.trend) {

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

        var startYearCmb = Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-start-year');
        var endYearCmb = Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-end-year');

        var groupDataCmb = Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-group-data');

        var interpolationCmb = Ext.getCmp('lapig-raster-series-tab-' + activeTab.name + '-cmb-interpolation');

        if (activeTab.index == instance.tabProperties.series) {
            var startValueCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-start-value');
            var endValueCmb = Ext.getCmp('lapig-raster-series-tab-series-cmb-end-value');
        } else if (activeTab.index == instance.tabProperties.trend) {
            var trendSupported = false;
            var layersLength = instance.bfastApplicableLayers.length;

            for (i = 0; i < layersLength; i++) {
                if (timeseriesId === instance.bfastApplicableLayers[i]) {
                    trendSupported = true
                    break;
                }
            }

            if (!trendSupported) {
                Ext.Msg.alert(i18n.LAPIGRASTERSERIES_ALERT_VALIDATION,
                    i18n.LAPIGRASTERSERIES_ALERT_VLDTRENDDATA + timeseriesId +
                    i18n.LAPIGRASTERSERIES_ALERT_VLDTRENDDATA_CONT);
                /*Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_ALERT_VALIDATION, i18n.LAPIGRASTERSERIES_ALERT_VLDTRENDDATA+
                  instance.bfastApplicableLayers);*/
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
        interpolationCmb.setValue(i18n.LAPIGRASTERSERIES_GROUPCB_NONE);

        if (instance.chartData == undefined) {
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

                if (activeTab.index == instance.tabProperties.series) {
                    var interpolations = [];
                    instance.chartData[activeTab.index].series.forEach(function(serie) {
                        if (serie.id == 'original')
                            serie.label = i18n.LAPIGRASTERSERIES_GROUPCB_NONE;
                        else {
                            var filterOnly = {};
                            filterOnly.position = -serie.position;
                            filterOnly.type = serie.type;
                            filterOnly.id = "only-" + serie.id;
                            filterOnly.label = i18n.LAPIGRASTERSERIES_GROUPCB_ONLY + " " + serie.label;
                            interpolations.push(filterOnly);
                        }

                        interpolations.push(serie)
                    })
                    interpolationCmb.store.loadData(interpolations);
                } else {
                    var seriesInterpolationCmb = Ext.getCmp("lapig-raster-series-tab-series-cmb-interpolation");
                    var filteredRecs = [];

                    seriesInterpolationCmb.store.each(function(rec) {
                        if (rec.get('id').indexOf("only") == -1) filteredRecs.push(rec.copy());
                    });
                    interpolationCmb.store.removeAll();
                    interpolationCmb.store.add(filteredRecs);
                }

                var startYear = [years[0]];
                var endYear = [years[years.length - 1]];

                var startValue = values[0][0];
                var endValue = values[values.length - 1][0];

                endYearCmb.setValue(endYear);
                startYearCmb.setValue(startYear);

                if (activeTab.index == instance.tabProperties.series) {
                    startValueCmb.store.loadData(values);
                    endValueCmb.store.loadData(values);

                    endValueCmb.setValue(endValue);
                    startValueCmb.setValue(startValue);
                }

                instance.seriesProperties = {
                    timeseriesId: timeseriesId,
                    longitude: longitude,
                    latitude: latitude,
                    startYear: startYear,
                    endYear: endYear,
                    startValue: startValue,
                    endValue: endValue,
                    radius: radius
                };

                instance.populateChart(startYear, endYear, startValue, endValue);

                instance.setSeriesActiveTabDisabled(false);

                loadMask.hide();

            }
        });
    },

    getWdwInfoButtons: function() {
        var instance = this;

        var scale = parseInt(Ext.getCmp('lapig_rasterserires::wdw-info-txt-scale').getValue());
        var srcHtml = Ext.getCmp('lapig_rasterseries::frm-info-source').body.dom.innerHTML;
        var source = srcHtml.slice(32, -6);

        var addRadiusGUI = function(combo) {
            var radius = combo.getValue();
            if (radius == '') return;

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

        return [{
                xtype: 'checkbox',
                //boxLabel: i18n.LAPIGCOORDINATES_CHKBOXLBL_USERADIUS,
                id: 'lapig-coordinates-chk-use-radius',
                width: 'auto',
                style: {
                    position: 'static'
                },
                disabled: true,
                enableOnSelect: true /*(source == 'lapig') ? true : false,*/ ,
                listeners: {
                    check: function(checkbox, checked) {
                        Ext.getCmp('lapig-coordinates-cmb-radius').setDisabled(!checked);
                        Ext.getCmp('lapig-coordinates-label-radius').setDisabled(!checked);
                        Ext.getCmp('lapig-coordinates-label-useradius').setDisabled(!checked);
                    }
                }
            },
            {
                xtype: 'label',
                id: 'lapig-coordinates-label-useradius',
                text: 'Usar raio',
                width: 'auto',
                height: 'auto',
                disabled: true
            },
            {
                xtype: 'combo',
                id: "lapig-coordinates-cmb-radius",
                fieldLabel: 'Raios',
                border: false,
                displayField: 'radius',
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
                        { name: 'radius' }
                    ],
                    data: [
                        [scale],
                        [scale * 2],
                        [scale * 3]
                    ]
                },
                listeners: {
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
                text: 'm',
                width: 'auto',
                height: 'auto',
                disabled: true
            },
            { xtype: "tbfill" },
            {
                text: i18n.LAPIGRASTERSERIES_BTNTXT_CREATEGRAPH,
                xtype: "button",
                disabled: true,
                enableOnSelect: true,
                listeners: {
                    click: function(evt) {
                        lapigAnalytics.clickTool('Time Series', 'click-createGraphic', '')

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
                        var otherTabIndex = Math.abs(activeTab.index - 1);

                        if (instance.chartData != undefined) {
                            instance.chartData[otherTabIndex] = undefined;
                        }

                        var useRadius = Ext.getCmp('lapig-coordinates-chk-use-radius').getValue();
                        var radius = undefined;
                        if (useRadius == true) {
                            radius = Ext.getCmp('lapig-coordinates-cmb-radius').getValue();
                            //Olha esse if aqui Rhuan. Vê se assim resolve - Guilherme, O generoso
                            // lapigAnalytics.clickTool('Time Series','value-Radius', (radius == undefined) ? 0:radius);
                        }

                        /*if((useRadius == 250) || (useRadius == 500) || (useRadius == 750)){
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