/**
 * @param {function} Method
 * @param {string} name
 * @param {object} options
 * @constructor
 */

var Di = function (Method, name, options) {};

/**
 * @param {string} key
 * @param {*} fn
 * @param {boolean} passthrough
 */

Di.prototype.$provide = (key, fn, passthrough) => {};

/**
 * @param {*}
 * @return {*}
 */

Di.prototype.$resolve = () => {};

/**
 * @param {*} arg
 * @returns {[]*}
 */

Di.prototype.$inject = (arg) => {};

/**
 * @param {string} key
 * @returns {*}
 */

Di.prototype.$get = (key) => {};

/**
 * @param {string} key
 * @param {*} value
 */

Di.prototype.$set = (key, value) => {};

/**
 * @constructor
 */

var Resolver = function () {};

/**
 * @param {object[]} queue
 * @return {*}
 */

Resolver.resolveQueue = function (queue) {};

/**
 * @constructor
 * @param {object} options
 * @return {function}
 */

var CallbackMethod = function (options) {};

/**
 * @param {object[]} queue
 * @param {function} $inject
 */

CallbackMethod.prototype.$resolve = function (queue, $inject) {};

/**
 * @param {*} value
 * @return {function}
 */

CallbackMethod.defaultFunction = function () {};
