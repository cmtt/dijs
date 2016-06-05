'use strict';

const Namespace = require('./namespace');
const parseArgs = require('./parse-arguments');
const CallbackMethod = require('../methods/callback');

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

  constructor (Method, name, options) {
    if (typeof Method !== 'function') {
      Method = CallbackMethod;
    }
    options = options || {};
    let namespace = new Namespace(name);
    this.$get = namespace.get.bind(namespace);
    this.$set = namespace.set.bind(namespace);

    // Do not change the namespace's target object to this instace when option.assign is false
    if (options.assign !== false) {
      namespace._root = this;
    }
    this._q = [];
    this._namespace = namespace;
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
    let values = params.map(this.$get);
    if (typeof info.fn !== 'function') {
      return values;
    }
    return info.fn.apply(namespace, values);
  }

}

module.exports = Di;
