describe('Dependency injection', function () {
  var Di = require('../lib/di');

  var reader = [function () {
    return {
      read : function (start, end) {
        return [start,'-', end].join('');
      }
    }
  }];

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

  it('provides arrays', function () {
    var mod = new Di();
    mod.provide('util.reader', reader);
    assert.ok(_.isObject(mod.util.reader));
    assert.ok(_.isFunction(mod.util.reader.read));
  })

  it ('provides functions', function (done) {
    var mod = new Di();
    mod.provide('utilReader', reader);
    assert.ok(_.isFunction(mod.utilReader.read));

    mod.provide('read', function (utilReader) {
      return function () {
        var val = utilReader.read(0,1);
        assert.equal(val, '0-1');
        done()
      }
    });

    var read = mod.get('read');
    assert.ok(_.isFunction(read));
    read();
  })

  it ('throws an error when a dependency cannot be resolved', function () {
    var mod = new Di();
    var _testFunction = function () {
      mod.provide('test', function (unknownDependency) {
        throw new Error('unknownDependency resolved');
      });
    };
    assert.throws(_testFunction, 'could not resolve "unknownDependency"');
  })

  it ('throws an error in case of circular dependencies', function () {
    var mod = new Di('test');
    var _testFunction = function () {
      mod.provide('unknownDependency', function () {
        return true;
      });
      mod.provide('test', function (unknownDependency, test) {
        return true;
      });
    };
    assert.throws(_testFunction, 'Circular reference detected: test -> test');
  })

  it ('does not throw an error with correct syntax', function (done) {
    var mod = new Di();
    var _testFunction = function () {
      mod.provide('test',[function (unknownDependency) {
        return 'ok';
      }]);
    };
    _testFunction();
    var unknownDependency = mod.get('test');
    assert.equal(unknownDependency,'ok');
    done()
  })

  it('allows providing constants and objects, chaining with passthru', function () {
    var mod = new Di();
    var pi2 = (mod.provide('PI',Math.PI).get('PI')) * 2;
    assert.equal(pi2, Math.PI*2);
    var pi3 = (mod.provide('PI3',Math.PI*3, true).get('PI3'));
    assert.equal(pi3, Math.PI*3);
  })

  it ('provides objects as members of the module', function () {
    var mod = new Di('namespace');
    mod.provide('PI2',Math.PI*2)
    assert.equal(mod.PI2, Math.PI*2);
    assert.equal(mod.get('PI2'), Math.PI*2);
    assert.equal(mod.get('namespace.PI2'), Math.PI*2);
  })

  it ('allows to inject a function', function (done) {
    var mod = new Di();
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });

    mod.inject(function(twice) {
      assert.equal(this, mod);
      assert.equal(twice(2),4);
      done()
    });
  })

  it ('allows to inject an array', function (done) {
    var mod = new Di();
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });

    mod.provide('ntimes',['twice',function (twice) {
      return function (i, n) { return twice(i) * n * 0.5; };
    }]);

    mod.inject(['twice','ntimes',function(twice, ntimes) {
      assert.equal(twice(2),4);
      assert.equal(ntimes(2,1),2);
      assert.equal(ntimes(2,2),4);
      done()
    }]);
  });

  it ('allows to pass an array and every other object thru', function () {
    var mod = new Di();
    mod.provide('Numbers', [1,2,3,4], true);
    assert.deepEqual(mod.Numbers, [1,2,3,4]);
    mod.provide('String', 'String', true);
    assert.deepEqual(mod.String, 'String');
    mod.provide('nll', null, true);
    assert.deepEqual(mod.nll, null);
  });

  it ('allows to inject items with different names (arrays)', function (done) {
    var mod = new Di();

    var fn = ['util.reader', function (reader) {
      var val = reader.read(0,1);
      assert.equal(val,'0-1');
      done();
    }];

    mod.provide('util.reader', reader);
    assert.ok(mod.util);
    assert.ok(mod.util.reader);
    mod.inject(fn);
  });

  it ('can initialize in a lazy way', function () {
    var mod = new Di(null, true);
    mod.provide('ntimes',['twice',function (twice) {
      return function (i, n) { return twice(i) * n * 0.5; };
    }]);
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });
    mod.provide('fourtimes',function () {
      return function (i) { return i*4; };
    });

    assert.ok(!mod.ntimes);
    assert.ok(!mod.twice);
    mod.resolve();

    assert.ok(mod.ntimes);
    assert.ok(mod.twice);
  })

  it ('throws an error in case of circular dependencies (lazy)', function () {
    var mod = new Di('test', true);
    var _testFunction = function () {
      mod.provide('test', function (unknownDependency, test) {
        return true;
      });
      mod.provide('unknownDependency', function () {
        return true;
      });

    };
    _testFunction();
    assert.throws(mod.resolve, 'Circular reference detected: test -> test');
  })

  it ('can initialize in a lazy way with namespaces', function () {
    var mod = new Di(null, true);

    mod.provide('math.fourtimes',['math.twice',function (twice) {
      return function (i) { return twice(i) + twice(i); };
    }]);

    mod.provide('ntimes',['math.twice',function (twice) {
      return function (i, n) { return twice(i) * n * 0.5; };
    }]);

    mod.provide('math.twice',function () {
      return function (i) { return i*2; };
    });

    mod.resolve();

    assert.ok(mod.ntimes);
    assert.ok(mod.math.twice);
  })

  it ('can inject functions and provides modules after resolve()', function () {
    var mod = new Di(null, true);

    var fourtimesCalled = 0
      , ntimesCalled = 0
      , twiceCalled = 0;

    mod.provide('math.fourtimes',['math.twice',function (twice) {
      fourtimesCalled++;
      return function (i) { return twice(i) + twice(i); };
    }]);

    mod.provide('ntimes',['math.twice',function (twice) {
      ntimesCalled++;
      return function (i, n) { return twice(i) * n * 0.5; };
    }]);

    mod.provide('math.twice',function () {
      twiceCalled++;
      return function (i) { return i*2; };
    });

    mod.resolve();

    assert.ok(mod.ntimes);
    assert.ok(mod.math.twice);

    assert.equal(fourtimesCalled, 1);
    assert.equal(ntimesCalled, 1);
    assert.equal(twiceCalled, 1);

    mod.provide('test', function () {
      return true;
    });
    // mod.resolve();

    assert.equal(mod.test, true);

    assert.equal(fourtimesCalled, 1);
    assert.equal(ntimesCalled, 1);
    assert.equal(twiceCalled, 1);
  })


  it ('can inject functions with arguments', function (done) {
    var mod = new Di();
    var myFunction =  function () {
      for (var i = 1; i < 5; ++i)  assert.equal(arguments[i-1],i);
       done();
    };
    mod.inject(myFunction, 1,2,3,4);
  })

  it ('can inject functions with arguments in a lazy way', function (done) {
    var mod = new Di(null, true);
    var myFunction =  function () {
      for (var i = 1; i < 5; ++i)  assert.equal(arguments[i-1],i);
       done();
    };
    mod.inject(myFunction, 1,2,3,4);
    setTimeout(function () {
      mod.resolve();
    },10)
  })

  it ('can run functions with arguments and get its return value (never lazy)', function (done) {
    var mod = new Di(null, true);
    var myFunction =  function (twice) {
      return function (a) {
        return twice(a) * 2;
      };
    };
    mod.provide('myFunction',myFunction);
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });

    mod.resolve();
    setTimeout(function () {
      var val = mod.run(function (myFunction, a) {
        assert.ok(_.isFunction(arguments[0]));
        assert.ok(_.isNumber(arguments[1]));
        return myFunction(a);
      },20);
      assert.equal(val, 80);
      done();
    },100);
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
})
