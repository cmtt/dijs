describe('Usage examples', function () {

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



  it ('creates a namespace', function () {
    var mod = new Di('ns');
    var address = { street : 'Plan 7' };
    mod.provide('price', Price, true);
    mod.provide('store.shelf', Shelf);
    mod.provide('store.address', address, true);
    assert.ok(_.isFunction(mod.price));
    assert.ok(_.isObject(mod.store));
    assert.ok(_.isArray(mod.store.shelf));
    assert.ok(_.isFunction(mod.get('price')));
    assert.ok(_.isObject(mod.get('store')));
    assert.ok(_.isArray(mod.get('store.shelf')));
    assert.ok(_.isFunction(mod.get('ns.price')));
    assert.ok(_.isObject(mod.get('ns.store')));
    assert.ok(_.isArray(mod.get('ns.store.shelf')));
    assert.equal(mod.store.shelf.length, 0);
    assert.deepEqual(mod.store.address, address);
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


  it ('creates a store', function () {
    var mod = new Di();
    var address = { street : 'Plan 7' };
    mod.provide('price', Price, true);
    mod.provide('store.shelf', Shelf);
    mod.provide('store.address', address, true);

    mod.store.shelf.addBook('1984', 3,'Euro');
    mod.store.shelf.addBook('Lord of the rings', 30,'Euro');
    mod.store.shelf.addBook('Modernist cuisine', 55,'Euro');
    assert.equal(mod.store.shelf.length, 3);
    assert.equal(mod.store.shelf.totalSum(), 88);
  })

  it ('can compose a simple application', function () {
    var _server = new Di('TransporterServer');

    _server.provide('frame', { e : function () {} })
           .provide('log',console.log, true)
           .provide('connectHandlers',[{id : 1},{id : 2}],true)
           .provide('http', require('http'), true)
           .provide('Flags', {}, true)
           .provide('Ev', {}, true);
    assert.ok(_server.frame);
    assert.ok(_server.log);
    assert.ok(_server.connectHandlers);
    assert.ok(_server.http);
    assert.ok(_server.Flags);
    assert.ok(_server.Ev);
  })


  it ('can compose a simple application (lazy)', function () {
    var _server = new Di('TransporterServer', true);

    _server.provide('frame', { e : function () {} })
           .provide('log',console.log, true)
           .provide('connectHandlers',[{id : 1},{id : 2}],true)
           .provide('http', require('http'), true)
           .provide('Flags', {}, true)
           .provide('Ev', {}, true);
    assert.ok(!_server.frame);
    assert.ok(!_server.log);
    assert.ok(!_server.connectHandlers);
    assert.ok(!_server.http);
    assert.ok(!_server.Flags);
    assert.ok(!_server.Ev);

    _server.resolve();
    assert.ok(_server.frame);
    assert.ok(_server.log);
    assert.ok(_server.connectHandlers);
    assert.ok(_server.http);
    assert.ok(_server.Flags);
    assert.ok(_server.Ev);
  })

  it ('can compose a simple application, provides() afterwards w/o resolving', function () {
    var _server = new Di('TransporterServer', true);

    _server.provide('frame', { e : function () {} })
           .provide('log',console.log, true)
           .provide('connectHandlers',[{id : 1},{id : 2}],true)
           .provide('http', require('http'), true)
           .provide('Flags', {}, true)
           .provide('Ev', {}, true);

    _server.resolve();
    assert.ok(_server.frame);
    assert.ok(_server.log);
    assert.ok(_server.connectHandlers);
    assert.ok(_server.http);
    assert.ok(_server.Flags);
    assert.ok(_server.Ev);
    assert.ok(!_server.provided);
    _server.provide('provided', ['frame',function (frame) {
      return { true : frame};
    }])
    assert.ok(_server.provided);
  })
});
