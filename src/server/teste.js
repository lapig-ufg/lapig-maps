var async = require('async');
var sleep = require('sleep');
var spawn = require('s')

var files = [ '/home/leandro/Tmp/MOD11A2.A2014001.h10v08.005.2014012031825.Clear_sky_days.tif.aux.xml','/home/leandro/Tmp/MOD11A2.A2014001.h10v09.005.2014012031951.Clear_sky_days.tif.aux.xml','/home/leandro/Tmp/MOD11A2.A2014001.h11v09.005.2014012024836.Clear_sky_days.tif.aux.xml' ]

/*array1.forEach(function(a1) {
	array2.forEach(function(a2) {
		console.log(a1 + '-' + a2);
	});
	console.log('finalizou int array2');
});*/

async.each(array1, function(a1, next){
	
	async.each(array2, function(a2, next){
		console.log(a1 + '-' + a2);
		sleep.sleep(10)
		next();		
	});

	console.log('finalizou int array2');
	next();
})