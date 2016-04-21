var CallbackMethod = require('../methods/callback');
var Namespace = require('./namespace');
var Resolver = require('./resolver');
var FN_RGX = /function(\s*)(\w*)[^(]*\(([^)]*)\)/m;

if (typeof window !== 'undefined') window.Di = Di;
module.exports = Di;

/**
 * @method Di
 * @param {string} name
 * @param {object} options
 * @returns {object} namespace
 */

function Di(name, options) {
  options = options || { method : CallbackMethod };

  var queue = [];
  var namespace = new Namespace(name);
  var $injector = null;

  namespace.$parseArgs = parseArgs;
  namespace.$provide = $provide;
  namespace.$resolve = function () {
    return $injector.apply(this, [queue].concat([].slice.apply(arguments)));
  };

  $injector = options.method(namespace, options);
  return namespace;

  /**
   * Parses a function and returns an array of its parameters
   * @param {function()} fn
   * @return {string[]}
   */

  function parseFn(fn) {
    var s = fn.toString();
    var matches = FN_RGX.exec(s);
    if (!matches) return null;
    var params = [];
    if (matches[3].length) params = matches[3].split(/\s*,\s*/);
    return params;
  }

  /**
   * @method parseArray
   * @description Parses a minification-safe dependency notation, an array of
   * strings, ending with a function.
   * @param {...string, function} fn
   * @return {Object}
   */

  function parseArray(fn) {
    var params = [];
    for (var val, i = 0, l = fn.length; i < l; ++i) {
      if (typeof fn[i] === 'function') { fn = fn[i]; break; }
      params.push(fn[i]);
    }
    return {
      fn : fn,
      params : params
    };
  }

  /**
   * @method parseArgs
   * @param {*} fn
   * @returns {object} info
   */

  function parseArgs(fn) {
    var info = null;
    var params = [];
    if (!!fn && typeof fn === 'object' && typeof fn.length === 'number') {
      info = parseArray(fn);
      fn = info.fn;
      params = info.params;
    } else if (typeof fn === 'function') {
      info = parseFn(fn);
      params = info.slice();
    } else {
      fn = $injector.defaultFunction(arguments[0]);
    }
    return {
      fn : fn,
      params : params
    };
  }

  /**
   * @method $provide
   * @param {string} key
   * @param {*} fn
   * @param {boolean} passthrough
   * @returns {object} this
   */

  function $provide(key, fn, passthrough) {
    var info = null;
    var params = [];
    if (passthrough === true) {
      fn = $injector.defaultFunction(arguments[1]);
    } else {
      info = parseArgs(fn);
      fn = info.fn;
      params = info.params;
    }
    queue.push({
      key : key,
      fn : fn,
      params : params
    });
    return this;
  }

}

