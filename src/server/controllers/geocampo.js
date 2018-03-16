var sqlite3 = require('spatialite').verbose(),
        async = require('async');
module.exports = function(app) {

    var Geocampo = {};
    var Consults = {};
    var config = app.config;

    Consults.getGeocampoDb = function(callback) {
        var geocampoDb = new sqlite3.Database(config.geocampoDb);
        geocampoDb.spatialite(function() {
                callback(geocampoDb);
        });
    }

    Geocampo.pontos = function(request, response) {

        var result = {
            'cobertura': [],
            'bioma': [],
            'fonte': [],
            'ano': [],
            'especificos': [
                "Forrageira",
                "Manejo",
                "Condicao",
                "Cultivo",
                "Solo"
            ]
        }

        var cobertura = [];
        var sqlCobertura = 'SELECT DISTINCT Cobertura from pontos ORDER BY Cobertura';
        var sqlBioma = 'SELECT DISTINCT Bioma from pontos ORDER BY Bioma';
        var sqlFonte = 'SELECT DISTINCT Fonte from pontos Where Fonte != "" ORDER BY Fonte';
        var sqlAno = 'SELECT DISTINCT Ano from pontos Where Ano > 0 ORDER BY Ano';
        
        Consults.getGeocampoDb(function(geocampoDb){
            geocampoDb.all(sqlCobertura, function(err, rows){
                rows.forEach(function(r){
                    result['cobertura'].push(r.Cobertura)
                });

                geocampoDb.all(sqlBioma, function(err, rows){
                    rows.forEach(function(r){
                        result['bioma'].push(r.Bioma)
                    })
                    
                    geocampoDb.all(sqlFonte, function(err, rows){
                        rows.forEach(function(r){
                            result['fonte'].push(r.Fonte)
                        })
                        
                        geocampoDb.all(sqlAno, function(err, rows){
                            rows.forEach(function(r){
                                result['ano'].push(r.Ano)
                            })
                            response.send(result);
                            response.end();
                        });

                    });
                });
            });
        });

    };

    return Geocampo;

}
