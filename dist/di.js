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

	'use strict';

	const Namespace = __webpack_require__(1);
	const parseArgs = __webpack_require__(2);
	const CallbackMethod = __webpack_require__(5);

	/**
	 * @class Di
	 * @exports
	 */

	class Di {

	  /**
	   * @param {function} Method
	   * @param {string} name
	   * @param {object} options
	   */

	  constructor (Method, name, options = {}) {
	    if (typeof Method !== 'function') {
	      Method = CallbackMethod;
	    }
	    let namespace = new Namespace(name);
	    namespace._root = this;
	    this.$get = namespace.get.bind(namespace);
	    this.$set = namespace.set.bind(namespace);
	    this._namespace = namespace;
	    this._q = [];
	    this._injector = new Method(options);
	    this._defaultFunction = Method.defaultFunction;
	  }

	  /**
	   * @method $provide
	   * @chainable
	   * @param {string} key
	   * @param {*} fn
	   * @param {boolean} passthrough
	   */

	  $provide (key, fn, passthrough) {
	    let params = [];
	    if (passthrough === true) {
	      fn = this._defaultFunction(fn);
	    } else {
	      let info = parseArgs(fn);
	      fn = info.fn;
	      params = info.params;
	    }
	    this._q.push({ key, fn, params });
	    return this;
	  }

	  /**
	   * @method $resolve
	   * @param {*}
	   * @return {*}
	   */

	  $resolve (...args) {
	    let $inject = this.$inject.bind(this);
	    let injectorArgs = [this._q, $inject].concat(args);
	    return this._injector.apply(this._namespace, injectorArgs);
	  }

	  /**
	   * @method $inject
	   * @param {*} arg
	   * @returns {[]*}
	   */

	  $inject (arg) {
	    let namespace = this._namespace;
	    let info = parseArgs(arg);
	    let params = info.params;
	    let values = params.map(namespace.get.bind(namespace));
	    if (typeof info.fn !== 'function') {
	      return values;
	    }
	    return info.fn.apply(namespace, values);
	  }
	}

	if (typeof window !== 'undefined') {
	  window.Di = Di;
	}

	module.exports = Di;


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	const RGX_DELIMITER = /(\w+)\.?/ig;

	class Namespace {

	  /**
	   * @param {string} id
	   */

	  constructor (id) {
	    this._root = {};
	    this.id = id;
	  }

	  get id () {
	    return this._id;
	  }

	  set id (id) {
	    this._id = id;
	  }

	  /**
	   * @method get
	   * @param {string} p
	   */

	  get (key) {
	    key = key || '';

	    if (this.cRgx) {
	      key = key.replace(this.cRgx, '');
	    }

	    let ref = this._root;
	    let match = null;
	    let refKey = '';
	    let index = -1;
	    while ((match = RGX_DELIMITER.exec(key))) {
	      ++index;
	      refKey = match[1];
	      if (refKey === this._id && index === 0) {
	        continue;
	      }
	      ref = ref[refKey];
	    }
	    return ref;
	  }

	  /**
	   * @method get
	   * @param {string} p
	   * @param {*} value
	   */

	  set (key, value) {
	    key = key || '';
	    let ref = this._root;
	    let lastRef = this._root;
	    let refKey = '';
	    let index = -1;
	    let match = null;

	    while ((match = RGX_DELIMITER.exec(key))) {
	      ++index;
	      refKey = match[1];
	      if (refKey === this._id && index === 0) {
	        continue;
	      }
	      ref[refKey] = ref[refKey] || {};

	      lastRef = ref;
	      ref = ref[refKey];
	    }

	    lastRef[refKey] = value;
	    return this;
	  }
	}

	module.exports = Namespace;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const parseArray = __webpack_require__(3);
	const introspect = __webpack_require__(4);

	/**
	 * @method parseArguments
	 * @param {*} fn
	 * @param {function} defaultFunction
	 * @returns {object} info
	 */

	function parseArguments (fn, defaultFunction) {
	  let info = null;
	  let params = [];
	  if (!!fn && typeof fn === 'object' && typeof fn.length === 'number') {
	    info = parseArray(fn);
	    fn = info.fn;
	    params = info.params;
	  } else if (typeof fn === 'function') {
	    info = introspect(fn);
	    params = info.slice();
	  } else if (typeof defaultFunction === 'function') {
	    fn = defaultFunction(arguments[0]);
	  }
	  return {
	    fn: fn,
	    params: params
	  };
	}

	module.exports = parseArguments;


