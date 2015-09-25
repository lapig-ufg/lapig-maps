module.exports = function(app) {
  
  var Utils = {};

  Utils.numberFormat = function(nStr, prec, mSep, fSep) {
  	nStr = nStr.toFixed(prec)
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? fSep + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + mSep + '$2');
    }
    return x1 + x2;
}

  return Utils;
}

