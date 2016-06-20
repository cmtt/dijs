# dijs

<div>
  <a href="https://travis-ci.org/cmtt/dijs">
    <img src="https://img.shields.io/travis/cmtt/dijs.svg?style=flat-square" alt="Build Status">
  </a>
  <a href="https://www.npmjs.org/package/dijs">
    <img src="https://img.shields.io/npm/v/dijs.svg?style=flat-square" alt="npm version">
  </a>
  <a href="http://spdx.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/dijs.svg?style=flat-square" alt="npm licence">
  </a>
  <a href="https://coveralls.io/github/cmtt/dijs">
    <img src="https://img.shields.io/coveralls/cmtt/dijs/master.svg?style=flat-square" alt="Code coverage">
  </a>
  <a href="http://www.ecma-international.org/ecma-262/6.0/">
    <img src="https://img.shields.io/badge/ES-2015-F0DB4F.svg?style=flat-square" alt="ECMAScript 2015">
  </a>
</div>

dijs is a dependency injection framework for Node.js and browser environments.

It is inspired by [AngularJS](http://www.angularjs.org/) 1.x and allows to
choose between synchronous and asynchronous (using callbacks and promises)
resolution patterns in an non-opinionated way.

Featured on [DailyJS](http://dailyjs.com/2014/05/25/angular-roundup/)

# Example

````js
  const Di = require('dijs');

  class TestClass {
    constructor (PI, RAD_TO_DEG) {
      this.PI = PI;
      this.RAD_TO_DEG = RAD_TO_DEG;
    }

    deg (value) {
      return value * this.RAD_TO_DEG;
    }
  }

  // Initialize a new dijs instance. By default, this will use "CallbackMethod",
  // thus the first argument is "null" (instead providing another method).
  // The $provide and $resolve method expect callback functions.

  let instance = new Di(null)
  .$provideValue('PI', Math.PI)
  .$provide('RAD_TO_DEG', (PI, callback) => callback(null, (180 / PI)))
  .$resolve((err) => {
    if (err) {
      throw err;
    }
    let AnnotatedTestClass = instance.$annotate(TestClass);
    let a = new AnnotatedTestClass();

    // logs 180
    console.log(a.deg(Math.PI));
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

### $provideValue(key, object)

Provides a value in the namespace with the given key (shortcut for $provide
using passthrough).

### $resolve()

Resolves the dependency graph.

This method might take a callback function (in case of the default
CallbackMethod) or return a promise with PromiseMethod.

### $annotate(classFn)

Returns a class which will be initialized with the dependencies stated in
classFn's constructor. When classFn is a function, its parameters are being
resolved to matching dependencies.

This method must called after $resolve().

### $set(id, value)

Sets a value in the namespace, specified by a dot-delimited path.

# Resolution methods

By default, dijs uses the asynchronous CallbackMethod in order to resolve
dependencies. Require them as follwing:

````js
const Di = require('dijs');
const SyncMethod = require('dijs/methods/sync');
const PromiseMethod = require('dijs/methods/promise');
````

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

# Reference

## Notation

If you don't pass a value through, you can choose between the function and the
array notation to describe the module's dependencies. In any case, you will need
to pass a function whose return value gets stored in the namespace. Its
parameters describe its dependencies.

### function notation

To describe a dependency, you can pass a function whose parameters declare the
other modules on which it should depend.

Note: You cannot inject dot-delimited dependencies with this notation.

````js
  var mod = new Di();
  mod.$provide('Pi',Math.PI, true);
  mod.$provide('2Pi', function (Pi, callback) { callback(null, return 2*Pi); });
  // ...
````

### array notation (minification-safe)

When your code is going to be minified or if you are about to make use of nested
namespaces, the array notation is safer to use. All dependencies are listed as
strings in the first part of the array, the last argument must be the actual
module function.

````js
  var mod = new Di();
  mod.$provide('Math.Pi',Math.PI, true);
  mod.$provide('2Pi', ['Math.Pi', function (Pi, callback) {
    callback(null, 2*Pi);
  }]);
  // ...
````

#### notation with "$inject" (minification-safe)

An alternative way is to provide a "$inject" property when using $annotate or
$provide. This requires minification tools being in use not to mangle this key:

````js

  class TestClass {
    constructor (pi) {
      this.RAD_TO_DEG = (180 / pi);
    }

    deg (value) {
      return value * this.RAD_TO_DEG;
    }
  }

  TestClass['$inject'] = ['PI'];

  var mod = new Di();
  mod.$provideValue('PI', Math.PI);
  mod.$resolve((err) => {
    if (err) { throw err; }
    let WrappedTestClass = mod.$annotate(TestClass);
    let instance = new WrappedTestClass();
    console.log(instance.deg(Math.PI * 2)); // 360
  });

  ````

# Namespacing

Each dijs instance has a new namespace instance at its core. Namespaces provide
getter/setter methods for sub-paths:

````js
  var Namespace = require('dijs/lib/namespace');
  var namespace = new Namespace('home');
  namespace.floor = { chair : true };
  assert.deepEqual(namespace.$get('home.floor'), { chair : true})
  namespace.$set('home.floor.chairColor', 'blue');
  assert.deepEqual(namespace.floor, { chair: true, chairColor: 'blue' });
````

Please note that dijs assigns all namespace values to instances. You can disable
this behavior using the "assign" option (see above).

# Usage in the browser

Bundled versions are available in the dist/ folder.

You can create a minified build with Google's Closure compiler by running
````make```` in the project directory.

# License

MIT (see LICENSE)
