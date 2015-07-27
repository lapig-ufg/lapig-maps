var   exec  = require('child_process').exec
    , path  = require('path')
    , moment = require('moment');
    ;

module.exports = function(app) {

  var config = app.config;

  var ewtGetDate = function(filepath) {
  
    var filename = path.basename(filepath, '.tif').toLowerCase().replace("_lapig", "");
    var split = filename.split("_");

    var anoIndex = split.length - 2;
    var mesIndex = split.length - 1;

    var ano = split[anoIndex];
    var mes = split[mesIndex].substr(1);

    var dt = new Date(ano, Number(mes) - 1, 1);
    var time = dt.getTime();
    var str = ((dt.getMonth() + 1) + '/' + dt.getFullYear());

    return { time: time, str: str};
  }

  var eviGetDate = function(filepath) {

    var filename = path.basename(filepath, '.tif').toLowerCase().replace("_lapig", "");
    var split = filename.split("_");

    var diaIndex = split.length - 1;
    var anoIndex = split.length - 2;

    var dia = split[diaIndex];
    var ano = split[anoIndex];

    var iso = moment().year(ano).dayOfYear(dia).toISOString();

    var dt = new Date( iso );
    var time = dt.getTime();
    var str = (dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear());

    return { time: time, str: str};
  }

  var getValue = function(pixelValue) {
    return Number(pixelValue)
  }

  var products = {
      'EWT': {
        description: 'Variação Gravimétrica da Água',
        pattern: ".*BRASIL/EWT.*.*tif",
        getDate: ewtGetDate,
        getValue: getValue,
        options: {}
      }
    , 'PRECIPITATION': {
        description: 'Precipitação',
        pattern: ".*BRASIL/PRECIPITATION.*.tif$",
        getDate: ewtGetDate,
        getValue: getValue,
        options: {
        }
      }
    , 'EVI': {
        description: 'Índice de vegetação',
        pattern: ".*BRASIL/EVI.*.tif$",
        getDate: eviGetDate,
        getValue: getValue,
        options: {
        }
      }
    , 'EVI2': {
        description: 'Índice de vegetação',
        pattern: ".*BRASIL/EVI2.*.tif$",
        getDate: eviGetDate,
        getValue: getValue,
        options: {
        }
      }
    , 'FPAR': {
        description: 'Fração de Radiação Fotossinteticamente Ativa',
        pattern: ".*BRASIL/FPAR.*.tif$",
        getDate: eviGetDate,
        getValue: getValue,
        options: {
        }
      }
    , 'LST': {
        description: 'Temperatura de superfície',
        pattern: ".*BRASIL/LST.*.tif$",
        getDate: eviGetDate,
        getValue: function(pixelValue) {
          var value = getValue(pixelValue);
          return (value == -273) ? 0 : value
        },
        options: {
        }
      }
    , 'EVAPOTRANSPIRATION': {
        description: 'Evapotranspiração',
        pattern: ".*BRASIL\/EVAPOTRANSPIRATION.*.*tif",
        getDate: ewtGetDate,
        getValue: getValue,
        options: {
        }
    }
    , 'POTENTIAL_EVAPOTRANSPIRATION': {
        description: 'Evapotranspiração Potencial',
        pattern: ".*BRASIL/POTENTIAL\\ EVAPOTRANSPIRATION.*.tif$",
        getDate: ewtGetDate,
        getValue: getValue,
        options: {
        }
      }
    , 'NORMALIZED_EVAPOTRANSPIRATION': {
        description: 'Evapotranspiração Normalizada',
        pattern: ".*BRASIL/NORMALIZED\\ EVAPOTRANSPIRATION.*.tif$",
        getDate: ewtGetDate,
        getValue: getValue,
        options: {
        }
      }
  }

  var RasterSeries = {};

  RasterSeries.pixelValue = function(name, lat, lon, fn) {

      var product = products[name];

      if(!product) return fn(null);

      var rasterFiles = config.appRoot + '/integration/sh/lapig_raster_series.files'
      var pixelCmd = config.appRoot + '/integration/sh/raster-series.sh ' + rasterFiles + ' ' + product.pattern + ' ' + lon + ' ' + lat

      console.log(pixelCmd);

      var callback = function (error, stdout, stderr) {

        var result = {
          name: name,
          key: product.description,
          values: {},
        };

        var i = 0;

        stdout.split("\n").forEach( function(line) {
          
          if(line) {
            var split = line.split("\t");
            var filepath = split[0].trim();
            var pixelValue = split[1].trim();

            var value = product.getValue(pixelValue);
            var date = product.getDate(filepath);

            result.values[ date.str ] = [ date.time, value ];
          }

        });

        fn(result);

      };

      var child = exec(pixelCmd, callback);

  };

  return RasterSeries;
}

