// the autoloader injects scripts into the document dynamically
// only suitable for development/debug mode

var {Application} = require("stick");
var FS = require("fs");
var CONFIG = require("buildkit").config;
var MERGE = require("buildkit").merge;

var template = getResource("./templates/debug-loader.js").getContent();

var libLoader = function(section, order, baseDir) {
    var paths = order.map(function(script) {
        // TODO: resolve path issues elsewhere
        var relative = FS.relative(FS.join(baseDir, "."), script.root).replace(/\\/g, "/");
        return "'@/" + relative + "/" + script.path + "'";
    });
    var body = template.replace("{{paths}}", paths.join(",\n"));
    return function(env) {
        return {
            status: 200,
            headers: {"Content-Type": "text/javascript"},
            body: [body]
        };
    };
};

var App = function(config) {
    var sections = CONFIG.parse(config);
    var group, root, order;
    var app = Application();
    app.configure("mount");
    var configDir = FS.directory(config);
    for (var section in sections) {
        group = sections[section];
        // absolute path for group roots
        // TODO: resolve path issues elsewhere
        group.root = group.root.map(function(path) {
            return FS.join(configDir, path);
        });
        order = MERGE.order(group);
        // mount lib loader for the section
        app.mount("/" + section, libLoader(section, order, configDir));
    }
    // mount a script loader for all scripts
    var scriptLoader = Application();
    scriptLoader.configure("static");
    scriptLoader.static(configDir);
    app.mount("/@", scriptLoader);
    return app;
};

exports.App = App;
