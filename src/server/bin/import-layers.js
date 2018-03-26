
var   fs = require('fs')
    , mongodb = require('mongodb')
    , path = require('path')
    , async = require('async')
    , filewalker = require('filewalker')
    , child_process = require('child_process')
    , _ = require('underscore')
    , strftime = require('strftime')
    ;

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

    var layers = [];

    for(var i=1; i < rows.length - 1 ; i++) {
      var row = rows[i];
      var col = row.split(/\#/)
      
      var regions = col[2].split(',')

      var objeto = {
        "name": col[0],
        "description": col[1],
        "region":regions,
        "subject":col[3].trim(),
        "_id":col[4].trim(),
        "search":col[0]+" "+col[1]+" "+col[2]+" "+col[3]+" "+col[4],
        "project": col[5].toUpperCase(),
        "metadata": col[6],
        "searchEnglish":col[0]+" "+col[1]+" "+col[2]+" "+col[3]+" "+col[4]
      }
      
      layers.push(objeto);
  
    }

    callback(layers);

  });  
}

var insertLayers = function(dbUrl, layerCollectionName, layers, callback) {

  var MongoClient = mongodb.MongoClient;

  MongoClient.connect(dbUrl, function(err, db) {
      if(err)
        return console.dir(err);

      existedLayers = []
      notExistedLayers = []

      layers.forEach( function(layer) {
        if(layer.type != 'NOT-EXISTS')
          existedLayers.push(layer);
        else
          notExistedLayers.push(layer.name)
      });

      db.collection(layerCollectionName, function(err, layersCollection) {
        layersCollection.insert(existedLayers, null, function() {
          db.close();

          if(notExistedLayers.length > 0)
            console.log("The layers doesn't exist: ", notExistedLayers);

          callback();
        });
      });
  });

}

var formatDate = function(date) {
  if (date=="ni"){
    return "Nao indicado.";
  } else if (date=="na"){
    return "Nao se aplica.";
  } else if (date.length==7) {
    
    if (date[4].toUpperCase() == 'M') {
      var month = date[5]+date[6];
      var year = date[0]+date[1]+date[2]+date[3];
      
      dateAux = new Date(year, 0);
      dateAux.setMonth(parseInt(month) - 1);

      return strftime('%Y %b.', dateAux);

    } else {
      var day = date[4]+date[5]+date[6];
      var year = date[0]+date[1]+date[2]+date[3];
      
      dateAux = new Date(year, 0);
      dateAux.setDate(day);

      return strftime('%Y %b. %d', dateAux);
    }

  } else if(date.length==4){
    return date[0]+date[1]+date[2]+date[3];
  } else {
    return date;
  }
}

var getLayerMultipleFiles = function(layersDir, layer, callback) {
  var layerBasepath = path.join(layersDir, layer['subject'], layer['_id']);

  var files = [];

  filewalker(layerBasepath)
    .on('file', function(file) {
      var extension = path.extname(file);
      
      if(extension == '.tif' || extension == '.shp') {

        var nameFile = path.basename(file).split('_');

        var name = path.basename(file).split('.');
        var name = name[0]; 

        var date = nameFile[nameFile.length-2];

        if (extension == '.tif'){
            type = "RASTER"
        } else if (extension == '.shp'){
            type = "VECTOR"
        }
          
        var fileObj = { 
          "date": formatDate(date), 
          "name": name, 
          "type": type 
        }
        
        files.push(fileObj);
    }

    })
    .on('done', function() {
      files.sort(function(a,b) {
        var aDate = a.name;
        var bDate = b.name;

        if(aDate < bDate) return -1;
        if(aDate > bDate) return 1;
        return 0;
      });
      callback(files);
    })
  .walk();
}

var checkLayerType = function(layersDir, layer, callback) {

  var layerBasepath = path.join(layersDir, layer['subject'], layer['_id']).replace(/\ /g, '\ ');;
  var layerTiffPath = layerBasepath + '.tif';
  var layerShpPath = layerBasepath + '.shp';

  var layerPathPossibles = [layerTiffPath, layerShpPath, layerBasepath];

  async.detect(layerPathPossibles, fs.exists, function(result){
    result = ( result === undefined ) ? 'NOT-EXISTS' : path.extname(result);

    var layerType = result;
    if(result === '.shp')
      layerType = 'VECTOR'
    else if(result === '.tif')
      layerType = 'RASTER'
    else if(result == '')
      layerType = 'MULTIPLE'
    
    callback(layerType);
  });
}

