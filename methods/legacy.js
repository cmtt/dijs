var Resolver = require('../lib/resolver');

/**
 * @method LegacyMethod
 * @param {object} namespace
 * @param {object} options
 * @returns {function}
 */

module.exports = function LegacyMethod (namespace, options) {
  var $provide = namespace.$provide;
  var $resolve = namespace.$resolve;

  var resolved = [];
  var injectorQueue = [];

  /**
   * @method $injector
   * @description The original dijs injector for a series of synchronous functions.
   * @param {object[]} queue
   */

  function $injector (queue) {
    var namespace = this;
    var resolver = new Resolver();
    var index = 0;
    queue = queue.concat(injectorQueue);
    while (queue.length) {
      var item = queue.shift();
      resolver.provide(item.key, item.params, item.fn);
      ++index;
    }

    var order = resolver.resolve();
    var items = [];

    order.forEach(function (key) {
      // Do not instantiate again when using inject()
      if (~resolved.indexOf(key)) return;
      items.push(resolver.byId(key));
    });

    // Iterate over dependencies

    items.forEach(function (item) {
      this.$set(item.key, item.payload.apply(namespace, item.params.map(this.$get)));
    }, this);

    resolved = resolved.concat(order);
    queue.length = 0;
    injectorQueue.length = 0;
    return this;
  }

  /**
   * @method defaultFunction
   * @description Getter for passthrough/non-(array|function) arguments.
   * @param {*} value
   * @returns {function}
   */

  $injector.defaultFunction = function (value) {
    return function () { return value; };
  };

  /**
   * @method run
   * @description Resolves all dependencies of the supplied function or array,
   * calls the function with the supplied arguments and
   * _returns its return value_
   */

  namespace.run = function (params) {
    var args = [].slice.apply(arguments).slice(1);
    var info = this.$parseArgs(params);

    /**
     * @method $injectFn
     * @returns {*}
     */

    function $injectFn() {
      var values = [];
      info.params.forEach(function (key, index) {
        var value = namespace.$get(key);
        if(value) values.push(value);
      });
      values = values.concat(args);
      return info.fn.apply(namespace, values);
    }
    var injectFn = $injectFn;

    if (options.lazy) {
      injectorQueue.push({
        params : info.params,
        fn : injectFn
      });
      return;
    }
    return injectFn();
  };

  /**
   * @method inject
   * @description Resolves all dependencies of the supplied function or array and calls the
function.
   * @param {*[]} params
   */

  namespace.inject = function (params) {
    var args = [].slice.apply(arguments).slice(1);
    var info = this.$parseArgs(params);

    var injectFn = function () {
      var values = [];
      info.params.forEach(function (key, index) {
        var value = namespace.$get(key);
        if (typeof value === 'undefined') throw new Error('Not found: ' + key);
        values.push(value);
      });
      values = values.concat(args);
      return info.fn.apply(namespace, values);
    };

    if (options.lazy) {
      injectorQueue.push({
        params : info.params,
        fn : injectFn
      });
      return;
    }
    return injectFn();
  };

  /**
   * @method $resolve
   * @description Resolves all dependencies synchronously.
   */

  namespace.$resolve = function () {
    var retval = $resolve.apply(namespace, arguments);
    if (options.lazy) options.lazy = false; // Disable "lazy" after the initial $resolve call
    return retval;
  };

  /**
   * @method provide
   */

  namespace.provide = function () {
    var retval = $provide.apply(namespace, arguments);
    if (options.lazy === false) this.$resolve();
    return retval;
  };

  return $injector;
};
