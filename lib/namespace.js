/**
 * @method Namespace
 * @param {string} $id
 * @returns {object}
 */

function Namespace($id) {
  if (!(this instanceof Namespace)) return new Namespace($id);
  var RGX = /(\w+)\.?/ig;

  var namespace = {
    get $id () {return $id; },
    $get : $get,
    $set : $set
  };

  /**
   * @method $get
   * @param {string} p 
   */

  function $get(p) {
    var ref = namespace;
    var match = null;
    var index = -1;
    while (( match = RGX.exec(p) )) {
      ++index;
      var key = match[1];
      if (!index && key === $id) continue;
      ref = ref[key] && ref[key];
    }
    return ref;
  }  

  /**
   * @method $get
   * @param {string} p 
   * @param {*} value
   */

  function $set(p, value) {
    var lastRef = null;
    var ref = namespace;
    var match = true;
    var key = null;
    var index = -1;

    while (match) {
      ++index;
      match = RGX.exec(p);
      if (!match) {
        lastRef[key] = value;
        break;
      }
      key = match[1];
      if (!index && key === $id) continue;
      ref[key] = ref[key] || {};
      lastRef = ref;
      ref = ref[key];
    }
    return namespace;
  }

  return namespace;
}

module.exports = Namespace;
