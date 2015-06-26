describe('README.md', function () {

  it('creates a namespace with getters/setters', function () {
    var Namespace = require('../lib/namespace');
    var namespace = new Namespace('home');
    namespace.floor = { chair : true };
    assert.deepEqual(namespace.$get('home.floor'), { chair : true})
    namespace.$set('home.floor.chairColor', 'blue');
    assert.deepEqual(namespace.floor, { chair: true, chairColor: 'blue' });
  });

  it('is asynchronous and expects callbacks', function (done) {
    var Di = require('../');
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
      done();
    });
  });

  it('$provide()s literals', function (done) {
    var Di = require('../');
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
  });

  it ('lists books', function () {
    var Di = require('../legacy');
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
  });
  
  it('works with promises', function (done) {
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
      done();
    }, done);
  });

});
