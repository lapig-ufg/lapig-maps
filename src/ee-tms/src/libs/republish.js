module.exports = function(app) {
  
  var configLayer = app.config.layers;
  var db = app.libs.db;
  var Internal = {};
  var Republish = {};
  var pathMapID = app.config.pathCreateMapID;

  Internal.EEAccess = function(layers, callback){
    var layerWithToken = [];
    finishLayers = function(){
      callback(layerWithToken);     
    }

    overLayer = function(layer, nextLayer){

      db.del(layer.id);
      cmd = "python"+" "+pathMapID+" "+layer.collection+" "+layer.startDate+" "+layer.enDate+" "+layer.composite+" "+layer.b_box;     
      console.log(cmd);

      ChildProcess.exec(cmd, function(err, stdout, stderr){ 
        if(stderr){         
            console.log(stderr);
        }       
        stdout=stdout.replace(/'/g, '"');       
        stdout=JSON.parse(stdout);
        layer["token"] = stdout.token;
        db.set(layer.id, layer);
        layerWithToken.push(layer);
        nextLayer();
      });
    }

    async.eachSeries(layers,overLayer,finishLayers);

  }

  Republish.run = function(layers){
    var result = [];
    Internal.EEAccess(layers, function(layerWmtsWithToken){    
    });
  }

  return Republish;

}