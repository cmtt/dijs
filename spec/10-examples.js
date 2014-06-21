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

    items.getBook = function (id) {
      var l = items.length;
      while (l--) { if (items[l].id === id) return items[l]; }
      return null;
    };

    items.removeBook = function (id) {
      var book = items.getBook(id);
      var index = items.indexOf(book);
      if (~index) items.splice(index, 1);
    };

    return items;
  }

  it ('creates a namespace', function () {
    var mod = Di('ns');
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
  });


  it ('can pass a function through', function () {
    var mod = Di();
    mod.provide('price', Price, true);

    assert.equal(mod.price, mod.get('price'));

    assert.ok(_.isFunction(mod.price));

    var price = mod.get('price');
    assert.ok(_.isFunction(price));

    var pen = price(1,'Euro');
    assert.equal(pen.toString(),'1 Euro');
  });

  it ('creates a store', function () {
    var mod = Di();
    var address = { street : 'Plan 7' };
    mod.provide('price', Price, true);
    mod.provide('store.shelf', Shelf);
    mod.provide('store.address', address, true);

    mod.store.shelf.addBook('1984', 3,'Euro');
    mod.store.shelf.addBook('Lord of the rings', 30,'Euro');
    mod.store.shelf.addBook('Modernist cuisine', 55,'Euro');
    assert.equal(mod.store.shelf.length, 3);
    assert.equal(mod.store.shelf.totalSum(), 88);
  });

  it ('can compose a simple application', function () {
    var bookStore = Di('BookStore');
    var logEntries = [];
    console.log(); // ensure \n

    bookStore.provide('sprintf', util.format, true)
             .provide('log', ['sprintf', function (sprintf) {
                return function () {
                  var str = sprintf.apply(sprintf, arguments);
                  logEntries.push(str);
                  console.log(new Array(6).join(' '), str);
                };
             }])
             .provide('price', Price, true)
             .provide('shelf', Shelf)
             .provide('basket', ['log', 'shelf', function (log, shelf) {
                var items = [];

                return {
                  add : function (id) {
                    var book = shelf.getBook(id);
                    if (!book) return log('"%s" is not in our line', id);
                    items.push(book);
                    log('"%s" added to basket, total sum %d', id, this.totalSum());
                  },
                  remove : function (id) {
                    var book = _.find(items, function (book) { return book.id === id; });
                    if (!book) return log('"%s" is not in basket', id);
                    var index = items.indexOf(book);
                    items.splice(index, 1);
                  },
                  list : function () {
                    _.each(items, function (item,i ) {
                      log('#%d : "%s", %d %s' , i+1, item.id, item.price.value, item.price.currency);
                    });
                  },
                  totalSum : function () {
                    return _.reduce(items, function (memo, item) {
                      return memo + (item.price ? item.price.value : 0);
                    }, 0);
                  }
                };
             }]);

    var shelf = bookStore.get('shelf');
    shelf.addBook('1984', 3,'Euro');
    shelf.addBook('Lord of the rings', 30,'Euro');
    shelf.addBook('Modernist cuisine', 55,'Euro');
    shelf.addBook('Seven little Is', 18,'Euro');

    var basket = bookStore.get('basket');
    basket.add('Unknown book');
    basket.add('1984');
    basket.add('Lord of the rings');
    basket.add('Modernist cuisine');

    var fixtures = [
      '"Unknown book" is not in our line',
      '"1984" added to basket, total sum 3',
      '"Lord of the rings" added to basket, total sum 33',
      '"Modernist cuisine" added to basket, total sum 88'
    ];
    assert.deepEqual(logEntries, fixtures);
  });


  it ('can compose a simple application (lazy)', function () {
    var _server = Di('TransporterServer', true);

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
  });
});
