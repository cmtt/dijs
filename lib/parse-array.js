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
