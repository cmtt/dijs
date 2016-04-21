/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var CallbackMethod = __webpack_require__(2);
	var Namespace = __webpack_require__(4);
	var Resolver = __webpack_require__(3);
	var FN_RGX = /function(\s*)(\w*)[^(]*\(([^)]*)\)/m;

	if (typeof window !== 'undefined') window.Di = Di;
	module.exports = Di;

	/**
	 * @method Di
	 * @param {string} name
	 * @param {object} options
	 * @returns {object} namespace
	 */

	function Di(name, options) {
	  options = options || { method : CallbackMethod };

	  var queue = [];
	  var namespace = new Namespace(name);
	  var $injector = null;

	  namespace.$parseArgs = parseArgs;
	  namespace.$provide = $provide;
	  namespace.$resolve = function () {
	    return $injector.apply(this, [queue].concat([].slice.apply(arguments)));
	  };

	  $injector = options.method(namespace, options);
	  return namespace;

	  /**
	   * Parses a function and returns an array of its parameters
	   * @param {function()} fn
	   * @return {string[]}
	   */

	  function parseFn(fn) {
	    var s = fn.toString();
	    var matches = FN_RGX.exec(s);
	    if (!matches) return null;
	    var params = [];
	    if (matches[3].length) params = matches[3].split(/\s*,\s*/);
	    return params;
	  }

	  /**
	   * @method parseArray
	   * @description Parses a minification-safe dependency notation, an array of
	   * strings, ending with a function.
	   * @param {...string, function} fn
	   * @return {Object}
	   */

	  function parseArray(fn) {
	    var params = [];
	    for (var val, i = 0, l = fn.length; i < l; ++i) {
	      if (typeof fn[i] === 'function') { fn = fn[i]; break; }
	      params.push(fn[i]);
	    }
	    return {
	      fn : fn,
	      params : params
	    };
	  }

	  /**
	   * @method parseArgs
	   * @param {*} fn
	   * @returns {object} info
	   */

	  function parseArgs(fn) {
	    var info = null;
	    var params = [];
	    if (!!fn && typeof fn === 'object' && typeof fn.length === 'number') {
	      info = parseArray(fn);
	      fn = info.fn;
	      params = info.params;
	    } else if (typeof fn === 'function') {
	      info = parseFn(fn);
	      params = info.slice();
	    } else {
	      fn = $injector.defaultFunction(arguments[0]);
	    }
	    return {
	      fn : fn,
	      params : params
	    };
	  }

	  /**
	   * @method $provide
	   * @param {string} key
	   * @param {*} fn
	   * @param {boolean} passthrough
	   * @returns {object} this
	   */

	  function $provide(key, fn, passthrough) {
	    var info = null;
	    var params = [];
	    if (passthrough === true) {
	      fn = $injector.defaultFunction(arguments[1]);
	    } else {
	      info = parseArgs(fn);
	      fn = info.fn;
	      params = info.params;
	    }
	    queue.push({
	      key : key,
	      fn : fn,
	      params : params
	    });
	    return this;
	  }

	}



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Resolver = __webpack_require__(3);

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


/***/ },
/* 3 */
/***/ function(module, exports) {

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


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * @method Namespace
	 * @param {string} $id
	 * @returns {object}
	 */

	function Namespace($id) {
	  if (!(this instanceof Namespace)) return new Namespace($id);
	  var RGX = /(\w+)\.?/ig;

	  var namespace = {
	    get $id () {return $id; },
	    $get : $get,
	    $set : $set
	  };

	  /**
	   * @method $get
	   * @param {string} p 
	   */

	  function $get(p) {
	    var ref = namespace;
	    var match = null;
	    var index = -1;
	    while (( match = RGX.exec(p) )) {
	      ++index;
	      var key = match[1];
	      if (!index && key === $id) continue;
	      ref = ref[key] && ref[key];
	    }
	    return ref;
	  }  

	  /**
	   * @method $get
	   * @param {string} p 
	   * @param {*} value
	   */

	  function $set(p, value) {
	    var lastRef = null;
	    var ref = namespace;
	    var match = true;
	    var key = null;
	    var index = -1;

	    while (match) {
	      ++index;
	      match = RGX.exec(p);
	      if (!match) {
	        lastRef[key] = value;
	        break;
	      }
	      key = match[1];
	      if (!index && key === $id) continue;
	      ref[key] = ref[key] || {};
	      lastRef = ref;
	      ref = ref[key];
	    }
	    return namespace;
	  }

	  return namespace;
	}

	module.exports = Namespace;


/***/ }
/******/ ]);