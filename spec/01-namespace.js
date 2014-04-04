describe ('Namespace', function () {
  var Di = require('../lib/di');

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

    items.getBook = function (id) {
      var l = items.length;
      while (l--) { if (items[l].id === id) return items[l]; }
      return null;
    }

    items.removeBook = function (id) {
      var book = items.getBook(id);
      var index = items.indexOf(book);
      if (~index) items.splice(index, 1);
    };

    return items;
  }

  it ('Creates a namespace with helper functions', function () {
    var mod = new Di();
    _.each(['get','resolve', 'provide','inject','run'], function (key) {
      assert.ok(_.isFunction(mod[key],'Di has function ' + key));
    })
  })

  it ('can pass a function through', function () {
    var mod = new Di();
    mod.provide('price', Price, true);

    assert.equal(mod.price, mod.get('price'));

    assert.ok(_.isFunction(mod.price));

    var price = mod.get('price');
    assert.ok(_.isFunction(price));

    var pen = price(1,'Euro');
    assert.equal(pen.toString(),'1 Euro');
  })

  it ('creates a namespace', function () {
    var mod = new Di();
    var address = { street : 'Plan 7' };
    mod.provide('price', Price, true);
    mod.provide('store.shelf', Shelf);
    mod.provide('store.address', address, true);
    assert.ok(_.isFunction(mod.price));
    assert.ok(_.isObject(mod.store));
    assert.ok(_.isArray(mod.store.shelf));
    assert.equal(mod.store.shelf.length, 0);
    assert.deepEqual(mod.store.address, address);
  })

  it ('creates a store', function () {
    var mod = new Di();
    var address = { street : 'Plan 7' };
    mod.provide('price', Price, true);
    mod.provide('store.shelf', Shelf);
    mod.provide('store.address', address, true);

    mod.store.shelf.addBook('Lord of the rings', 30,'Euro');
    mod.store.shelf.addBook('1981', 3,'Euro');
    assert.equal(mod.store.shelf.length, 2);
    assert.equal(mod.store.shelf.totalSum(), 33);
  })


});
