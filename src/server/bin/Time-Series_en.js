
var   fs = require('fs')
    , mongodb = require('mongodb')
    , path = require('path')
    , async = require('async')
    , filewalker = require('filewalker')
    , child_process = require('child_process')
    , _ = require('underscore')
    , strftime = require('strftime')
    ;

var instance = this;

var printf = function(str, params) {
    for(var i in params) {
        var re = new RegExp('\\{'+i+'\\}', 'g');
        str = str.replace(re, params[i]);
    }

    return str;
};

var parseCsv = function(filepath, callback) {
    fs.readFile(filepath, 'utf8', function(err, data){
        
        var rows = data.split(/\n/);

        result = {
                  "subjects": {},
                  "layers": {}
        }

        for(var i=1; i < rows.length - 1 ; i++) {
            var row = rows[i];
            var col = row.split(/\#/)

            var objeto = {
                "_id":col[0],
                "name": col[1],
                "description": col[2],
                "categoria": col[3],
                "subjects":col[4],
            };

            var layerId = objeto._id;
            var name = objeto.name;
            var description = objeto.description;
            var catPT = objeto.categoria;
            var catEN = objeto.subjects;

            result.subjects[catPT] = catEN,
            result.layers[layerId] = {
                        "name": name,
                        "description": description
                      }
        }

        callback(result);

    });  
}


var layersDir = "/home/fernanda/Documentos/Projeto/shp/";

var filepath = 'Time-Series_en.csv';

parseCsv(filepath, function(result) {
    fs.writeFileSync("../lang/Time-Series_en.json", JSON.stringify(result).replace(/<br>/gi,' '));
});
