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
                "_id": col[0],
                "title": col[1],
                "metadata": col[2],
                "categoria": col[3],
                "subjects":col[4],
            };

            var layerId = objeto._id;
            var title = objeto.title;
            var metadata = objeto.metadata;
            var catPT = objeto.categoria;
            var catEN = objeto.subjects;

            result.subjects[catPT] = catEN,
            result.layers[layerId] = {
                        "title" : title,
                        "metadata": metadata
                      }
        }

        callback(result);

    });  
}


var filepath = 'Spatial-Inteligence_en.csv';

parseCsv(filepath, function(result) {
    fs.writeFileSync("../lang/Spatial-Inteligence_en.json", JSON.stringify(result).replace(/<br>/gi,' '));
});