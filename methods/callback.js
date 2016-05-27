'use strict';

const Resolver = require('../lib/resolver');
const RGX_CALLBACK = /^(callback|cb|next)/;
const nextTick = typeof process !== 'undefined' ? process.nextTick : (typeof setImmediate !== 'undefined' ? setImmediate : setTimeout);

/**
 * @class CallbackMethod
 * @exports
 */

class CallbackMethod {

  /**
   * @param {object} options
   * @return {function} $resolve
   */

  constructor (options) {
    return this.$resolve;
  }

  /**
   * @static defaultFunction
   * @param {*} value
   * @return {function}
   */

  static defaultFunction (value) {
    return (callback) => callback(null, value);
  }

  /**
   * @method $resolve
   * @param {object[]} queue
   */

  $resolve (queue, $inject, callback) {
    let namespace = this;

    if (typeof callback !== 'function') {
      throw new Error('No callback');
    }

    let item = null;
    for (let i = 0, l = queue.length; i < l; i++) {
      item = queue[i];
      if (RGX_CALLBACK.test(item.params[item.params.length - 1])) {
        item.params.pop();
      }
    }
    let items = Resolver.resolveQueue(queue);
    next();

    /**
     * @method next
     * @private
     * @param {Error|null} err
     */

    function next () {
      if (!items.length) {
        return callback(null);
      }

      let item = items.shift();

      if (typeof item.payload !== 'function') {
        return $injectorCallback(null, item.payload);
      }

      let args = $inject(item.params);
      args.push($injectorCallback);
      item.payload.apply(namespace, args);

      /**
       * @method $injectorCallback
       * @param {object} err
       * @param {*} val
       * @private
       */

      function $injectorCallback (err, val) {
        if (err) {
          return callback(err);
        }
        namespace.set(item.key, val);
        nextTick(next);
      }
    }
  }
}

module.exports = CallbackMethod;