var getSource = function(layer) {
  var nameTitle = layer._id.split('_');
  return nameTitle[nameTitle.length-1];
};

var getScale = function(layer) {
  var nameTitle = layer._id.split('_');
  var scaleTitle = nameTitle[nameTitle.length-3];
  var teste1 = scaleTitle.toString();
  var teste = teste1.substring(0,1) + "," + teste1.substring(1);

  if (scaleTitle == 'ni')
    scaleTitle= "Nao informada";
  else if (scaleTitle == 'na')
    scaleTitle= "Nao se aplica";
  else {
    if (layer.type == 'RASTER')
      scaleTitle = scaleTitle.toString() + " m";
    else if (layer.type == 'VECTOR')
      scaleTitle="1:"+(scaleTitle+"000").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  };
  
  return scaleTitle;
};

var getYear = function(layer){
  var nameTitle = layer._id.split('_');
  var date = nameTitle[nameTitle.length - 2];

  return formatDate(date);
};

var getScaleMultiple = function(layer){

  var name = layer.fileObj[0].name;
  var type = layer.fileObj[0].type;

  var nameSplit = name.split("_");
  var scale = nameSplit[nameSplit.length-3];

  if (scale == 'ni')
    scale = "Nao informada";
  else if (scale == 'na')
    scale = "Nao se aplica";
  else if (type == 'RASTER')
    scale = scale+"m";
  else if (type == 'VECTOR')
    scale="1:"+(scale+"000").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

  return scale;
};

var getYearMultiple = function(layer){
  var maior;
  var menor;

  layer.fileObj.forEach(function(dateMultiple){
    dateSplit = dateMultiple.date.split("/");

    if (dateSplit.length>1)
      yearDate = dateSplit[2];
    else
      yearDate = dateSplit[0];

    if (maior === undefined)
      maior=yearDate;
    else if (yearDate>maior)
      maior=yearDate;

    if(menor === undefined)
      menor = yearDate;
    else if(yearDate<menor)
      menor=yearDate;
    });

  var yearMultiple = menor+" - "+maior;

return yearMultiple;    

};

var setLayers = function(layersDir, layers, callback) {
  var eachTask = function(layer, next) {
    checkLayerType(layersDir, layer, function(type) {
      layer.type = type;
      layer.source = getSource(layer); 

      if(layer.type == 'RASTER' || layer.type == 'VECTOR') {
        layer.year = getYear(layer);
        layer.scale = getScale(layer);
      };
      
      if(layer.type == 'MULTIPLE') { 
        getLayerMultipleFiles(layersDir, layer, function(fileObj) {

          layer.fileObj = fileObj;
          layer.scale = getScaleMultiple(layer);
          layer.year = getYearMultiple(layer);

          next();
        });
      } else {
        next();
      }
    });
  }

  var finalize = function() {
    callback(layers);
  }

  async.each(layers, eachTask, finalize);
}

