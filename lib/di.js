;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Di = factory();
  }
})(this, function () {

  /**
   * Returns a new dijs namespace.
   * @param {?string} moduleId
   * @param {?boolean} _lazy
   * @return {Object} _namespace
   */

  function Di (moduleId, _lazy) {
    'use strict';
    var queue = [];
    var ERR_NOT_FOUND = 'Not found: ';
    var ERR_CIRCLULAR = 'Circular: ';

    /**
     * Parses a function and returns an array of its parameters
     * @param {function()} fn
     * @return {Array.<string>}
     */

    function parseFn (fn) {
      var fnRgx = /function(\s*)(\w*)[^(]*\(([^)]*)\)/m;
      var s = fn.toString();
      var matches = fnRgx.exec(s);
      var params = [];
      if (!matches) return null;
      if (matches[3].length) params = matches[3].split(/\s*,\s*/);
      return params;
    }

    /**
     * Parses a minification-safe dependency notation, an array of strings,
     * ending with a function.
     * @param {...string, function()} fn
     * @return {Object}
     */

    function _parseArray (fn) {
      var dependencies = [];
      for (var val, i = 0, l = fn.length; i < l; ++i) {
        if (typeof fn[i] === 'function') {
          fn = fn[i];
          break;
        }
        dependencies.push(fn[i]);
      }

      return {
        fn : fn,
        dependencies : dependencies
      };
    }

    /**
     * Returns an array representation of a dot-delimited string.
     * @param {string} id
     * @return {Array.<string>}
     */

    function _splitId (id) { return id.split(/\./g); }

    /**
     * Returns the specified module ids from the namespace.
     * @param {Array.string} moduleIds
     * @param {boolean} noError suppress throwing ERR_NOT_FOUND
     * @return {Array.<*>}
     */

    function _getModules (moduleIds, noError) {
      var dependencies = [];
      var err = null;

      if (!moduleIds.length) return dependencies;
      for (var i = 0, l = moduleIds.length, dependency; i < l; ++i) {
        err = null;
        dependency = _namespace.get(moduleIds[i]);
        if (dependency) dependencies.push(dependency);
        if (!dependency) err = new Error(ERR_NOT_FOUND + moduleIds[i]);
        if (err && !noError) throw err;
      }
      return dependencies;
    }

    /**
     * Resolves the specified dependency recursively
     * @param {string} id
     * @param {Array.string} resolved already resolved dependencies
     * @param {Array.string} unresolved yet unresolved dependencies
     * @param {boolean} noError suppress throwing ERR_CIRCLULAR
     */

    function _resolveDependency (id, resolved, unresolved, noError) {
      var dep = _queueById(id);
      if (!dep && !noError) throw new Error(ERR_NOT_FOUND + id);
      if (!dep) return;
      if (~resolved.indexOf(dep.id)) return;
      unresolved.push(dep.id);
      dep.dependencies = dep.dependencies || [];
      for (var depId, i = 0, l = dep.dependencies.length; i < l; ++i) {
        depId = dep.dependencies[i];
        if (~resolved.indexOf(depId)) continue;
        if (~unresolved.indexOf(depId)) throw new Error(ERR_CIRCLULAR + dep.id + ' -> ' + depId);
        _resolveDependency(depId, resolved, unresolved, noError);
      }
      resolved.push(dep.id);
      var index = unresolved.indexOf(dep.id);
      unresolved.splice(index, 1);
    }

    /**
     * Returns the specified entry from the dependency queue
     * @param {string} id
     * @return {Object|null}
     */

    function _queueById (id) {
      var l = queue.length;
      while (l--) {
        if (queue[l].id === id) return queue[l];
      }
      return null;
    }

    /**
     * Calls a function for each dependency queue entry
     * @param {function()}
     */

    function _queueEach (fn) {
      for (var i = 0, l = queue.length; i < l; ++i) {
        fn.call(null, queue[i]);
      }
    }

    /**
     * Provides obj under the specified id in _namespace
     * @param {string} id a dot-delimited id
     * @param {*} obj
     */

    function _provide (id, obj) {
      var chunks = _splitId(id);
      var lastChunk = chunks.pop();
      var handle = _namespace;

      for (var chunk, i = 0, l = chunks.length; i < l; ++i) {
        chunk = chunks[i];
        handle = handle[chunk] = handle[chunk] || {};
      }

      handle[lastChunk] = obj;
    }

    var _namespace = {

      /**
       * Returns the specified id from the namespace.
       * @param {string} id a dot-delimited id - moduleId can be included
       * @return {*}
       */

      get : function (id) {
        var handle = _namespace;
        var chunks = _splitId(id);
        if (chunks[0] === moduleId) chunks.shift();
        for (var chunk, i = 0, l = chunks.length; i < l; ++i) {
          chunk = chunks[i];
          if (!handle[chunk]) return null;
          handle = handle[chunk];
        }
        return handle;
      },

      /**
       * Resolves the current dependency queue. Must be called in lazy mode to make
       * all previously calls to provide(), inject() and run() dependencies available.
       * @return {Object} _namespace
       */

      resolve : function () {
        var resolved = [];

        _queueEach(function (entry) {
          if (entry._resolved) return;
          var retval = _resolveDependency(entry.id, resolved, [],!!entry.run);
          entry._resolved = true;
        });

        for (var i = 0, l = resolved.length; i < l; ++i) {
          var depId = resolved[i];
          var dep = _queueById(depId);
          var modules = _getModules(dep.dependencies, !!dep.run);

          if (dep.inject || dep.run) {
            var retval = dep.fn.apply(_namespace, modules.concat(dep.args));
            if (dep.run) return retval;
          } else if (dep.passthru) {
            _provide(dep.id, dep.fn);
          } else {
            _provide(dep.id, dep.fn.apply(_namespace, modules));
          }
        }

        _lazy = false;
        return _namespace;
      },

      /**
       * Provides, injects or runs the specified object/function.
       * @param {string} id
       * @param {Array.<*>|function()} obj
       * @param {boolean} _passthru true if obj should not be parsed
       * @param {boolean} _inject obj should be injected
       * @param {boolean} _run obj should be run
       * @param {Array.*} args arguments to be passed to inject/run
      */

      provide : function (id, obj, _passthru, _inject, _run, args) {
        var dependencies = [], fn = null;
        args = args || [];

        if (_passthru) { fn = obj; }
        else if (typeof obj === 'function') {
          fn = obj;
          dependencies = parseFn(fn);
        } else if (typeof obj === 'object' && typeof obj.length === 'number') {
          var info = _parseArray(obj);
          fn = info.fn;
          dependencies = info.dependencies;
        } else {
          fn = obj;
          _passthru = true;
        }

        var queueEntry = {
          id : id,
          dependencies : dependencies,
          fn : fn,
          passthru : !!_passthru
        };

        if (_inject) queueEntry.inject = true;
        if (_run) queueEntry.run = true;
        if (args) queueEntry.args = args;

        queue.push(queueEntry);
        if (!_lazy) return _namespace.resolve();
        return _namespace;
      },

      /**
       * Convenience method. Injects instead of providing something to the namespace by
       * resolving the specified dependencies, calling fn and returning the namespace.
       * @param {*}
       * @return {Object} _namespace
       */

      inject : function (fn) {
        var args = Array.prototype.slice.apply(arguments).slice(1);
        return _namespace.provide(null, fn, false, true, false, args);
      },

      /**
       * Convenience method. Instead of providing, this function resolves the specified dependencies,
       * calls fn and returns its return value (if not in lazy mode or after revolve() in lazy mode).
       * @return {*} retval Return value of fn
       */

      run : function (fn) {
        var args = Array.prototype.slice.apply(arguments).slice(1);
        return _namespace.provide(null, fn, false, true, true, args);
      }
    };
    return _namespace;
  }
  return Di;
});
