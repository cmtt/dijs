Dijs
----

Dijs is a small dependency injection module for Node.js and browser environments. It was inspired
by [AngularJS](http://www.angularjs.org/).

# Usage

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
    }
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

## Reference

# new Di (moduleId, lazy)

Creates a new namespace. When a module id is defined, all sub-modules are available with this
prefix. When lazy is set to true, you will need to call resolve() manually to resolve the
dependency graph which might be useful for application initialization.

# Di.provide(id, object, passthrough)

Provides a module in the namespace under the supplied id. If passthrough is true, the object will
be passed without any dependency lookup.

If passthrough is not set, you can choose between the function and the array notation. In any case,
the function parameters are the declared dependencies. Its return value will be stored in the
namespace.

Sub-modules can be provided with the dot delimiter:

````js
var mod = new Di();
mod.provide('module.submodule.value', 1, true);

// { submodule : { value : 1 } }
console.log(mod.get('module'));
````

In order to provide a module with dependencies, two notations can be used:

## function notation

Each function parameter represents a dependency. You cannot inject dot-delimited dependencies in
this notation.

````js
var mod = new Di();
mod.provide('Pi',Math.PI, true);
mod.provide('2Pi', function (Pi) { return 2*Pi; });
````

## array notation (AngularJS minification safe)

A module is represented as array with uneven length. Dependencies are represented by strings, the
actual module function must be the last value of the array. You can also inject dot-delimited
dependencies.

````js
var mod = new Di();
mod.provide('Math.Pi',Math.PI, true);
mod.provide('2Pi', ['Math.Pi', function (Pi) {
  return function () {
    return 2*Pi;
  };
}]);

````

# Di.resolve()

Resolves the current queue. You will need to call this function after all provide() calls if you
have defined the namespace with the lazy parameter.

Please note that all subsequent calls to provide/inject and run will resolve the dependency graph
immediately.

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

# Di.inject(fn)

Resolves all dependencies of the supplied function or array and calls the function. No modification
of the namespace takes place.

# Di.run(fn)

Resolves all dependencies of the supplied function or array, calls the function and returns the
return value. No modification of the namespace takes place.

# Di.get(id)

Returns the (previously declared) module specified by id.

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
