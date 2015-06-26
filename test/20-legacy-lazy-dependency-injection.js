var Di = require('../legacy');

describe('Lazy dependency injections (legacy)', function () {

  it ('can initialize in a lazy way', function () {
    var mod = Di(null, true);

    /* The order of provided modules is not relevant with lazy dependency injection */

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
    mod.$resolve();

    assert.ok(mod.ntimes);
    assert.ok(mod.twice);
  });

  it ('throws an error in case of circular dependencies (lazy)', function () {
    var mod = Di('test', true);
    var _testFunction = function () {
      mod.provide('test', function (unknownDependency, test) {
        return true;
      });
      mod.provide('unknownDependency', function () {
        return true;
      });

    };
    _testFunction();
    assert.throws(mod.$resolve, 'Circular reference detected: test -> test');
  });

  it ('can initialize in a lazy way with namespaces', function () {
    var mod = Di(null, true);

    mod.provide('math.fourtimes',['math.twice',function (twice) {
      return function (i) { return twice(i) + twice(i); };
    }]);

    mod.provide('ntimes',['math.twice',function (twice) {
      return function (i, n) { return twice(i) * n * 0.5; };
    }]);

    mod.provide('math.twice',function () {
      return function (i) { return i*2; };
    });

    mod.$resolve();

    assert.ok(mod.ntimes);
    assert.ok(mod.math.twice);
  });

  it ('can inject functions, provides modules after resolve()ing instantly', function () {
    var mod = Di(null, true);

    var fourtimesCalled = 0;
    var ntimesCalled = 0;
    var twiceCalled = 0;

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

    mod.$resolve();

    assert.ok(mod.ntimes);
    assert.ok(mod.math.twice);

    assert.equal(fourtimesCalled, 1);
    assert.equal(ntimesCalled, 1);
    assert.equal(twiceCalled, 1);

    mod.provide('test', function () {
      return true;
    });

    // this is now not needed anymore, as Dijs revolves now all dependencies
    // instantly:

    // mod.$resolve();

    assert.equal(mod.test, true);

    // Check if the functions have been called solely once

    assert.equal(fourtimesCalled, 1);
    assert.equal(ntimesCalled, 1);
    assert.equal(twiceCalled, 1);
  });

  it ('can inject functions with dependencies and additional arguments (minification-safe syntax)', function (done) {
    var mod = Di(null, true);

    var myFunction = function (sprintf) {
      var args = [].slice.apply(arguments).slice(1);
                  args.unshift('%d to %d to %d to %d');
      assert.equal(sprintf.apply(sprintf, args), '1 to 2 to 3 to 4');
      done();
    };
    mod.provide('sprintf', util.format, true);
    mod.$resolve();
    mod.inject(['sprintf', myFunction], 1,2,3,4);
  });

  it('provide()s instantly after resolving', function () {
    var mod = Di(null, true);
    mod.provide('math.twice', function () {
      return function (i) { return i*2;};
    });
    mod.$resolve();
    assert.ok(mod.math);
    assert.ok(!mod.math.triple);
    mod.provide('math.triple', function () {
      return function (i) { return i*3;};
    });
    assert.ok(mod.math.triple);
  });

});
