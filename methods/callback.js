var Resolver = require('../lib/resolver');

/**
 * @method nextTick
 * @see https://github.com/medikoo/next-tick
 */

var nextTick = (function nextTick () {
  // taken from Node.js
  if ((typeof process !== 'undefined') && process &&
      (typeof process.nextTick === 'function')) { return process.nextTick; }

  // W3C Draft
  // http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
  if (typeof setImmediate === 'function') return function (cb) { setImmediate(cb); };
  // Wide available standard
  if (typeof setTimeout === 'function') { return function (cb) { setTimeout(cb, 0); }; }
  return null;
}());

/**
 * @method CallbackMethod
 * @public
 * @param {object} namespace
 * @param {object} options
 * @returns {function}
 */

module.exports = function CallbackMethod (namespace, options) {

  /**
   * @method $injector
   * @description An injector function for a queue of callback functions.
   * @param {object[]} queue
   */

  function $injector (queue, callback) {
    var namespace = this;
    var resolver = new Resolver();
    var index = 0;
    if (typeof callback !== 'function') throw new Error('E_NO_CALLBACK');

    while (queue.length) {
      var item = queue.shift();
      if (item.params[item.params.length-1] === 'callback') item.params.pop();
      resolver.provide(item.key, item.params, item.fn);
      ++index;
    }

    var order = resolver.resolve();
    var items = order.map(function (key) { return resolver.byId(key);  });

    /**
     * @method next
     * @description Handles the next queue item or calls back.
     * @param {object} err
     * @private
     */

    var next = function (err) {
      if (err) return callback(err);
      var item = items.shift();
      if (!item) return callback(null);

      var values = item.params.map(namespace.$get);

      /**
       * @method $injectorCallback
       * @param {object} err
       * @param {*} val
       * @exports
       */

      function $injectorCallback (err, val) {
        if (err) return next(err);
        namespace.$set(item.key, val);
        nextTick(function () { next(null); });
      }
      values.push($injectorCallback);

      nextTick(function () {
        item.payload.apply(namespace, values);
      });
    };

    next(null);
    return namespace;
  }

  /**
   * @method defaultFunction
   * @description Getter for passthrough/non-function arguments.
   * @param {*} value
   * @returns {function}
   */

  $injector.defaultFunction = function (value) {
    return function (callback) { callback(null, value); };
  };

  return $injector;
};
