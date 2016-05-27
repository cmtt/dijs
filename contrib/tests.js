'use strict';

/**
 * FIXME: Some of these tests are currently failing
 * due to limitations of function decompilation
 * using regular expressions
 */

module.exports = [
  // {
  //   fn: function (a = {foo: 'ba)r', baz: 123}, cb) {return a * 3},
  //   params: ['a','cb']
  // },
  {
    fn: function (b, callback) { callback(null, b + 3); },
    params: ['b', 'callback']
  },
  {
    fn: function (c) { return c * 3; },
    params: ['c']
  },
  {
    fn: function () { return 321; },
    params: []
  },
  {
    fn: function () {},
    params: []
  },
  // {
  //   fn: (foo = {done: (x) => console.log({ value: x })}, bar) => {return foo.done},
  //   params: ['foo','bar']
  // },
  {
    fn: (z, cb) => { cb(null, z + 3); },
    params: ['z', 'cb']
  },
  {
    fn: (c) => { return c * 3; },
    params: ['c']
  },
  {
    fn: () => { return 456; },
    params: []
  },
  {
    fn: () => {},
    params: []
  },
  {
    fn: (a) => a * 3 * a,
    params: ['a']
  },
  // {
  //   fn: d => d * 3 * d,
  //   params: ['d']
  // },
  // {
  //   fn: e => {return e * 3 * e},
  //   params: ['e']
  // },
  {
    fn: (a, b) => a + 3 + b,
    params: ['a', 'b']
  },
  {
    fn: (x, y) => console.log({ value: x * y }),
    params: ['x', 'y']
  }
];
