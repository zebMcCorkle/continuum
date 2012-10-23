return (function(Continuum){
  function continuum(listener){
    return new Continuum(listener);
  }

  continuum.debug = exports.debug;
  continuum.Continuum = Continuum;

  return continuum;
})(exports.runtime.Continuum);

}).apply(this, function(){
  var exports = {};
  function require(request){
    request = request.replace(/^\.{0,2}\//, '');
    return exports[request];
  }
  return [exports, require];
}());