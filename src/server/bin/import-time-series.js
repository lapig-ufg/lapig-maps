
var   fs = require('fs')
    , mongodb = require('mongodb')
    ;

var parseCsv = function(filepath, callback) {
  fs.readFile(filepath, 'utf8', function(err, data){
      
    var rows = data.split(/\n/);

    var timeSeries = [];

    for(var i=1; i < rows.length - 1 ; i++) {
      var row = rows[i];
      var col = row.split(/\#/)

      var startYear = col[13].split("-")[0];
      var endYear = '';

      if (col[14].toUpperCase() == 'NOW') {
        endYear = 'Atualmente'
      } else {
        endYear = col[14].split("-")[0];
      }

      var date = startYear + ' - ' + endYear;

      var timeSerie = {
        "_id": col[0],
        "name": col[1],
        "description": col[2],
        "subject": col[3],
        "project": col[4].toUpperCase(),
        "satelite": col[5],
        "pixelMeasure": col[8],
        "source": col[9].toLowerCase(),
        "scale": col[11],
        "date": date,
        "params": {
          "temporal_resolution": col[6],
          "temporal_resolution_type": col[7],
          "expression": col[12],
          "start_date": col[13],
          "end_date": col[14],
          "fill_value": col[15],
          "quality_layer": col[16],
          "quality_layer_good_values": col[17],
          "quality_layer_n_composites": col[18],
          "pixel_resolution": col[11]
        }
      }

      if( col[10].split(' ').length > 1 ) {
        timeSerie.params = {
          "type": 'Composite',
          "layers": col[10],
          "start_date": col[13],
          "end_date": col[14],
          "quality_layer": col[16]
        }
      } else if(timeSerie.source == 'ee') {
        timeSerie.params.type = 'EarthEngine'
        timeSerie.params.collection_id = col[10]
        timeSerie.params.fn_parsedate = timeSerie.params.collection_id.split('/')[0].toLowerCase();
      } else {
        timeSerie.params.type = 'Gdal'
        timeSerie.params.file = col[10]
      }
    

      timeSeries.push(timeSerie);
    }

    callback(timeSeries);

  });  
}

var insertTimeSeries = function(dbUrl, timeSeries, callback) {

  var MongoClient = mongodb.MongoClient;

  MongoClient.connect(dbUrl, function(err, db) {
      if(err)
        return console.dir(err);

      db.collection('timeSeries', function(err, timeSeriesCollection) {

        var filteredTimeSeries = []

        timeSeries.forEach(function(timeSerie) {
          if(timeSerie.name)
            filteredTimeSeries.push(timeSerie);
        })

        console.log(filteredTimeSeries)

        timeSeriesCollection.insert(filteredTimeSeries, null, function() {
          db.close();
          callback();
        });
      });
  });

}

var dbUrl = 'mongodb://localhost:27017/lapig-maps';
var filepath = 'time-series.csv';
var layerspath = '../integration/py/time-series/conf/layers.ini'

var createLayersIni = function(timeSeries) {
  
  var content = ""
  for (var i in timeSeries) {
    timeSerie = timeSeries[i];
    console.log(timeSerie._id)
    content += "[" + timeSerie._id + "]\n"
    for( var key in timeSerie.params) {
      if(timeSerie.params[key] != '')
        content += key + " = " + timeSerie.params[key] + "\n"
    }
    content += "\n"
    delete timeSeries[i].params
  }

  fs.writeFileSync(layerspath, content);
}

parseCsv(filepath, function(timeSeries) {
  createLayersIni(timeSeries)
  insertTimeSeries(dbUrl, timeSeries, function() {});
});
