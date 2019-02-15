var exec = require('child_process').exec;
var cmd = 'python read_mapfile_with_sld.py pa_br_bioma_5000_2004_ibge /home/fmalaquias/Documentos/Projeto/Dados_local/Vegetação/pa_br_bioma_5000_2004_ibge.map';

exec(cmd, function(error, stdout, stderr) {
  console.log('Deu certo né: ', stdout, stderr)
});