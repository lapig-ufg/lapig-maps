var exec = require('child_process').exec;
var cmd = 'python read_mapfile_with_sld.py pontos /data/catalog/Ocultos/geocampo.map /data/catalog/';

exec(cmd, function(error, stdout, stderr) {
  console.log(stdout)
});