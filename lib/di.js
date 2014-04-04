function Di (moduleId, _lazy) {
  var queue = [];
  var ERR_NOT_FOUND = 'Not found: ';
  var ERR_CIRCLULAR = 'Circular: ';

  function parseFn(fn) {
    var fnRgx = /function(\s+)?(\w+)?\((.*)\)/m
      , s = fn.toString();
    var matches = fnRgx.exec(s)
      , params = [];
    if (!matches) return null;
    if (matches[3].length) params = matches[3].split(/\s*,\s*/);
    return params;
  }

  function _parseArray(fn) {
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

  function _splitId(id) { return id.split(/\./g); }

  function _getModules (moduleIds, noError) {
    var dependencies = []
      , err = null;

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

  function _queueById (id) {
    var l = queue.length;
    while (l--) {
      if (queue[l].id === id) return queue[l];
    }
    return null;
  }

  function _queueEach (fn) {
    for (var i = 0, l = queue.length; i < l; ++i) {
      fn.call(null, queue[i]);
    }
  }

  function _provide (id, obj) {
    var chunks = _splitId(id)
      , lastChunk = chunks.pop()
      , handle = _namespace;

    for (var chunk, i = 0, l = chunks.length; i < l; ++i) {
      chunk = chunks[i];
      handle = handle[chunk] = handle[chunk] || {};
    }

    handle[lastChunk] = obj;
  }

  var _namespace = {
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
    resolve : function () {
      var resolved = [];

      _queueEach(function (entry) {
        if (entry._resolved) return;
        var retval = _resolveDependency(entry.id, resolved, [],!!entry.run);
        entry._resolved = true;
      });

      for (var i = 0, l = resolved.length; i < l; ++i) {
        var depId = resolved[i]
          , dep = _queueById(depId)
          , modules = _getModules(dep.dependencies, !!dep.run);

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
    inject : function (fn) {
      var args = Array.prototype.slice.apply(arguments).slice(1);
      return _namespace.provide(null, fn, false, true, false, args);
    },
    run : function (fn) {
      var args = Array.prototype.slice.apply(arguments).slice(1);
      return _namespace.provide(null, fn, false, true, true, args);
    }
  };
  return _namespace;
}
if (typeof module !== 'undefined' && module.exports) module.exports = Di;
else this.Di = Di;
