# dijs

<div>
  <a href="https://travis-ci.org/cmtt/dijs">
    <img src="https://img.shields.io/travis/cmtt/dijs/develop.svg?style=flat-square" alt="Build Status">
  </a>
  <a href="https://www.npmjs.org/package/dijs">
    <img src="https://img.shields.io/npm/v/dijs.svg?style=flat-square" alt="npm version">
  </a>
  <a href="http://spdx.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/dijs.svg?style=flat-square" alt="npm licence">
  </a>
  <a href="https://coveralls.io/github/cmtt/dijs">
    <img src="https://img.shields.io/coveralls/cmtt/dijs/develop.svg?style=flat-square" alt="Code coverage">
  </a>
  <a href="http://www.ecma-international.org/ecma-262/6.0/">
    <img src="https://img.shields.io/badge/ES-2015-F0DB4F.svg?style=flat-square" alt="ECMAScript 2015">
  </a>
</div>

dijs is a dependency injection framework for Node.js and browser environments.

It is inspired by [AngularJS](http://www.angularjs.org/) 1.x and allows to
choose between synchronous and asynchronous resolution patterns in an
non-opinionated way.

````
This document is currently being rewritten.
````

# Example
````js
  const Di = require('dijs');

  // Initialize a new dijs instance. By default, this will use "CallbackMethod",
  // thus the first argument is "null".
  // The $provide and $resolve methods expect callbacks.

  let d = new Di(null, 'Math');

  d.$provide('PI', function (callback) {
    callback(null, Math.PI);
  });
  d.$provide('2PI', function (PI, callback) {
    callback(null, 2 * PI);
  });
  d.$provide('zero', ['PI', '2PI', function (PI, twoPI, callback) {
    callback(null, PI - (twoPI * 0.5));
  }]);
  d.$resolve(function (err) {
    if (err) {
      throw err;
    }
    console.log(`PI equals Math.PI`, d.PI === Math.PI);
    console.log(`2PI equals 2*PI`, d['2PI'] === 2 * Math.PI);
    console.log(`zero equals 0`, d.$get('Math.zero') === 0);
  });
});
````
# Options
## assign

# Resolution methods

## CallbackMethod

## PromiseMethod

## SyncMethod

# Instance methods

## Di.$get(id)

Returns the (previously provided) sub-module specified by a dot-delimited id.

## Di.$inject(arg)

## Di.$provide(id, object, passthrough)

Provides a module in the namespace under the supplied id. If passthrough is
set, the object will be just passed through, no dependencies are looked up this
way.

## Di.$resolve()

Resolves the dependency graph.

## Di.$set(id, value)

Sets a value in the namespace, specified by a dot-delimited path.

# License

MIT