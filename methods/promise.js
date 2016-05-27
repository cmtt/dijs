'use strict';
const Resolver = require('../lib/resolver');

/**
 * @class PromiseMethod
 * @exports
 */

class PromiseMethod {

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
    return () => Promise.resolve(value);
  }

  /**
   * @method $resolve
   * @param {object[]} queue
   * @param {function} $inject
   * @return {Promise}
   */

  $resolve (queue, $inject) {
    let namespace = this;
    let items = Resolver.resolveQueue(queue);

    return new Promise((resolve, reject) => {
      next();

      /**
       * @method next
       * @private
       */

      function next () {
        if (!items.length) {
          return resolve();
        }

        let item = items.shift();
        let args = $inject(item.params);
        if (typeof item.payload === 'function') {
          let deferred = item.payload.apply(namespace, args);
          if (typeof deferred.then !== 'function') {
            return reject(new Error(`Promise expected:\n\n  ${item.payload}\n`));
          }
          deferred.then(handleResult, reject);
        } else if (item.payload && typeof item.payload.then === 'function') {
          item.payload.then(handleResult, reject);
        } else {
          handleResult(item.payload);
        }

        /**
         * @method handleResult
         * @private
         * @param {*} val
         */

        function handleResult (val) {
          namespace.set(item.key, val);
          next();
        }
      }
    });
  }
}

module.exports = PromiseMethod;
