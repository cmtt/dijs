dijs
----

dijs is a dependency injection module for Node.js and browser environments. It
was inspired by [AngularJS](http://www.angularjs.org/), includes rudimentary
namespace support and lazy dependency resolution.

Dependency injection might be a useful pattern to organize and struture larger
projects better.
As dependency injection is usually only performed to compose an application,
it shouldn't lead to severe performance drawbacks.

# Usage

In addition, please have a look at spec/10-examples.js.

````js

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
      for (var item, i = 0, l = items.length; i < l; ++i) sum += items[i].price;
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
mod.provide('2Pi', function (Pi) { return 2*Pi; });
````

### array notation (minification-safe)

When your code is going to be minified or if you are about to make use of nested
namespaces, the array notation is safer to use. All dependencies are listed as
strings in the first part of the array, the last argument must be the actual
module function.

````js
var mod = Di();
mod.provide('Math.Pi',Math.PI, true);
mod.provide('2Pi', ['Math.Pi', function (Pi) {
  return function () {
    return 2*Pi;
  };
}]);
````

## Di (moduleId, lazy)

Creates a new namespace. The module id serves as optional prefix for
sub-modules.

In lazy mode, resolve() must be called manually to resolve the dependency graph.
This might be useful for application initialization, as the order of provided
modules is irrelevant in this case.

## Di.provide(id, object, passthrough)

Provides a module in the namespace under the supplied id. If passthrough is
true, the object will be provided without dependency lookup. Even though
everything besides arrays and functions will be passed through, you should
always set passthrough to prevent errors (f.e. with array-like objects like
jQuery elements).

Sub-modules can be provided with the dot delimiter:

````js
var mod = Di();
mod.provide('module.submodule.value', 1, true);

// { submodule : { value : 1 } }
console.log(mod.get('module'));
````

## Di.inject(fn, args...)

Resolves all given dependencies of the supplied function (or array) and calls
the function with the supplied arguments and returns the namespace. No
modification of the namespace takes place.

## Di.run(fn, args...)

Instead of providing, this function resolves the specified dependencies, calls
fn with the specified arguments and returns its return value afterwards (if not
in lazy mode / after resolve()).
No modification of the namespace takes place.

## Di.get(id)

Returns a module specified by id. You can use a dot-delimited string here.

## Di.resolve()

Resolves the dependency graph. This function gets called internally when lazy
dependency resolution is turned off. In lazy mode, it must be called as soon as
the effects of the previous calls to provide(), inject() and run() should take
place.

In this mode, all subsequent calls these functions will be resolved immediately.

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

# Testing

To install all Node.js dependencies and run the unit tests, execute the following
commands:
````
$ npm install
$ gulp mocha
````

# Build
A minified version (1967 bytes, 972 bytes gzipped) is included in the build/ directory.

In addition, you can create a minified build with Google's Closure compiler by
yourself.

Please refer to steida's [gulp-closure-compiler](https://github.com/steida/gulp-closure-compiler)
for further information about the installation of this requirement.

After installation, execute:

````
$ export CLOSURE_PATH=/path/to/your/compiler.jar
$ grunt minify
````

(Note: You will need to replace "/path/to/your" with your compiler.jar's path.)

# Changelog

0.0.3 - 06/21/2014

 - hinting specs and helper files
 - adopting [Universal Module Definition](https://github.com/umdjs/umd)
 - dropping Grunt in favor of Gulp
 - typos

0.0.2 - 05/01/2014

- updated documentation
- more strict syntax
- fixing an error when a function is provided in one line
- tests updated
- updated usage examples

0.0.1 - 04/04/2014

Initial release.

# Contributors

- [7footmoustache](https://github.com/7footmoustache) corrected a spelling mistake

# License
````
          DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                      Version 2, December 2004

   Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

   Everyone is permitted to copy and distribute verbatim or modified
   copies of this license document, and changing it is allowed as long
   as the name is changed.

              DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
     TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

    0. You just DO WHAT THE FUCK YOU WANT TO.
````
