
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

      var startYear = col[11].split("-")[0];
      var endYear = '';

      if (col[12].toUpperCase() == 'NOW') {
        endYear = 'Atualmente'
      } else {
        endYear = col[12].split("-")[0];
      }

      var date = startYear + ' - ' + endYear;

      var timeSerie = {
        "_id": col[0],
        "name": col[1],
        "description": col[2],
        "subject": col[3],
        "project": col[4].toUpperCase(),
        "satelite": col[5],
        "pixelMeasure": col[6],
        "source": col[7].toLowerCase(),
        "scale": col[9],
        "date": date
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
        timeSeriesCollection.insert(timeSeries, null, function() {
          db.close();
          callback();
        });
      });
  });

}


var timeSeriesConfigPy = ''
var dbUrl = 'mongodb://localhost:27017/lapig-maps';
var filepath = 'time-series.csv';

parseCsv(filepath, function(timeSeries) {
  insertTimeSeries(dbUrl, timeSeries, function() {});
  timeSeries.forEach(function(timeSerie) {
    console.log(timeSerie._id)
  })
});
