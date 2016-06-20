/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("lapig.tools");

/** api: constructor
 *  .. class:: LapigRasterSeriesBtn(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
lapig.tools.LapigRasterSeriesBtn = Ext.extend(gxp.plugins.Tool, {
  
  /** api: ptype = gxp_LapigRasterSeriesBtn */
  ptype: "gxp_lapigrasterseriesbtn",
  
  /** api: config[removeMenuText]
   *  ``String``
   *  Text for remove menu item (i18n).
   */
  MenuText: 'Análise de Séries Temporais',

  /** api: config[removeActionTip]
   *  ``String``
   *  Text for remove action tooltip (i18n).
   */
  Tooltip: 'Análise de Séries Temporais',
  
  /** api: method[addActions]
   */
  addActions: function() {
    var actions = lapig.tools.LapigRasterSeriesBtn.superclass.addActions.apply(this, [{
      text: this.MenuText,
      tooltip: this.Tooltip,
      icon   : 'theme/app/img/chart_xy.png',
      handler: function() {
        var flashProperties = this.getFlashVersion();
        if(flashProperties.hasFlash){
          console.log("Flash version:", flashProperties.version)
          lapigAnalytics.clickTool('Tools','Time Series','');
          Ext.getCmp('southpanel').expand(true);
          Ext.getCmp('lapig_rasterseries::wdw-info').show(this);
        }else{
          Ext.MessageBox.alert(i18n.LAPIGRASTERSERIES_TXT_ALERTATTENCION, i18n.LAPIGRASTERSERIES_ALERT_ERROR_NOFLASH);
        }
      },
      scope: this
    }]);

    return actions;
  },

  getFlashVersion: function() {
    /*
      The first step is to define a helper function that extracts and normalizes the Flash version.
      Even at this low level, there is cross-browser weirdness -- the format of the version string varies 
      depending on the route we use to access it (navigator.plugins vs. ActiveXObject).
      We truncate the version at three decimal places and return it as a string.
    */
    function getFlashVersion(desc) {
      var matches = desc.match(/[\d]+/g);
      matches.length = 3; // To standardize IE vs FF
      return matches.join('.');
    }

    var hasFlash = false;
    var flashVersion = '';
    /*
      OK, the first place to look for Flash is navigator.plugins, which is supported by every browser 
      except Internet Explorer. If one of the plugins has the key "Shockwave Flash", then the version is 
      probably stored in plugin.description.
    */
    if (navigator.plugins && navigator.plugins.length) {
        var plugin = navigator.plugins['Shockwave Flash'];
        if (plugin) {
          hasFlash = true;
          if (plugin.description) {
            flashVersion = getFlashVersion(plugin.description);
          }
        }
        /*
          For reasons that no one remembers, Flash 2 (yes, that's old) does not announce its version string 
          properly in plugin.description. We'll hard-code 2.0.0.11 (the last in the Flash 2 series) 
          and pray for the soul of the end user who is stuck in the 20th century.
        */
        if (navigator.plugins['Shockwave Flash 2.0']) {
          hasFlash = true;
          flashVersion = '2.0.0.11';
        }
        /*
          The next place to check is navigator.mimeTypes, which holds a list of all the MIME types registered 
          in the browser. The MIME type of Flash is application/x-shockwave-flash. If this key is found in the MIME 
          type array, we can access the plugin through the mimeType.enabledPlugin property and then get the 
          Flash version as above.
        */
    } else if (navigator.mimeTypes && navigator.mimeTypes.length) {
      var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
      hasFlash = mimeType && mimeType.enabledPlugin;
      if (hasFlash) {
        flashVersion = getFlashVersion(mimeType.enabledPlugin.description);
      }
      /*
        That's it for the non-IE browsers. The rest is to deal with the accumulated cruft of Flash differences 
        within Internet Explorer.
      */
    } else {
      /*
        The first ActiveX test is to look for the ShockwaveFlash.7 object, which, unsurprisingly, is available 
        in Flash 7 and later. Modern versions of Flash support the GetVariable method to get the exact version 
        string.
      */
      try { // Try 7 first, since we know we can use GetVariable with it
        var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.7');
        hasFlash = true;
        flashVersion = getFlashVersion(ax.GetVariable('$version'));
      } catch (e) { // Try 6 next, some versions are known to crash with GetVariable calls
        /*
          The second ActiveX test is to look for the ShockwaveFlash.6 object, which is available in Flash 6 
          and later. This object does not support the GetVariable method, so we need to hard-code the version 
          string.
        */
        try {
          var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
          hasFlash = true;
          flashVersion = '6.0.21'; // First public version of Flash 6
        } catch (e) {
          /*
            The final ActiveX test is to look for the default ShockwaveFlash object.
          */
          try { // Try the default activeX
            var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            hasFlash = true;
            flashVersion = getFlashVersion(ax.GetVariable('$version'));
          } catch (e) {
            /*
              If all tests fail, we have no Flash plug-in available.
            */
          }
        }
      }
    }

    return {
      "hasFlash": hasFlash,
      "version": flashVersion
    }
  }
      
});

Ext.preg(lapig.tools.LapigRasterSeriesBtn.prototype.ptype, lapig.tools.LapigRasterSeriesBtn);
