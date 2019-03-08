var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
  	var ENV_VAR = {}
    if(i == 0) {
    	ENV_VAR = { 'PRIMARY_WORKER': 1 }
    }

    var worker = cluster.fork(ENV_VAR);
  	
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });

} else {
  require('./app.js');
}