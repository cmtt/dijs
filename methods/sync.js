'use strict';
const Resolver = require('../lib/resolver');
const ResolverError = require('../lib/resolver-error');

/**
 * @class SyncMethod
 * @exports
 */

class SyncMethod {

  /**
   * @param {object} options
   * @return {function} $resolve
   */

  constructor (options) {
    return this.$resolve;
  }

  /**
   * @static
   * @mathod defaultFunction
   * @param {*} value
   * @return {function}
   */

  static defaultFunction (value) {
    return () => value;
  }

  /**
   * @method $resolve
   * @param {object[]} queue
   * @param {function} $inject
   */

  $resolve (queue, $inject) {
    let namespace = this;
    let items = Resolver.resolveQueue(queue);
    let item = null;
    for (var i = 0, l = items.length; i < l; i++) {
      item = items[i];
      if (item === null) {
        let queueItem = queue[i];
        throw new ResolverError(queueItem);
      }
      let args = $inject(item.params);
      let val = null;
      if (typeof item.payload === 'function') {
        val = item.payload.apply(namespace, args);
      } else {
        val = item.payload;
      }
      namespace.set(item.key, val);
    }
  }
}

module.exports = SyncMethod;
