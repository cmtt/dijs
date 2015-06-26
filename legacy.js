var Di = require('./');

/**
 * @method LegacyDi
 * @describe A wrapper around the synchronous legacy API.
 * @param {string} name
 * @param {boolean|object} options
 * @returns {object} instance
 */

function LegacyDi(name, options) {

  if (options === false) {
    options = {
      lazy : false
    };
  } else if (options === true) {
    options = {
      lazy : true
    };
  } else if (typeof options !== 'object') {
    options = {
      lazy : false
    };
  }
  options.method = require('./methods/legacy');
  var instance = Di(name, options);
  instance.get = instance.$get;
  instance.set = instance.$set;
  instance.provide = instance.provide || instance.$provide;
  instance.resolve = instance.resolve || instance.$resolve;
  return instance;
}

module.exports = LegacyDi;
