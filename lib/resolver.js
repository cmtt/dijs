'use strict';
const find = require('array-find');
const without = require('array-without');

/**
 * @class Resolver
 * @exports
 */

class Resolver {

  constructor () {
    this.resolved = [];
    this.queue = [];
  }

  get length () {
    return this.queue.length;
  }

  /**
   * @method byId
   * @param {string} id
   */

  byId (id) {
    if (Array.isArray(id)) {
      return id.map((queueId) => this.byId(queueId));
    }
    return find(this.queue, (item) => item.key === id) || null;
  }

  /**
   * @method put
   * @param {string} key
   * @param {*} payload
   */

  put (key, payload) {
    let item = this.byId(key);
    if (!item) {
      throw new Error(`${key} undefined`);
    }
    item.payload = payload;
  }

  /**
   * @method provide
   * @param {string} key
   * @param {string[]} params
   * @param {*} payload
   * @param {string} type
   */

  provide (key, params, payload, type) {
    this.queue.push({ key, params, payload, type });
  }

  /**
   * @method provideObjectNode
   * @param {string} key
   * @param {string[]} params
   * @param {*} obj
   * @param {string} type
   */

  provideObjectNode (key, params, obj, type) {
    let queuedItem = {key, params, type};
    Object.defineProperty(queuedItem, 'payload', {
      get: function () {
        return obj[key];
      }
    });
    this.queue.push(queuedItem);
  }

  /**
   * @static resolveQueue
   * @param {object[]} queue
   * @return {*}
   */

  static resolveQueue (queue) {
    let resolver = new Resolver();
    let item = null;
    for (let i = 0, l = queue.length; i < l; i++) {
      item = queue[i];
      resolver.provide(item.key, item.params, item.fn, item.type);
    }
    return resolver.byId(resolver.resolve());
  }

  /**
   * @method resolve
   * @description Resolves and empties the current queue.
   * @returns {string[]}
   */

  resolve () {
    let resolved = [];
    let _isResolved = (id) => !!(~this.resolved.indexOf(id) || ~resolved.indexOf(id));

    /**
     * @method _resolve
     * @private
     * @param {object} entry
     * @param {string[]} unresolved
     */

    let _resolve = (entry, unresolved) => {
      if (_isResolved(entry.key)) {
        return;
      }
      unresolved.push(entry.key);
      let params = entry.params.slice();
      for (let i = 0, l = params.length; i < l; ++i) {
        let dep = params[i];
        if (_isResolved(dep)) {
          continue;
        }
        if (~unresolved.indexOf(dep)) {
          throw new Error('Circular: ' + entry.key + ' -> ' + dep);
        }
        let queuedItem = this.byId(dep);
        _resolve({
          key: dep,
          params: queuedItem && queuedItem.params || []
        }, unresolved);
      }
      unresolved = without(unresolved, entry.key);
      resolved.push(entry.key);
    };

    for (let j = 0, k = this.queue.length; j < k; ++j) {
      _resolve(this.queue[j], []);
    }
    this.resolved = this.resolved.concat(resolved);
    return resolved;
  }
}

module.exports = Resolver;
