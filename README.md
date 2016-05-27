# dijs

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