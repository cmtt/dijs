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

By default, all provided values are being set on the dijs instance. This
behavior can be turned off:

````js
  const Di = require('dijs');
  let d = new Di(null, 'Math', { assign : false });

  d.$provide('PI', function (callback) {
    callback(null, Math.PI);
  });
  d.$resolve(function (err) {
    if (err) {
      throw err;
    }
    console.log(`d.PI is undefined`, d.PI === undefined);
    console.log(`d.$get("PI") equals Math.PI`, d.$get('PI') === Math.PI);
  });
});
````

# Usage

## new Di(Method, name, options)

Returns a new dijs instance with the given method (CallbackMethod is the
default one).

## Instance methods

### $get(id)

Returns the (previously provided) sub-module specified by a dot-delimited id.

### $inject(arg)

Calls a function with (already-provided) dependencies. It is required to call
$resolve beforehand.

Dependant on the current resolution method, this function is synchronous or
asynchronous

### $provide(key, object, passthrough)

Provides a module in the namespace with the given key.

If passthrough is set, the object will be just passed through, no dependencies
are looked up this way.

### $resolve()

Resolves the dependency graph.

This method might take a callback function (in case of the default
CallbackMethod) or return a promise with PromiseMethod.

### Di.$set(id, value)

Sets a value in the namespace, specified by a dot-delimited path.

# Resolution methods

By default, dijs uses the asynchronous CallbackMethod in order to resolve
dependencies.

## CallbackMethod

Asynchronous providing and resolving dependencies using Node.js-style callback
functions.

It is expected that the last parameter of your callback functions is called
"callback", "cb" or "next".

This function takes an error (or a falsy value like null) as first argument. The
second argument should be the provided value.

````js
  let d = new Di();
  d.$provide('PI', (callback) => { // alternative names: cb or next
    callback(null, Math.PI);
  });

  d.$resolve((err) => {
    if (err) {
      return done(err);
    }
    assert.equal(d.PI, Math.PI);
    done();
  });
````

## PromiseMethod

Provides and resolves dependencies using the ES2015 Promise API.

````js
  let d = new Di();
  d.$provide('PI', Promise.resolve(Math.PI));
  d.$provide('2PI', (PI) => Promise.resolve(2 * Math.PI));
  d.$resolve().then(() => {
    assert.equal(d['2PI'], 2 * Math.PI);
    done();
  }, (err) => {
    done(err);
  });
````

## SyncMethod

Synchronous way to provide and resolve depdencies.

````js
  let d = new Di(SyncMethod);
  d.$provide('PI', Math.PI);
  d.$provide('2PI', (PI) => 2 * Math.PI);
  d.$resolve();
  assert.equal(d['2PI'], 2 * Math.PI);
````


# License

MIT