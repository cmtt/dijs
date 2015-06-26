dijs
----

dijs is a dependency injection framework for Node.js and browser environments.
It was inspired by [AngularJS](http://www.angularjs.org/) and allows to choose
between synchronous and asynchronous resolution patterns in an non-opinionated way.

# Migrating from previous versions

By default, dijs is now asynchronous. If you want to use the current release
with your existing (synchronous) code, update your require statement as following:

````js
var Di = require('dijs/legacy');
````

In addition, dijs' target specification is currently ECMAScipt 5.1.
You will need to add polyfills for the methods in certain browser environments:

- Array.prototype.map

# Namespacing

Each dijs instance has a new namespace instance at its core. It consists of an
object with getter/setter methods for sub-paths:

````js
  var Namespace = require('dijs/lib/namespace');
  var namespace = new Namespace('home');
  namespace.floor = { chair : true };
  assert.deepEqual(namespace.$get('home.floor'), { chair : true})
  namespace.$set('home.floor.chairColor', 'blue');
  assert.deepEqual(namespace.floor, { chair: true, chairColor: 'blue' });

````

# Asynchronous usage

By default, dijs is asynchronous and expects callback functions. You can supply
arbitrary values, too (see below).    

Note that you'll need to add callback parameters to both $provide and $resolve
calls.

`````js
  var Di = require('dijs');

  var namespace = new Di('home');

  namespace.$provide('floor',function (callback) { 
    callback(null, { chair : true });
  });

  namespace.$provide('floorColor','blue');

  namespace.$provide('home.floor.color',function (floor, floorColor, callback) {
    callback(null, floor.chair ? floorColor : 'red');
  });

  namespace.$resolve(function (err) {
    assert.ok(!err);
    assert.deepEqual(namespace.floor, { chair: true, color: 'blue' });
    assert.deepEqual(namespace.floorColor, 'blue');
    // Everything required has been resolved.
  });

````
# Asynchronous usage with promises

If you prefer the trending promise syntax, you can use the following syntax.
As Promises are currently part of the upcoming ECMAScript standards, they are
not available in all environments.

Therefore, you'll need to supply an adapter which returns new promises.

You can supply your own Promise adapter:

`````js
  var Di = require('dijs/promise');
  var q = require('q');
  var Di = require('../promise');

  /**
   * An adapter must provide a defer() function which returns a new promise.
   */

  var qAdapter = function () { return q; };

  var namespace = new Di('home', { adapter : qAdapter });  

  namespace.$provide('floor',function () {
    var defer = q.defer();
    defer.resolve({ chair : true });
    return defer.promise;
  });

  namespace.$provide('floorColor','blue');

  namespace.$provide('home.floor.color',function (floor, floorColor) {
    var defer = q.defer();
    defer.resolve(floor.chair ? floorColor : 'red');
    return defer.promise;
  });

  namespace.$resolve().then(function () {
    assert.deepEqual(namespace.floor, { chair: true, color: 'blue' });
    assert.deepEqual(namespace.floorColor, 'blue');
    // Everything required has been resolved.
  }, function (err) {
    throw err;
  });

````

# Synchronous usage

If you should use dijs synchronously, you'll be able to inject arbitrary methods
and functions into the new namespace. Please note the require('dijs/legacy') call.

````js

  var Di = require('dijs/legacy');

  function Price (value, currency) {
    return {
      value : value,
      currency : currency,
      valueOf : function () {
        return value;
      },
      toString : function () {
        return this.value + ' ' + this.currency;
      }
    };
  }

  function Shelf (price) {
    var items = [];

    items.totalSum = function () {
      var sum = 0;
      for (var item, i = 0, l = items.length; i < l; ++i) {
        sum += items[i].price;
      }
      return sum;
    };

    items.addBook = function (id, value, currency) {
      items.push({
        id : id,
        price : price(value, currency)
      });
    };

    return items;
  }

  var mod = Di();
  mod.provide('price', Price, true);
  mod.provide('store.shelf', Shelf);
  mod.provide('store.address', { street : 'Plan 7' }, true);
  mod.store.shelf.addBook('1984', 3,'Euro');
  mod.store.shelf.addBook('Lord of the rings', 30,'Euro');
  mod.store.shelf.addBook('Modernist cuisine', 55,'Euro');
  assert.equal(mod.store.shelf.length, 3);

  // Total value 88
  console.log('Total value', mod.store.shelf.totalSum());

````

# Providing literals, raw functions and arrays

dijs injects all values passed to $provide() into the namespace. An important
exception are functions and arrays, they dijs parses them by default (see below).

By adding true as third parameter to $provide, you can pass arbitrary functions
and arrays dependency injection:

````js
  var Di = require('dijs');
  var namespace = Di();
  namespace.$provide('boolean', true);
  namespace.$provide('string', 'string');
  namespace.$provide('null', null);
  namespace.$provide('int', 1);
  namespace.$provide('float', 3.1459);
  namespace.$provide('object', { key : 'value'});

  // Functions and Arrays are being used for dependency injection,
  // therefore add true in order to pass the values through.

  namespace.$provide('log', console.log, true);
  namespace.$provide('array', [1,2,3], true);

  namespace.$resolve(function () {
    assert.equal(namespace.boolean, true);
    assert.equal(namespace.string, 'string');
    assert.equal(namespace.null, null);
    assert.equal(namespace.int, 1);
    assert.equal(namespace.float, 3.1459);
    assert.deepEqual(namespace.object, { key : 'value'});
    assert.deepEqual(namespace.log, console.log);
    assert.deepEqual(namespace.array, [1,2,3]);
    done();
  });
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
  var mod = Di();
  mod.provide('Pi',Math.PI, true);
  mod.provide('2Pi', function (Pi, callback) { callback(null, return 2*Pi); });
````

### array notation (minification-safe)

When your code is going to be minified or if you are about to make use of nested
namespaces, the array notation is safer to use. All dependencies are listed as
strings in the first part of the array, the last argument must be the actual
module function.

````js
  var mod = Di();
  mod.provide('Math.Pi',Math.PI, true);
  mod.provide('2Pi', ['Math.Pi', function (Pi, callback) {
    callback(null, 2*Pi);
  }]);
````

# Reference for the legacy API

## Di (moduleId, options)

Creates a new namespace. The module id is an optional prefix for sub-paths.

### Options

#### lazy {boolean}

By default, dijs expects a call to $resolve() in order to resolve the dependency
graph.

This is the preferred behavior in all asynchronous modes.

## Di.$provide(id, object, passthrough)

Provides a module in the namespace under the supplied id. If passthrough is
true, the object will be just passed through, no dependencies are looked up this
way.

Sub-modules can be provided with the dot delimiter:

````js
  var mod = Di();
  mod.$provide('module.submodule.value', 1, true);
  mod.$resolve(function (err) {
    if (err) throw err;
    assert.deepEqual(mod.$get('module'), { submodule : { value : 1 });
  });
````

If you don't pass a value through, you can choose between the function and the
array notation to describe the module's dependencies (see above).

## Di.$get(id)

Returns the (previously provided) sub-module specified by a dot-delimited id. 

## Di.$set(id, value)

Sets a value in the namespace, specified by a dot-delimited path.

## Di.$resolve(callback)

Resolves the dependency graph. This function gets called internally when lazy
dependency resolution is turned off, but it must be called if the namespace is
initialized in lazy mode.

All subsequent calls to provide/inject and run will resolve the dependency
graph immediately.

````js
var mod = Di('namespace', true);
mod.provide('2Pi', ['Math.Pi', 'Log', function (Pi, Log) {
  return function () {
    Log(2*Pi);
  }
}]);
mod.provide('Math.Pi',Math.PI, true);
mod.provide('Log',console.log.bind(console), true);
mod.resolve();
````

# Creating your own method module

If you want to create your own synchronous or asynchronous resolution patterns,
you can write a **method** module.

See the methods folder for examples.

# Testing

You can run one of the following commands in order to run the unit tests:
````
$ mocha      # in case you have mocha installed globally
$ gulp mocha # in case you have gulp installed globally
````

# Build
A minified version (2701 bytes, 1293 bytes gzipped) is included in the dist/ directory.

In addition, you can create a minified build with Google's Closure compiler
by yourself. Be sure to set the CLOSURE_PATH environment variable, then you can
run the "minify" gulp task.

In order to build dijs and run all unit testa, just execute

````
$ gulp
````

(Be sure to have [Gulp](http://gulpjs.com) installed.)

# Changelog

0.1.0 - 06/26/2015

  - split dijs into different modules
  - dijs is now asynchronous with callbacks by default
  - new Promise method, using arbitrary implementations
  - updated documentation, additional unit tests

0.0.2 - 05/01/2014

 - updated documentation
 - more strict syntax
 - fixing an error when a function is provided in one line
 - tests updated
 - updated usage examples

0.0.1 - 04/04/2014

Initial release.

# License

MIT
