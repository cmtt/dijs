/**
 * @method Resolver
 * @returns {object}
 */

function Resolver() {
  var queue = [];

  /**
   * @method getById
   * @param {string} id
   * @private
   */

  function getById (id) {
    for (var i = 0, l = queue.length; i < l; ++i) {
      var item = queue[i];
      if (item.key === id) return item;
    }
    return null;
  }

  /**
   * @method resolve
   * @description Resolves and empties the current queue.
   */

  function resolve() {
    var resolved = [];

    /**
     * @method _resolve
     * @private
     */

    function _resolve(entry, unresolved) {
      if (resolved.indexOf(entry.key) !== -1) return;
      unresolved.push(entry.key);
      var params = entry.params.slice();
      for (var i = 0, l = params.length; i < l; ++i) {
        var dep = params[i];
        if (~resolved.indexOf(dep)) continue;
        if (~unresolved.indexOf(dep)) throw new Error('Circular: '  + entry.key + ' -> ' + dep);
        var queuedItem = getById(dep);
        _resolve({
          key : dep,
          params : queuedItem && queuedItem.params || []
        }, unresolved);
      }
      
      var index = unresolved.indexOf(entry.key);
      if (~index) unresolved.splice(index, 1);
      resolved.push(entry.key);
    }

    for (var j = 0, k = queue.length; j < k; ++j) _resolve(queue[j], []);
    return resolved;
  }

  /**
   * @method provide
   * @param {string} key
   * @param {string[]} dependencies
   * @param {*} payload
   */

  function provide(key, dependencies, payload) {
    queue.push({
      key : key,
      params : dependencies,
      payload : payload
    });
  }

  return {
    byId : getById,
    get length() { return queue.length; },
    provide : provide,
    resolve : resolve
  };
}

module.exports = Resolver;
