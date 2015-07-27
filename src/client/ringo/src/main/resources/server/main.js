var fs = require("fs");
var {Application} = require("stick");

var app = Application();
app.configure("notfound", "error", "static", "params", "mount");

var appPath = java.lang.System.getProperty("app.static");
app.static(appPath, "index.html");
app.mount("/proxy", require("./root/proxy").app);

// debug mode loads unminified scripts
// assumes markup pulls in scripts under the path /servlet_name/lib/
var config = fs.join(appPath, "buildjs.cfg");
app.mount("/lib/", require("./autoloader").App(config));

// proxy a remote geoserver on /geoserver by setting app.proxy.geoserver to remote URL
// only recommended for debug mode
var geoserver = java.lang.System.getProperty("app.proxy.geoserver");
if (geoserver) {
    if (geoserver.charAt(geoserver.length-1) !== "/") {
        geoserver = geoserver + "/";
    }
    // debug specific proxy
    app.mount("/ogc-server/", require("./root/proxy").pass({url: geoserver, preserveHost: true, allowAuth: true}));
}

exports.app = app;

// main script to start application
if (require.main === module) {
    require("ringo/httpserver").main(module.id);
}
