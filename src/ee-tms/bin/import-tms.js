var mongodb = require('mongodb')
    ,eyes = require('eyes')
    ,http = require('http')
    ,fs = require('fs')
    ,xml2js = require('xml2js')
    ,parser = new xml2js.Parser()
    ,strftime = require('strftime')
    ;

parser.on('error', function(err) { console.log('Parser error', err); });

var data = '';

var parseXML = function(path, callback){
    http.get(path, function(res) {
        
        var earthEngine = {};

        if (res.statusCode >= 200 || res.statusCode < 400) {
            res.on('data', function(data_) { data += data_.toString(); });
            res.on('end', function() {
                parser.parseString(data, function(err, result) {
                    var layers = result.Capabilities.Contents[0].Layer
                    for(var i=0; i < layers.length -1 ; i++){
                        var layer = layers[i]
                        var info = layer['ows:Title'].toString().split(" ")
                        var nameFileObj = layer['ows:Identifier']
                        var nameFile = layer['ows:Identifier'].toString().split("_")

                        var id = nameFile[0]+"_"+nameFile[3]
                        var title = info[0]+" " +info[1]+" "+info[3]+" "+nameFile[3]
                        var description = "Acervo completo de imagens "+title
                        var region = "Brasil"
                        var subject = "Imagens de Satélite"
                        var source = "ee"

                        var date = info[2].split('-')
                        var dateYear = date[0]
                        var dateMonth = date[1]
                        var dateDay = date[2]
                        dateAux = new Date(dateYear, 0);
                        dateAux.setMonth(parseInt(dateMonth) - 1);
                        dateAux.setDate(dateDay);
                        var dateFormat = strftime('%Y %b. %d', dateAux)

                        var extentObj = (layer['ows:WGS84BoundingBox'][0])
                        var extentLower = extentObj['ows:LowerCorner'].toString().split(" ")
                        var extentUpper = extentObj['ows:UpperCorner'].toString().split(" ")
                        var extent = extentLower.concat(extentUpper)

                        if(earthEngine[id] === undefined) {
                            earthEngine[id] = {
                                "_id" : id,
                                "name" : title,
                                "description" : description,
                                "region" : region,
                                "subject" : subject,
                                "search" : id+" "+title+" "+description+" "+region+" "+subject+" "+source,
                                "project" : "PASTAGEM.ORG",
                                "type" : "MULTIPLE",
                                "source" : source,
                                "fileObj" : [],
                                "scale" : "30m",
                                "year" : "2000 Apr. - 2013 Sep.",
                                "extent" : extent,
                                "epsgCode" : "4674",
                                "metadata" : ""
                            };
                        }

                        earthEngine[id].fileObj.push({ 
                            "date": dateFormat, 
                            "name": nameFileObj.toString(), 
                            "type": "EE"
                        });

                    }
                    for (var key in earthEngine){
                        var dateSort = earthEngine[key].fileObj.sort()
                        var dateStart = dateSort[0]["date"]
                        var dateFinish = dateSort[dateSort.length -1]["date"]
                        var dateYear = dateStart + " - " + dateFinish

                        earthEngine[key].year = dateYear 
                    }
                    callback(earthEngine)
                });
            });
        }
    });
}


var insertEarthEngine = function(dbUrl, earthEngine, callback) {

    var MongoClient = mongodb.MongoClient;

    MongoClient.connect(dbUrl, function(err, db) {

        if(err)
        return console.dir(err);

        var filteredEarthEngine = []

        db.collection('layers', function(err, earthEngineCollection) {
            
            for(var key in earthEngine) {
                filteredEarthEngine.push(earthEngine[key]);
            }

            earthEngineCollection.insert(filteredEarthEngine, null, function() {
                db.close();
                callback(earthEngine);
            });
        });
    });
}

var dbUrl = 'mongodb://localhost:27017/lapig-maps';
var path = 'http://localhost:5555/tms';

parseXML(path, function(earthEngine) {
    console.log(earthEngine)
    insertEarthEngine(dbUrl, earthEngine, function() {});
});
