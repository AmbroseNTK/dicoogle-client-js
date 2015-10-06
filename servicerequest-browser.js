
function makeUrl(uri, qs) {
  // create full query string
  var end_url = '';
  if (Array.isArray(uri)) {
    end_url += uri.join('/');
  } else {
    end_url += uri;
  }
  
  var qstring;
  if (!qs) {
    qstring = '';
  } if (typeof qs === 'string') {
    qstring = '?' + qs;
  } else {
    var qparams = [];
    for (var pname in qs) {
      if (Array.isArray(qs[pname])) {
        for (var j = 0; j < qs[pname].length; j++) {
          qparams.push(pname + '=' + encodeURIComponent(qs[pname][j]));
        }
      } else if (qs[pname]) {
        qparams.push(pname + '=' + encodeURIComponent(qs[pname]));
      } else if (qs[name] === null) {
        qparams.push(pname);
      }
    }
    qstring = '?' + qparams.join('&');
  }
  return end_url + qstring;
}

/**
  * send a REST request to the service
  *
  * @param {string} method the http method ('GET','POST','PUT' or 'DELETE')
  * @param {string} uri the request URI
  * @param {string|object} qs the query string parameters
  * @param {function(error,outcome)} callback
  */
module.exports = function service_request(method, uri, qs, callback) {
  var end_url = makeUrl(uri, qs);
  // This XDomainRequest thing is for IE support (lulz)
  var req = (typeof XDomainRequest !== 'undefined') ? new XDomainRequest() : new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      if (req.status !== 200) {
        callback({code: "SERVER-"+req.status, message: req.statusText}, null);
        return;
      }
      var type = req.getResponseHeader('Content-Type');
      var mime = type;
      if (mime.indexOf(";") !== -1) {
        mime = mime.split(";")[0];
      }
      var result;
      if (mime === 'application/json') {
        result = JSON.parse(req.responseText);
        callback(null, result);
      } else {
        result = { type: type, text: req.responseText };
        callback(null, result);
      }
    }
  };
  req.open(method, end_url, true);
  req.send();
};