/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @method parseArray
	 * @description Parses a minification-safe dependency notation, an array of
	 * strings, ending with a function.
	 * @param {...string, function} arr
	 * @return {Object}
	 */

	function parseArray (arr) {
	  let params = [];
	  let fn = null;

	  for (let val, i = 0, l = arr.length; i < l; ++i) {
	    val = arr[i];
	    if (typeof val === 'function') { fn = val; break; }
	    params.push(val);
	  }
	  return { fn, params };
	}

	module.exports = parseArray;


/***/ },
/* 4 */
/***/ function(module, exports) {

	var isClassRegExp = /class/;
	var hasCtorRegExp = /constructor\s*\(/;
	var argumentsRegExp = /\(([\s\S]*?)\)/;
	var classArgumentsRegExp = /constructor\s*\(([\s\S]*?)\)/;
	var replaceRegExp = /[ ,\n\r\t]+/;

	function findFirstCtor(fn){
	  while (!hasCtorRegExp.test(fn) && isClassRegExp.test(fn)){
	    fn = Object.getPrototypeOf(fn);
	  }
	  return fn;
	}

	module.exports = function (fn) {
	  var isClass = isClassRegExp.test(fn);
	  var regEx = argumentsRegExp;
	  if (isClass){
	    regEx = classArgumentsRegExp;
	    fn = findFirstCtor(fn);
	  }
	  var results = regEx.exec(fn);
	  if (null === results) return [];
	  var fnArguments = results[1].trim();
	  if (0 === fnArguments.length) return [];
	  return fnArguments.split(replaceRegExp);
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const Resolver = __webpack_require__(6);
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
	    for (var i = 0, l = queue.length; i < l; i++) {
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

	    function next (err) {
	      if (err) {
	        return callback(err);
	      } else if (!items.length) {
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
	          return next(err);
	        }
	        namespace.set(item.key, val);
	        nextTick(next);
	      }
	    }
	  }
	}

	module.exports = CallbackMethod;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const find = __webpack_require__(7);
	const without = __webpack_require__(8);

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

	    while (queue.length) {
	      item = queue.shift();
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


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	function find(array, predicate, context) {
	  if (typeof Array.prototype.find === 'function') {
	    return array.find(predicate, context);
	  }

	  context = context || this;
	  var length = array.length;
	  var i;

	  if (typeof predicate !== 'function') {
	    throw new TypeError(predicate + ' is not a function');
	  }

	  for (i = 0; i < length; i++) {
	    if (predicate.call(context, array[i], i, array)) {
	      return array[i];
	    }
	  }
	}

	module.exports = find;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	(function(root) {
	  'use strict';

	  /**
	   * arrayWithout
	   * @param {array} array - original array
	   * @param {array} without - collection to omit
	   * @example
	   * arrayWithout(['a','b','c'], ['a','b','c']); // ['a']
	   */
	  function arrayWithout(a, w) {
	    /*
	     * Allows extension of prototype.
	     * @example
	     * Array.prototype.without = arrayWithout;
	     * ['a','b','c'].without(['a','b','c']); // ['a']
	     */
	    if (Array.isArray(this)) {
	      return arrayWithout.apply(null, [this].concat([].slice.call(arguments)));
	    }

	    a = Array.isArray(a) ? a.slice(0) : [];
	    w = flatten([].slice.call(arguments, 1));
	    for (var i = 0; i < w.length; i++) {
	      var j = a.indexOf(w[i]);
	      if (j > -1) {
	        a.splice(j,1);
	      }
	    }
	    return a;
	  }

	  function flatten(a) {
	    return Array.isArray(a) ? [].concat.apply([], a.map(flatten)) : [a];
	  }

	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = arrayWithout;
	    }
	    exports.arrayWithout = arrayWithout;
	  } else if (typeof define === 'function' && define.amd) {
	    define([], function() {
	      return arrayWithout;
	    });
	  } else {
	    root.arrayWithout = arrayWithout;
	  }

	})(this);


/***/ }
/******/ ]);