var writeMapFile = function(layer, info, isMultiple, callback) {

  processingScale = '';
  offsite = '';
  if (info.values) {
    processingScale = '  PROCESSING "SCALE='+info.values.min+','+info.values.max+'"\n';
    console.log(processingScale)
    if(info.values.bandCount >= 3)
      offsite = '  OFFSITE 0 0 0\n';
    
    delete info.values;
  }

  var filter = ''
  /*if (layer.type == 'VECTOR') {
    filter =  '  VALIDATION\n'
            + '    "CQL_FILTER" "."\n'
            + '    "DEFAULT_CQL_FILTER" \'"TRUE"="TRUE"\'\n'
            + '  END\n'
            + '  FILTER (%CQL_FILTER%)\n';
  }*/

  var style = 'CLASS\n'
  +'NAME "0.00" \n'
  +'EXPRESSION ([pixel] = 0.00)\n'
  +'STYLE\n'
    +'COLOR "#ffffff" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.01 - 0.07" \n'
  +'EXPRESSION ([pixel] > 0.01 AND [pixel] <= 0.07)\n'
  +'STYLE\n'
    +'COLOR "#cafa07" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.08 - 0.14" \n'
  +'EXPRESSION ([pixel] > 0.07 AND [pixel] <= 0.14)\n'
  +'STYLE\n'
    +'COLOR "#f8b500" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.15 - 0.21" \n'
  +'EXPRESSION ([pixel] > 0.14 AND [pixel] <= 0.21)\n'
  +'STYLE\n'
    +'COLOR "#f87b00" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.22 - 0.28" \n'
  +'EXPRESSION ([pixel] > 0.21 AND [pixel] <= 0.28)\n'
  +'STYLE\n'
    +'COLOR "#78fb03" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.29 - 0.35" \n'
  +'EXPRESSION ([pixel] > 0.28 AND [pixel] <= 0.35)\n'
  +'STYLE\n'
    +'COLOR "#1dca14" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.36 - 0.42" \n'
  +'EXPRESSION ([pixel] > 0.35 AND [pixel] <= 0.42)\n'
  +'STYLE\n'
    +'COLOR "#00f800" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.43 - 0.49" \n'
  +'EXPRESSION ([pixel] > 0.07 AND [pixel] <= 0.49)\n'
  +'STYLE\n'
    +'COLOR "#009700" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.50 - 0.56" \n'
  +'EXPRESSION ([pixel] > 0.49 AND [pixel] <= 0.56)\n'
  +'STYLE\n'
    +'COLOR "#004000" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.57 - 0.63" \n'
  +'EXPRESSION ([pixel] > 0.56 AND [pixel] <= 0.63)\n'
  +'STYLE\n'
    +'COLOR "#f65833" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.64 - 0.70" \n'
  +'EXPRESSION ([pixel] > 0.63 AND [pixel] <= 0.70)\n'
  +'STYLE\n'
    +'COLOR "#fa0202" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.71 - 0.77" \n'
  +'EXPRESSION ([pixel] > 0.70 AND [pixel] <= 0.77)\n'
  +'STYLE\n'
    +'COLOR "#600000" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.78 - 0.84" \n'
  +'EXPRESSION ([pixel] > 0.56 AND [pixel] <= 0.84)\n'
  +'STYLE\n'
    +'COLOR "#f85f9d" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "0.85 - 0.91" \n'
  +'EXPRESSION ([pixel] > 0.84 AND [pixel] <= 0.91)\n'
  +'STYLE\n'
    +'COLOR "#9f06ba" \n'
  +'END\n'
+'END\n'
+'CLASS\n'
  +'NAME "> 0.91" \n'
  +'EXPRESSION ([pixel] > 0.91)\n'
  +'STYLE\n'
    +'COLOR "#710b70" \n'
  +'END\n'
+'END\n'

  var mapContent =  'LAYER\n'
                  + '  NAME "{name}"\n'
                  + '  DATA "{data}"\n'
                  + '  EXTENT {extent}\n'
                  + '  METADATA\n'
                  + '    "ows_title" "{title}"\n'
                  + '    "ows_abstract" "{description}"\n'
                  + '    "gml_exclude_items" "the_geom"\n'
                  + '    "gml_include_items" "all"\n'
                  + '    "gml_geometries"  "the_geom"\n'
                  + '  END\n'
                  + '  PROJECTION\n'
                  + '    "init=epsg:{proj}"\n'
                  + '  END\n'
                  + '  STATUS ON\n'
                  + '  TYPE {type}\n'
                  + '  TEMPLATE "DUMMY"\n'
                  + filter
                  + offsite
                  //+ processingScale
                  //+style
                  + 'END\n';
  

  var extension = (layer.type == 'VECTOR') ? '.shp' : '.tif';
  var title = (isMultiple) ? layer.name + ' - ' + layer.date : layer.name;

  var params = {
      'name': layer._id
    , 'description': layer.description.replace(/\'/g, "\\'").replace(/\"/g, '\\"')
    , 'data': path.join(layer.subject, layer._id + extension)
    , 'title': title
    , 'extent': info.extent
    , 'type': info.type
    , 'proj': info.epsgCode
  }

  var content = printf(mapContent, params);
  var mapfilePath = getFilePath(layer,'.map')

  console.log(mapfilePath);
  fs.writeFileSync(mapfilePath, content);
  callback();

}

var getFilePathRegexSpaces = function(layer, extension) {
  return getFilePath(layer, extension).replace(/\ /g, '\\ ');
}

var getFilePath = function(layer, extension) {
  return path.join(layersDir, layer.subject, layer._id + extension);
}

var getLayerFileInfo = function(layer, callback) {

  var info = {
    epsgCode: '4674' // FIXME: Fixed projection
  };

  if(layer.type == 'VECTOR') {
    
    var layerShpPath = getFilePathRegexSpaces(layer, '.shp');
    var cmd = printf("ogrinfo -so -ro {0} {1} | grep -E 'Extent|Geometry' | cut -d':' -f2", [ layerShpPath, layer._id ]);

    var output = child_process.execSync(cmd, { encoding: 'utf-8' });
    split = output.split(/\n/);
    
    info.type = split[0].trim().replace('3D ', '')
                                   .replace(' String', '');

    info.extent = split[1].replace(') - (',' ')
                  .replace('(', '')
                  .replace(')', '')
                  .replace(',', '')
                  .replace(',', '');

    callback(info);
  } else if(layer.type == 'RASTER') {
    var layerTifPath = getFilePathRegexSpaces(layer, '.tif');

    var cmd = printf("gdalinfo -stats -norat {0} | grep -E 'Lower\ Left|Upper\ Right|STATISTICS_MAXIMUM|STATISTICS_MINIMUM' | cut -d')' -f1 | cut -d'(' -f2", [ layerTifPath ]);

    var output = child_process.execSync(cmd, { encoding: 'utf-8' });
    split = output.split(/\n/);

    coord1 = split[0].replace(',', '').trim();
    coord2 = split[1].replace(',', '').trim();
    max = split[2].split('=')[1].trim();
    min = split[3].split('=')[1].trim();

    info.values = {};
    info.values.min = (Number(min) == 0) ? '0.0001' : min;
    info.values.max = max;

    info.values.min = info.values.min.replace(',','.')
    info.values.max = info.values.max.replace(',','.')

    var cmdBandCount = printf("gdalinfo {0} | grep 'Band ' | wc -l ", [ layerTifPath ]);
    var bandCount = Number(child_process.execSync(cmdBandCount, { encoding: 'utf-8' }));

    info.values.bandCount = bandCount;

    info.type = 'Raster';
    info.extent = printf("{0} {1}", [coord1, coord2]);

    callback(info);
  }
}

var createMapFile = function(layers, callback) {

  var resultLayers = [];

  var onEach = function(layer, next) {
    if(layer.type == 'NOT-EXISTS') {
      next();
    } else if(layer.type != 'MULTIPLE') {
      getLayerFileInfo(layer, function(info) {
        writeMapFile(layer, info, false, function() {
          var extent = [];
          var extentArray = info.extent.trim().split(' ');
          extentArray.forEach(function(e) {
            if(e != '')
              extent.push(e);
          })

          layer.extent = extent;
          layer.epsgCode = info.epsgCode;
          resultLayers.push(layer);
          next();
        });
      });
    } else {
      
      var onEachFileObj = function(file, nextFileObj) {
        var tmpLayer = _.clone(layer);

        tmpLayer.subject = path.join(layer.subject, layer._id);
        tmpLayer._id = file.name;
        tmpLayer.date = file.date;
        tmpLayer.type = file.type;

        getLayerFileInfo(tmpLayer, function(info) {
          writeMapFile(tmpLayer,info, true, function() {
            var extent = [];
            var extentArray = info.extent.trim().split(' ');
            extentArray.forEach(function(e) {
              if(e != '')
                extent.push(e);
            })

            layer.extent = extent;
            layer.epsgCode = info.epsgCode;
            nextFileObj();
          });
        });
        
      }

      var onCompleteFileObj = function() {
        resultLayers.push(layer);
        next()
      }

      async.eachSeries(layer.fileObj, onEachFileObj, onCompleteFileObj)
    }

  }

  var onComplete = function() {
    callback(resultLayers);
  }
  async.eachSeries(layers, onEach, onComplete);
}

var layersDir = '/home/fernanda/Documentos/Projeto/Dados_local'
//var layersDir = "/run/user/1000/gvfs/smb-share\:server\=10.0.0.11\,share\=mapa_interativo\,user\=fernanda.stefani/PROCESSO/DADOS\ GEOGRÁFICOS/DADOS\ PRONTOS/"
var filepath = 'layers.csv';
var layerCollectionName = "layers"
var dbUrl = 'mongodb://localhost:27017/lapig-maps';

parseCsv(filepath, function(layers) {
    setLayers(layersDir, layers, function(layers) {
        createMapFile(layers, function() {
          insertLayers(dbUrl, layerCollectionName, layers, function() {});
        });
    })
});
