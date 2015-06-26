var Di = require('./');

/**
 * @method PromiseDi
 * @describe A wrapper around the asynchronous promise API.
 * @param {string} name
 * @param {boolean|object} options
 * @returns {object} instance
 */

function PromiseDi(name, options) {
  options = options || {};
  options.method = require('./methods/promise');
  return Di(name, options);
}

module.exports = PromiseDi;
