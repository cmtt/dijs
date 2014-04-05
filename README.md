Dijs
----

Dijs is a small dependency injection module for Node.js and browser environments. It was inspired
by [AngularJS](http://www.angularjs.org/), includes rudimentary namespace support and lazy
dependency resolution.

Dependency injection might be a useful pattern to organize larger projects. As injection happens
only once to compose a namespace, there shouldn't be drawbacks in performance.

# Usage
In addition, please refer to the tests in the spec/ folder.

````js

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

  var mod = new Di();
  mod.provide('price', Price, true);
  mod.provide('store.shelf', Shelf);
  mod.provide('store.address', { street : 'Plan 7' }, true);
  mod.store.shelf.addBook('Lord of the rings', 30,'Euro');
  mod.store.shelf.addBook('1981', 3,'Euro');

  // Total value 33
  console.log('Total value', mod.store.shelf.totalSum());

````

# Reference

## new Di (moduleId, lazy)

Creates a new namespace. The module id serves as optional prefix for sub-modules.

In lazy mode, resolve() must be called manually to resolve the dependency graph. This might be
useful for application initialization, as the order of provided modules is irrelevant in this case.

## Di.provide(id, object, passthrough)

Provides a module in the namespace under the supplied id. If passthrough is true, the object will
be just passed through, no dependencies are looked up this way.

Sub-modules can be provided with the dot delimiter:

````js
var mod = new Di();
mod.provide('module.submodule.value', 1, true);

// { submodule : { value : 1 } }
console.log(mod.get('module'));
````

If you don't pass a value through, you can choose between the function and the array notation to
describe the module's dependencies. In any case, you will need to pass a function whose return value
gets stores in the namespace. Its parameters describe its dependencies.

### function notation

Each function parameter represents a dependency.
Note that you cannot inject dot-delimited dependencies with this notation.

````js
var mod = new Di();
mod.provide('Pi',Math.PI, true);
mod.provide('2Pi', function (Pi) { return 2*Pi; });
````

### array notation

A module is represented as array with uneven length. Dependencies are represented by strings, the
actual module function must be the last value of the array.
You can also inject dot-delimited dependencies and use different variable names for dependencies
with this notation.

````js
var mod = new Di();
mod.provide('Math.Pi',Math.PI, true);
mod.provide('2Pi', ['Math.Pi', function (Pi) {
  return function () {
    return 2*Pi;
  };
}]);
````

## Di.inject(fn)

Resolves all dependencies of the supplied function or array and calls the function. No modification
of the namespace takes place.

## Di.run(fn, args...)

Resolves all dependencies of the supplied function or array, calls the function with the supplied
arguments, returns its return value. No modification of the namespace takes place.

## Di.get(id)

Returns the (previously declared) module specified by id.

## Di.resolve()

Resolves the dependency graph. This function gets called internally when lazy dependency resolution
is turned off, but it must be called if the namespace is initialized in lazy mode.

All subsequent calls to provide/inject and run will resolve the dependency graph immediately.

````js
var mod = new Di('namespace', true);
mod.provide('2Pi', ['Math.Pi', 'Log', function (Pi, Log) {
  return function () {
    Log(2*Pi);
  }
}]);
mod.provide('Math.Pi',Math.PI, true);
mod.provide('Log',console.log.bind(console), true);
mod.resolve();
````

# Testing

To install all Node.js dependencies and run the unit tests, execute the following commands:
````
$ npm install
$ grunt mocha
````

# Build
In addition, you can create a minified build with Google's Closure compiler. This might save you
a few bytes - Dijs is currently below 2 KB minified.

Please refer to gmarty's [grunt-closure-compiler](https://github.com/gmarty/grunt-closure-compiler)
for further information about installation of this requirement.

After installation, execute:

````
$ grunt minify
````

# Licence

        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
