
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
              "regions": {},
              "layers": {}
    }
      instance.objLayers = [];

    for(var i=1; i < rows.length - 1 ; i++) {
      var row = rows[i];
      var col = row.split(/\#/)


      var objeto = {
        "name": col[0],
        "description": col[1],
        "categoria": col[3],
        "categories":col[4],
        "_id":col[5],
        "searchEn": col[0] + " " + col[1] + " " + col[3] + " " + col[4] + " " + col[5],
        "regioes": col[8],
        "regions": col[9]
      };

      console.log(objeto.regioes)

      var catPT = objeto.categoria;
      var catEN = objeto.categories;
      var layerId = objeto._id;
      var name = objeto.name;
      var description = objeto.description;
      var searchEn = objeto.searchEn;
      var regioesPT = objeto.regioes;
      var regionsEn = objeto.regions;

      result.subjects[catPT] = catEN,
      result.regions[regioesPT] = regionsEn,
      result.layers[layerId] = {
                  "name": name,
                  "description": description,
                }
    instance.objLayers.push(objeto);
    }

    callback(result);

  });  
}
  var insertLayers = function(dbUrl, layerCollectionName, callback) {

      var MongoClient = mongodb.MongoClient;

      MongoClient.connect(dbUrl, function(err, db) {
          db.collection(layerCollectionName, function(err, layersCollection) {
              instance.objLayers.forEach( function(l){
                layersCollection.update({"_id" : l._id}, {$set : {"searchEnglish" : l.searchEn}}, {upsert:false, multi:true})
              })
          });
      });
      callback();
  }


var layersDir = "/home/fernanda/Documentos/Projeto/shp/";

var filepath = 'Layer_en.csv';

var layerCollectionName = "layers";
var dbUrl = 'mongodb://localhost:27017/lapig-maps';

parseCsv(filepath, function(result) {
      fs.writeFileSync("../lang/Layer_en.json", JSON.stringify(result).replace(/<br>/gi,' '));
      insertLayers(dbUrl, layerCollectionName, function() {});
});
