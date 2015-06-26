var Resolver = require('../lib/resolver');

/**
 * @method PromiseMethod
 * @param {object} namespace
 * @param {object} options
 * @returns {function}
 */

module.exports = function PromiseMethod (namespace, options) {

  var adapter = options.adapter;
  if (typeof adapter !== 'function') throw new Error('PromiseMethod needs an adapter.');
  
  var Promise = adapter();
  if (typeof Promise.defer !== 'function') throw new Error('PromiseMethod adapter must provide defer().');

  /**
   * @method $injector
   * @description An injector function for a queue of promises. It handles
   * promises as well as functions which return promises or values.
   * @param {object[]} queue
   */

  function $injector (queue) {
    var namespace = this;
    var resolver = new Resolver();
    var index = 0;
   
    while (queue.length) {
      var item = queue.shift();
      if (!item) return callback(new Error('not found: ' + order[index]));
      if (item.params[item.params.length-1] === 'callback') item.params.pop();
      resolver.provide(item.key, item.params, item.fn);
      ++index;
    }

    var defer = Promise.defer();
    var order = resolver.resolve();
    var items = order.map(resolver.byId);
    next(defer, null);
    return defer.promise;

    /**
     * @method next
     * @description Handles the next queue item or resolves the $injector promise.
     * @param {object} err
     * @private
     */

    function next(defer, err) {
      if (!items.length) return defer.resolve();
      var item = items.shift();
      var deferred = item.payload;

      if (typeof item.payload === 'function') {
        var params = item.params.map(namespace.$get);

        deferred = item.payload.apply(namespace, params);

        if (deferred && typeof deferred === 'object' && typeof deferred.then === 'function') {
          deferred.then(handleResult, handleError);
        } else {
          handleResult(deferred);
        }
      } else {      
        item.payload.then(handleResult, handleError);
      }

      /**
       * @method handleError
       * @param {*} err
       */

      function handleError(err) { defer.reject(err); }

      /**
       * @method handleResult
       * @param {*} val
       */

      function handleResult(val) {
        namespace.$set(item.key, val);
        next(defer, null);
      }

    }
  }
  
  /**
   * @method defaultFunction
   * @description Getter for passthrough/non-promise arguments.
   * @param {*} value
   * @returns {function}
   */

  $injector.defaultFunction = function (value) {
    var defer = Promise.defer();
    defer.resolve(value);
    return defer.promise;
  };

  return $injector;
};
