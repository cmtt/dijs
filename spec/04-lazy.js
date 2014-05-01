describe('Lazy dependency injections', function () {


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

})
