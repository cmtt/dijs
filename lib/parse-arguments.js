'use strict';

const parseArray = require('./parse-array');
const introspect = require('introspect');

/**
 * @method parseArguments
 * @param {*} fn
 * @returns {object} info
 */

function parseArguments (fn) {
  let info = null;
  let params = [];
  if (!!fn && typeof fn === 'object' && typeof fn.length === 'number') {
    info = parseArray(fn);
    fn = info.fn;
    params = info.params;
  } else if (typeof fn === 'function') {
    info = introspect(fn);
    params = info.slice();
  }
  return {
    fn: fn,
    params: params
  };
}

module.exports = parseArguments;
